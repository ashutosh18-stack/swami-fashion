import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminSecurity() {
  const { admin, idleSecondsLeft, absoluteSecondsLeft } = useAuth();

  // Change Password State
  const [passForm, setPassForm] = useState({
    currentPassword: '',
    currentPin: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [passNotice, setPassNotice] = useState({ type: '', text: '' });

  // Change PIN State
  const [pinForm, setPinForm] = useState({
    currentPassword: '',
    currentPin: '',
    newPin: '',
    confirmPin: ''
  });
  const [isChangingPin, setIsChangingPin] = useState(false);
  const [pinNotice, setPinNotice] = useState({ type: '', text: '' });

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);

  const loadLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await api.getAuditLogs();
      if (res.success) {
        setAuditLogs(res.logs || []);
      }
    } catch (err) {
      console.error('Error loading audit logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassNotice({ type: '', text: '' });

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassNotice({ type: 'danger', text: 'New password and confirmation do not match.' });
      return;
    }
    if (passForm.newPassword.length < 8) {
      setPassNotice({ type: 'danger', text: 'New password must be at least 8 characters long.' });
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await api.changePassword({
        currentPassword: passForm.currentPassword,
        currentPin: passForm.currentPin,
        newPassword: passForm.newPassword
      });
      if (res.success) {
        setPassNotice({ type: 'success', text: res.message });
        setPassForm({ currentPassword: '', currentPin: '', newPassword: '', confirmPassword: '' });
        loadLogs();
      }
    } catch (err) {
      setPassNotice({ type: 'danger', text: err.message || 'Failed to update password.' });
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleChangePin = async (e) => {
    e.preventDefault();
    setPinNotice({ type: '', text: '' });

    if (pinForm.newPin !== pinForm.confirmPin) {
      setPinNotice({ type: 'danger', text: 'New 6-digit PIN and confirmation do not match.' });
      return;
    }
    if (!/^\d{6}$/.test(pinForm.newPin)) {
      setPinNotice({ type: 'danger', text: 'PIN must be exactly 6 numeric digits.' });
      return;
    }

    setIsChangingPin(true);
    try {
      const res = await api.changePin({
        currentPassword: pinForm.currentPassword,
        currentPin: pinForm.currentPin,
        newPin: pinForm.newPin
      });
      if (res.success) {
        setPinNotice({ type: 'success', text: res.message });
        setPinForm({ currentPassword: '', currentPin: '', newPin: '', confirmPin: '' });
        loadLogs();
      }
    } catch (err) {
      setPinNotice({ type: 'danger', text: err.message || 'Failed to update PIN.' });
    } finally {
      setIsChangingPin(false);
    }
  };

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}m ${sec < 10 ? '0' : ''}${sec}s`;
  };

  return (
    <div>
      <div className="mb-4">
        <span className="badge-luxury mb-1">DEFENSE IN DEPTH</span>
        <h1 className="font-decorative text-gold-gradient fs-2 m-0">Security & Credentials</h1>
      </div>

      {/* Active Session Info Card */}
      <div className="luxury-card p-4 p-md-5 mb-5 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'rgba(90, 42, 24, 0.12)' }}>
          <h3 className="fs-5 font-heading m-0 fw-bold" style={{ color: '#5A2A18' }}>Active Administrator Session</h3>
          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-3 py-1">
            SECURED BY ARGON2ID & HTTP-ONLY COOKIE
          </span>
        </div>

        <div className="row g-4">
          <div className="col-md-3">
            <span className="text-muted d-block fw-semibold" style={{ fontSize: '0.75rem' }}>ADMIN IDENTIFIER</span>
            <strong className="fs-6" style={{ color: '#1C1410' }}>@{admin?.username}</strong>
          </div>
          <div className="col-md-3">
            <span className="text-muted d-block fw-semibold" style={{ fontSize: '0.75rem' }}>FULL NAME</span>
            <strong className="fs-6" style={{ color: '#1C1410' }}>{admin?.fullName}</strong>
          </div>
          <div className="col-md-3">
            <span className="text-muted d-block fw-semibold" style={{ fontSize: '0.75rem' }}>IDLE TIMEOUT (5 MIN LIMIT)</span>
            <strong className={idleSecondsLeft < 60 ? "text-danger fs-6" : "fs-6"} style={{ color: idleSecondsLeft < 60 ? undefined : '#5A2A18' }}>
              {formatTimer(idleSecondsLeft)} remaining
            </strong>
          </div>
          <div className="col-md-3">
            <span className="text-muted d-block fw-semibold" style={{ fontSize: '0.75rem' }}>ABSOLUTE LIFETIME (30 MIN LIMIT)</span>
            <strong className="fs-6" style={{ color: '#1C1410' }}>{formatTimer(absoluteSecondsLeft)} remaining</strong>
          </div>
        </div>
      </div>

      {/* Two Factor Credential Update Cards */}
      <div className="row g-4 mb-5">
        
        {/* Change Password Card */}
        <div className="col-lg-6">
          <div className="luxury-card p-4 p-md-5 h-100 shadow-sm">
            <h3 className="fs-5 font-heading mb-2 fw-bold" style={{ color: '#5A2A18' }}>Change Admin Password</h3>
            <p className="text-muted font-editorial mb-4" style={{ fontSize: '0.88rem' }}>
              Requires current password and PIN re-authentication. Revokes all other active sessions upon success.
            </p>

            {passNotice.text && (
              <div className={`alert alert-${passNotice.type} py-2 px-3 mb-3`} style={{ fontSize: '0.85rem' }}>
                {passNotice.text}
              </div>
            )}

            <form onSubmit={handleChangePassword}>
              <div className="mb-3 text-start">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.75rem', color: '#5E4E45' }}>Current Password *</label>
                <input
                  type="password"
                  required
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.75rem', color: '#5E4E45' }}>Current 6-Digit PIN *</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={passForm.currentPin}
                  onChange={(e) => setPassForm({ ...passForm, currentPin: e.target.value })}
                  placeholder="••••••"
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.75rem', color: '#5E4E45' }}>New Password (min 8 characters) *</label>
                <input
                  type="password"
                  required
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-4 text-start">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.75rem', color: '#5E4E45' }}>Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  className="form-control form-control-luxury"
                />
              </div>

              <button type="submit" disabled={isChangingPass} className="btn-luxury-primary w-100 py-2">
                {isChangingPass ? 'HASHING WITH ARGON2ID...' : 'UPDATE PASSWORD & REVOKE OTHER SESSIONS'}
              </button>
            </form>
          </div>
        </div>

        {/* Change 6-Digit PIN Card */}
        <div className="col-lg-6">
          <div className="luxury-card p-4 p-md-5 h-100 shadow-sm">
            <h3 className="fs-5 font-heading mb-2 fw-bold" style={{ color: '#5A2A18' }}>Change 6-Digit PIN</h3>
            <p className="text-muted font-editorial mb-4" style={{ fontSize: '0.88rem' }}>
              Updates your secondary authentication factor. Requires current credentials to confirm.
            </p>

            {pinNotice.text && (
              <div className={`alert alert-${pinNotice.type} py-2 px-3 mb-3`} style={{ fontSize: '0.85rem' }}>
                {pinNotice.text}
              </div>
            )}

            <form onSubmit={handleChangePin}>
              <div className="mb-3 text-start">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.75rem', color: '#5E4E45' }}>Current Password *</label>
                <input
                  type="password"
                  required
                  value={pinForm.currentPassword}
                  onChange={(e) => setPinForm({ ...pinForm, currentPassword: e.target.value })}
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.75rem', color: '#5E4E45' }}>Current 6-Digit PIN *</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={pinForm.currentPin}
                  onChange={(e) => setPinForm({ ...pinForm, currentPin: e.target.value })}
                  placeholder="••••••"
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.75rem', color: '#5E4E45' }}>New 6-Digit PIN *</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={pinForm.newPin}
                  onChange={(e) => setPinForm({ ...pinForm, newPin: e.target.value })}
                  placeholder="••••••"
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-4 text-start">
                <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.75rem', color: '#5E4E45' }}>Confirm New 6-Digit PIN *</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  value={pinForm.confirmPin}
                  onChange={(e) => setPinForm({ ...pinForm, confirmPin: e.target.value })}
                  placeholder="••••••"
                  className="form-control form-control-luxury"
                />
              </div>

              <button type="submit" disabled={isChangingPin} className="btn-luxury-primary w-100 py-2">
                {isChangingPin ? 'UPDATING PIN...' : 'UPDATE 6-DIGIT PIN'}
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Security Audit Logs */}
      <div className="luxury-card p-4 p-md-5 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'rgba(90, 42, 24, 0.12)' }}>
          <h3 className="fs-5 font-heading m-0 fw-bold" style={{ color: '#5A2A18' }}>Security Audit Logs</h3>
          <button onClick={loadLogs} className="btn btn-sm btn-luxury-outline py-1 px-3">
            <i className="fa-solid fa-arrows-rotate me-1"></i> Refresh Logs
          </button>
        </div>

        {isLoadingLogs ? (
          <div className="text-center py-4">
            <i className="fa-solid fa-circle-notch fa-spin text-gold fs-4"></i>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>IP Address</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.78rem' }}>
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge bg-light border text-dark px-2 py-1" style={{ fontSize: '0.72rem', borderColor: 'rgba(90, 42, 24, 0.2)' }}>
                        {log.event_type}
                      </span>
                    </td>
                    <td>
                      <code className="text-dark font-monospace" style={{ fontSize: '0.78rem' }}>{log.ip_address}</code>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
