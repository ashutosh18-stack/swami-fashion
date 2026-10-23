const pool = require('../config/database');
const { logSecurityEvent } = require('../services/auditLogger');

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_WINDOW_MINUTES = 15;

/**
 * Checks if the given IP and/or identifier is locked out
 */
async function checkAuthLockout(req, res, next) {
  const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const identifier = (req.body.username || req.body.identifier || '').trim().toLowerCase();

  try {
    // Check failed attempts within the last 15 minutes for this IP or identifier
    const [rows] = await pool.execute(
      `SELECT COUNT(*) as failed_count, MAX(attempted_at) as last_attempt
       FROM login_attempts
       WHERE (ip_address = ? OR (identifier = ? AND identifier != ''))
         AND success = 0
         AND attempted_at >= NOW() - INTERVAL ? MINUTE`,
      [ipAddress, identifier, LOCKOUT_WINDOW_MINUTES]
    );

    const failedCount = rows[0]?.failed_count || 0;

    if (failedCount >= MAX_FAILED_ATTEMPTS) {
      // Calculate remaining cooldown in minutes
      const lastAttemptTime = new Date(rows[0].last_attempt).getTime();
      const now = Date.now();
      const elapsedMinutes = (now - lastAttemptTime) / (60 * 1000);
      const remainingMinutes = Math.max(1, Math.ceil(LOCKOUT_WINDOW_MINUTES - elapsedMinutes));

      await logSecurityEvent({
        eventType: 'AUTH_LOCKOUT_BLOCKED',
        details: { ip: ipAddress, identifier, failedCount, remainingMinutes },
        ipAddress
      });

      return res.status(429).json({
        success: false,
        error: 'Too many login attempts. Please try again later.',
        cooldownMinutes: remainingMinutes
      });
    }

    req.authContext = { ipAddress, identifier };
    next();
  } catch (err) {
    console.error('Error in checkAuthLockout:', err);
    next(); // Fallback to avoid complete system lockup on db glitch, but error is logged
  }
}

/**
 * Record an authentication attempt result
 */
async function recordAuthAttempt({ ipAddress, identifier, success, reason = null }) {
  try {
    await pool.execute(
      `INSERT INTO login_attempts (ip_address, identifier, success, reason, attempted_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [ipAddress, identifier || 'unknown', success ? 1 : 0, reason]
    );

    if (success) {
      // Clear recent failed attempts for this identifier and IP upon verified login
      await pool.execute(
        `DELETE FROM login_attempts
         WHERE (ip_address = ? OR identifier = ?) AND success = 0`,
        [ipAddress, identifier]
      );
    }
  } catch (err) {
    console.error('Error recording auth attempt:', err);
  }
}

module.exports = {
  checkAuthLockout,
  recordAuthAttempt,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_WINDOW_MINUTES
};
