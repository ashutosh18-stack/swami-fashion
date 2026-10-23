const pool = require('../config/database');
const { logSecurityEvent } = require('../services/auditLogger');

const IDLE_TIMEOUT_SECONDS = 5 * 60; // 5 minutes
const ABSOLUTE_TIMEOUT_SECONDS = 30 * 60; // 30 minutes

/**
 * Validates admin session from HTTP-only cookie
 * Enforces 5-minute idle timeout & 30-minute absolute timeout
 */
async function requireAdminAuth(req, res, next) {
  const sessionToken = req.cookies?.swami_admin_session;

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. No active session token found.',
      code: 'AUTH_REQUIRED'
    });
  }

  try {
    // Fetch session and linked admin
    const [rows] = await pool.execute(
      `SELECT s.id as session_id, s.session_token, s.admin_id, s.last_activity, s.expires_at, s.created_at,
              a.username, a.full_name, a.email, a.role, a.is_active
       FROM admin_sessions s
       JOIN admins a ON a.id = s.admin_id
       WHERE s.session_token = ?`,
      [sessionToken]
    );

    if (rows.length === 0) {
      res.clearCookie('swami_admin_session', { path: '/' });
      return res.status(401).json({
        success: false,
        error: 'Invalid or revoked session. Please log in again.',
        code: 'SESSION_INVALID'
      });
    }

    const session = rows[0];

    // Check if account has been deactivated
    if (session.is_active === 0) {
      await pool.execute('DELETE FROM admin_sessions WHERE id = ?', [session.session_id]);
      res.clearCookie('swami_admin_session', { path: '/' });
      return res.status(403).json({
        success: false,
        error: 'Your admin account has been deactivated. Please contact the main administrator.',
        code: 'ACCOUNT_DISABLED'
      });
    }

    const now = new Date();
    const lastActivity = new Date(session.last_activity);
    const expiresAt = new Date(session.expires_at);

    // 1. Check Absolute Session Lifetime (30 minutes)
    if (now > expiresAt) {
      // Invalidate session
      await pool.execute('DELETE FROM admin_sessions WHERE id = ?', [session.session_id]);
      res.clearCookie('swami_admin_session', { path: '/' });

      await logSecurityEvent({
        adminId: session.admin_id,
        eventType: 'SESSION_ABSOLUTE_TIMEOUT',
        details: 'Admin session exceeded maximum 30-minute lifetime',
        ipAddress: req.ip || req.connection.remoteAddress
      });

      return res.status(401).json({
        success: false,
        error: 'Your session has exceeded its maximum lifetime (30 minutes). Please log in again.',
        code: 'SESSION_ABSOLUTE_TIMEOUT'
      });
    }

    // 2. Check Idle Timeout (5 minutes of inactivity)
    const idleSeconds = Math.floor((now.getTime() - lastActivity.getTime()) / 1000);
    if (idleSeconds > IDLE_TIMEOUT_SECONDS) {
      // Invalidate session
      await pool.execute('DELETE FROM admin_sessions WHERE id = ?', [session.session_id]);
      res.clearCookie('swami_admin_session', { path: '/' });

      await logSecurityEvent({
        adminId: session.admin_id,
        eventType: 'SESSION_IDLE_TIMEOUT',
        details: `Admin session expired due to ${idleSeconds}s of inactivity (exceeded 300s limit)`,
        ipAddress: req.ip || req.connection.remoteAddress
      });

      return res.status(401).json({
        success: false,
        error: 'Your admin session has expired. Please log in again.',
        code: 'SESSION_IDLE_TIMEOUT'
      });
    }

    // 3. Extend idle timeout ONLY for meaningful non-polling requests
    const isPassivePolling = req.originalUrl.includes('/ping') ||
                             req.originalUrl.includes('/session-status') ||
                             req.headers['x-passive-check'] === 'true';

    if (!isPassivePolling) {
      await pool.execute(
        `UPDATE admin_sessions SET last_activity = NOW() WHERE id = ?`,
        [session.session_id]
      );
      session.last_activity = now;
    }

    // Attach admin context to request
    req.admin = {
      id: session.admin_id,
      username: session.username,
      fullName: session.full_name,
      email: session.email,
      role: session.role || 'sub_admin',
      sessionId: session.session_id,
      sessionToken: session.session_token,
      lastActivity: session.last_activity,
      expiresAt: session.expires_at,
      remainingIdleSeconds: Math.max(0, IDLE_TIMEOUT_SECONDS - Math.floor((Date.now() - new Date(session.last_activity).getTime()) / 1000)),
      remainingAbsoluteSeconds: Math.max(0, Math.floor((new Date(session.expires_at).getTime() - Date.now()) / 1000))
    };

    next();
  } catch (err) {
    console.error('Session authentication error:', err);
    return res.status(500).json({ success: false, error: 'Internal security authentication error' });
  }
}

/**
 * Middleware: Requires Main Admin permissions
 */
function requireMainAdmin(req, res, next) {
  if (!req.admin || req.admin.role !== 'main_admin') {
    return res.status(403).json({
      success: false,
      error: 'Permission denied. Only Main Admin can manage sub-admin accounts.'
    });
  }
  next();
}

module.exports = {
  requireAdminAuth,
  requireMainAdmin,
  IDLE_TIMEOUT_SECONDS,
  ABSOLUTE_TIMEOUT_SECONDS
};
