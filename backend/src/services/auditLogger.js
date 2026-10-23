const pool = require('../config/database');

async function logSecurityEvent({ adminId = null, eventType, details, ipAddress = 'unknown' }) {
  try {
    const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details);
    await pool.execute(
      `INSERT INTO security_audit_logs (admin_id, event_type, details, ip_address)
       VALUES (?, ?, ?, ?)`,
      [adminId, eventType, detailsStr, ipAddress]
    );
  } catch (err) {
    console.error('Failed to write security audit log:', err.message);
  }
}

module.exports = { logSecurityEvent };
