const crypto = require('crypto');
const argon2 = require('argon2');
const pool = require('../config/database');
const { recordAuthAttempt } = require('../middleware/authRateLimiter');
const { logSecurityEvent } = require('../services/auditLogger');
const { IDLE_TIMEOUT_SECONDS, ABSOLUTE_TIMEOUT_SECONDS } = require('../middleware/authMiddleware');

// In-memory temporary tokens for 2-step PIN authentication (short-lived: 3 minutes)
const pendingAuthTokens = new Map();

// Periodic cleanup of expired pending 2FA tokens
setInterval(() => {
  const now = Date.now();
  for (const [token, data] of pendingAuthTokens.entries()) {
    if (now > data.expiresAt) {
      pendingAuthTokens.delete(token);
    }
  }
}, 60 * 1000);

/**
 * Verify Username & Password - Direct Authentication (No PIN Code required)
 */
async function verifyPassword(req, res) {
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username and password are required.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id, username, password_hash, pin_hash, full_name, email, role, is_active FROM admins WHERE username = ?`,
      [username.trim()]
    );

    if (rows.length === 0) {
      await recordAuthAttempt({ ipAddress, identifier: username, success: false, reason: 'UNKNOWN_USER' });
      await logSecurityEvent({ eventType: 'AUTH_FAILED_USER', details: { username }, ipAddress });
      return res.status(401).json({ success: false, error: 'Invalid admin username or password.' });
    }

    const admin = rows[0];

    // Check if account has been deactivated
    if (admin.is_active === 0) {
      await recordAuthAttempt({ ipAddress, identifier: username, success: false, reason: 'ACCOUNT_DEACTIVATED' });
      return res.status(403).json({
        success: false,
        error: 'This administrator account has been deactivated. Please contact the main administrator.'
      });
    }

    const isPasswordValid = await argon2.verify(admin.password_hash, password);

    if (!isPasswordValid) {
      await recordAuthAttempt({ ipAddress, identifier: username, success: false, reason: 'INVALID_PASSWORD' });
      await logSecurityEvent({ adminId: admin.id, eventType: 'AUTH_FAILED_PASSWORD', details: { username }, ipAddress });
      return res.status(401).json({ success: false, error: 'Invalid admin username or password.' });
    }

    // Direct Login Success: Record success and clear failed rate limits
    await recordAuthAttempt({ ipAddress, identifier: admin.username, success: true, reason: 'SUCCESS' });

    // Generate cryptographically secure session token
    const sessionToken = crypto.randomBytes(48).toString('hex');
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const expiresAt = new Date(Date.now() + (ABSOLUTE_TIMEOUT_SECONDS * 1000));

    await pool.execute(
      `INSERT INTO admin_sessions (session_token, admin_id, ip_address, user_agent, last_activity, expires_at)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [sessionToken, admin.id, ipAddress, userAgent, expiresAt]
    );

    await logSecurityEvent({
      adminId: admin.id,
      eventType: 'AUTH_SUCCESS_LOGIN',
      details: { username: admin.username, role: admin.role, userAgent },
      ipAddress
    });

    // Set secure HTTP-only cookie
    const isProduction = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
    const sameSiteSetting = process.env.COOKIE_SAMESITE || (isProduction ? 'none' : 'lax');
    res.cookie('swami_admin_session', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSiteSetting,
      path: '/',
      maxAge: ABSOLUTE_TIMEOUT_SECONDS * 1000
    });

    return res.json({
      success: true,
      message: `Welcome back, ${admin.full_name || admin.username}.`,
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        email: admin.email,
        role: admin.role || 'sub_admin'
      }
    });
  } catch (err) {
    console.error('Verify password error:', err);
    return res.status(500).json({ success: false, error: 'Internal authentication server error.' });
  }
}

/**
 * Step 2: Verify 6-Digit PIN & Issue Session Cookie
 */
async function verifyPin(req, res) {
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const { tempToken, pin } = req.body;

  if (!tempToken || !pin) {
    return res.status(400).json({ success: false, error: 'Temporary token and 6-digit PIN are required.' });
  }

  const cleanPin = String(pin).trim();
  if (!/^\d{6}$/.test(cleanPin)) {
    return res.status(400).json({ success: false, error: 'PIN must be exactly 6 numeric digits.' });
  }

  const pending = pendingAuthTokens.get(tempToken);
  if (!pending || Date.now() > pending.expiresAt) {
    if (pending) pendingAuthTokens.delete(tempToken);
    return res.status(401).json({ success: false, error: 'Authentication challenge expired. Please begin login again.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT id, username, pin_hash, full_name, email FROM admins WHERE id = ?`,
      [pending.adminId]
    );

    if (rows.length === 0) {
      pendingAuthTokens.delete(tempToken);
      return res.status(401).json({ success: false, error: 'Admin account not found.' });
    }

    const admin = rows[0];
    const isPinValid = await argon2.verify(admin.pin_hash, cleanPin);

    if (!isPinValid) {
      await recordAuthAttempt({ ipAddress, identifier: admin.username, success: false, reason: 'INVALID_PIN' });
      await logSecurityEvent({ adminId: admin.id, eventType: 'AUTH_FAILED_PIN', details: { username: admin.username }, ipAddress });
      return res.status(401).json({ success: false, error: 'Invalid 6-digit administrative PIN.' });
    }

    // Successful 2FA verification! Remove temp token
    pendingAuthTokens.delete(tempToken);

    // Record success and clear failed attempts
    await recordAuthAttempt({ ipAddress, identifier: admin.username, success: true, reason: 'SUCCESS' });

    // Generate cryptographically secure session token (Session rotation)
    const sessionToken = crypto.randomBytes(48).toString('hex');
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const expiresAt = new Date(Date.now() + (ABSOLUTE_TIMEOUT_SECONDS * 1000));

    await pool.execute(
      `INSERT INTO admin_sessions (session_token, admin_id, ip_address, user_agent, last_activity, expires_at)
       VALUES (?, ?, ?, ?, NOW(), ?)`,
      [sessionToken, admin.id, ipAddress, userAgent, expiresAt]
    );

    await logSecurityEvent({
      adminId: admin.id,
      eventType: 'AUTH_SUCCESS_LOGIN',
      details: { username: admin.username, userAgent },
      ipAddress
    });

    // Set secure HTTP-only cookie
    const isProduction = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
    const sameSiteSetting = process.env.COOKIE_SAMESITE || (isProduction ? 'none' : 'lax');
    res.cookie('swami_admin_session', sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSiteSetting,
      path: '/',
      maxAge: ABSOLUTE_TIMEOUT_SECONDS * 1000
    });

    return res.json({
      success: true,
      message: 'Authentication successful. Welcome to Swami Fashion Atelier Admin.',
      admin: {
        id: admin.id,
        username: admin.username,
        fullName: admin.full_name,
        email: admin.email
      }
    });
  } catch (err) {
    console.error('Verify PIN error:', err);
    return res.status(500).json({ success: false, error: 'Internal authentication server error.' });
  }
}

/**
 * Check Active Session Status
 */
async function getSessionStatus(req, res) {
  // If request passed requireAdminAuth, req.admin is populated
  return res.json({
    success: true,
    authenticated: true,
    admin: {
      id: req.admin.id,
      username: req.admin.username,
      fullName: req.admin.fullName,
      email: req.admin.email
    },
    remainingIdleSeconds: req.admin.remainingIdleSeconds,
    remainingAbsoluteSeconds: req.admin.remainingAbsoluteSeconds
  });
}

/**
 * Admin Logout
 */
async function logout(req, res) {
  const sessionToken = req.cookies?.swami_admin_session;
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

  try {
    if (sessionToken) {
      await pool.execute('DELETE FROM admin_sessions WHERE session_token = ?', [sessionToken]);
    }

    if (req.admin?.id) {
      await logSecurityEvent({
        adminId: req.admin.id,
        eventType: 'AUTH_LOGOUT',
        details: 'Admin logged out intentionally',
        ipAddress
      });
    }

    const isProduction = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
    const sameSiteSetting = process.env.COOKIE_SAMESITE || (isProduction ? 'none' : 'lax');
    res.clearCookie('swami_admin_session', {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSiteSetting,
      path: '/'
    });
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    const isProduction = process.env.NODE_ENV === 'production' || process.env.COOKIE_SECURE === 'true';
    const sameSiteSetting = process.env.COOKIE_SAMESITE || (isProduction ? 'none' : 'lax');
    res.clearCookie('swami_admin_session', {
      httpOnly: true,
      secure: isProduction,
      sameSite: sameSiteSetting,
      path: '/'
    });
    return res.json({ success: true, message: 'Session cleared.' });
  }
}

/**
 * Change Admin Password (Requires Current Password + Current PIN)
 */
async function changePassword(req, res) {
  const { currentPassword, currentPin, newPassword } = req.body;
  const adminId = req.admin.id;
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

  if (!currentPassword || !currentPin || !newPassword) {
    return res.status(400).json({ success: false, error: 'Current password, current PIN, and new password are required.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT password_hash, pin_hash FROM admins WHERE id = ?`,
      [adminId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    const { password_hash, pin_hash } = rows[0];
    const isPassValid = await argon2.verify(password_hash, currentPassword);
    const isPinValid = await argon2.verify(pin_hash, String(currentPin).trim());

    if (!isPassValid || !isPinValid) {
      await logSecurityEvent({ adminId, eventType: 'CREDENTIAL_CHANGE_FAILED', details: 'Invalid current credentials on password change', ipAddress });
      return res.status(401).json({ success: false, error: 'Current password or PIN verification failed.' });
    }

    // Hash new password with Argon2id
    const newPasswordHash = await argon2.hash(newPassword, { type: argon2.argon2id });
    await pool.execute(`UPDATE admins SET password_hash = ? WHERE id = ?`, [newPasswordHash, adminId]);

    // Revoke all other active sessions except current
    await pool.execute(
      `DELETE FROM admin_sessions WHERE admin_id = ? AND session_token != ?`,
      [adminId, req.admin.sessionToken]
    );

    await logSecurityEvent({ adminId, eventType: 'PASSWORD_CHANGED', details: 'Admin password changed. Revoked all other active sessions.', ipAddress });

    return res.json({ success: true, message: 'Password changed successfully. All other active sessions have been revoked.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, error: 'Failed to change password.' });
  }
}

/**
 * Change Admin PIN (Requires Current Password + Current PIN)
 */
async function changePin(req, res) {
  const { currentPassword, currentPin, newPin } = req.body;
  const adminId = req.admin.id;
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

  if (!currentPassword || !currentPin || !newPin) {
    return res.status(400).json({ success: false, error: 'Current password, current PIN, and new PIN are required.' });
  }

  const cleanNewPin = String(newPin).trim();
  if (!/^\d{6}$/.test(cleanNewPin)) {
    return res.status(400).json({ success: false, error: 'New PIN must be exactly 6 numeric digits.' });
  }

  try {
    const [rows] = await pool.execute(
      `SELECT password_hash, pin_hash FROM admins WHERE id = ?`,
      [adminId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    const { password_hash, pin_hash } = rows[0];
    const isPassValid = await argon2.verify(password_hash, currentPassword);
    const isPinValid = await argon2.verify(pin_hash, String(currentPin).trim());

    if (!isPassValid || !isPinValid) {
      await logSecurityEvent({ adminId, eventType: 'PIN_CHANGE_FAILED', details: 'Invalid current credentials on PIN change', ipAddress });
      return res.status(401).json({ success: false, error: 'Current password or PIN verification failed.' });
    }

    const newPinHash = await argon2.hash(cleanNewPin, { type: argon2.argon2id });
    await pool.execute(`UPDATE admins SET pin_hash = ? WHERE id = ?`, [newPinHash, adminId]);

    await logSecurityEvent({ adminId, eventType: 'PIN_CHANGED', details: 'Admin 6-digit PIN changed successfully.', ipAddress });

    return res.json({ success: true, message: 'Administrative 6-digit PIN updated successfully.' });
  } catch (err) {
    console.error('Change PIN error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update PIN.' });
  }
}

/**
 * List all Admin & Sub-Admin Accounts
 */
async function listSubAdmins(req, res) {
  try {
    const [admins] = await pool.execute(
      `SELECT id, username, full_name, email, role, is_active, created_at, updated_at
       FROM admins
       ORDER BY role = 'main_admin' DESC, created_at ASC`
    );

    return res.json({
      success: true,
      admins: admins.map(a => ({
        id: a.id,
        username: a.username,
        fullName: a.full_name,
        email: a.email,
        role: a.role,
        isActive: Boolean(a.is_active),
        createdAt: a.created_at,
        updatedAt: a.updated_at
      }))
    });
  } catch (err) {
    console.error('List sub-admins error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve sub-admin accounts.' });
  }
}

/**
 * Add a New Sub-Admin User (Main Admin Only)
 */
async function createSubAdmin(req, res) {
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const { username, password, fullName, email } = req.body;

  if (!username || !password || !fullName || !email) {
    return res.status(400).json({
      success: false,
      error: 'Username, password, full name, and email are all required.'
    });
  }

  const cleanUsername = String(username).trim().toLowerCase();
  const cleanEmail = String(email).trim().toLowerCase();
  const cleanFullName = String(fullName).trim();

  if (cleanUsername.length < 3 || cleanUsername.length > 50) {
    return res.status(400).json({ success: false, error: 'Username must be between 3 and 50 characters.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
  }

  try {
    // Check if username or email already exists
    const [existing] = await pool.execute(
      `SELECT id, username, email FROM admins WHERE username = ? OR email = ?`,
      [cleanUsername, cleanEmail]
    );

    if (existing.length > 0) {
      const match = existing[0];
      if (match.username === cleanUsername) {
        return res.status(409).json({ success: false, error: `Username '${cleanUsername}' is already taken.` });
      }
      return res.status(409).json({ success: false, error: `Email '${cleanEmail}' is already registered.` });
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

    const [result] = await pool.execute(
      `INSERT INTO admins (username, password_hash, full_name, email, role, is_active)
       VALUES (?, ?, ?, ?, 'sub_admin', 1)`,
      [cleanUsername, passwordHash, cleanFullName, cleanEmail]
    );

    await logSecurityEvent({
      adminId: req.admin.id,
      eventType: 'SUB_ADMIN_CREATED',
      details: { createdAdminId: result.insertId, username: cleanUsername, email: cleanEmail },
      ipAddress
    });

    return res.status(201).json({
      success: true,
      message: `Sub-admin '${cleanUsername}' created successfully.`,
      subAdmin: {
        id: result.insertId,
        username: cleanUsername,
        fullName: cleanFullName,
        email: cleanEmail,
        role: 'sub_admin',
        isActive: true
      }
    });
  } catch (err) {
    console.error('Create sub-admin error:', err);
    return res.status(500).json({ success: false, error: 'Failed to create sub-admin account.' });
  }
}

/**
 * Toggle Sub-Admin Active Status (Main Admin Only)
 */
async function toggleSubAdminStatus(req, res) {
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const targetId = parseInt(req.params.id);

  if (targetId === req.admin.id) {
    return res.status(400).json({ success: false, error: 'You cannot deactivate your own account.' });
  }

  try {
    const [rows] = await pool.execute('SELECT id, username, role, is_active FROM admins WHERE id = ?', [targetId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    const target = rows[0];
    if (target.role === 'main_admin') {
      return res.status(403).json({ success: false, error: 'Main Admin account cannot be deactivated.' });
    }

    const newStatus = target.is_active === 1 ? 0 : 1;
    await pool.execute('UPDATE admins SET is_active = ? WHERE id = ?', [newStatus, targetId]);

    // If deactivated, revoke all active sessions immediately
    if (newStatus === 0) {
      await pool.execute('DELETE FROM admin_sessions WHERE admin_id = ?', [targetId]);
    }

    await logSecurityEvent({
      adminId: req.admin.id,
      eventType: 'SUB_ADMIN_STATUS_TOGGLED',
      details: { targetId, targetUsername: target.username, newStatus },
      ipAddress
    });

    return res.json({
      success: true,
      message: `Sub-admin '${target.username}' ${newStatus === 1 ? 'activated' : 'deactivated'} successfully.`,
      isActive: Boolean(newStatus)
    });
  } catch (err) {
    console.error('Toggle sub-admin status error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update sub-admin status.' });
  }
}

/**
 * Delete Sub-Admin (Main Admin Only)
 */
async function deleteSubAdmin(req, res) {
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const targetId = parseInt(req.params.id);

  if (targetId === req.admin.id) {
    return res.status(400).json({ success: false, error: 'You cannot delete your own account.' });
  }

  try {
    const [rows] = await pool.execute('SELECT id, username, role FROM admins WHERE id = ?', [targetId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    const target = rows[0];
    if (target.role === 'main_admin') {
      return res.status(403).json({ success: false, error: 'Main Admin account cannot be deleted.' });
    }

    // Delete sessions and admin record
    await pool.execute('DELETE FROM admin_sessions WHERE admin_id = ?', [targetId]);
    await pool.execute('DELETE FROM admins WHERE id = ?', [targetId]);

    await logSecurityEvent({
      adminId: req.admin.id,
      eventType: 'SUB_ADMIN_DELETED',
      details: { targetId, targetUsername: target.username },
      ipAddress
    });

    return res.json({
      success: true,
      message: `Sub-admin '${target.username}' removed successfully.`
    });
  } catch (err) {
    console.error('Delete sub-admin error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete sub-admin.' });
  }
}

module.exports = {
  verifyPassword,
  verifyPin,
  getSessionStatus,
  logout,
  changePassword,
  changePin,
  listSubAdmins,
  createSubAdmin,
  toggleSubAdminStatus,
  deleteSubAdmin
};
