import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { admin: currentAdmin } = useAuth();
  const isMainAdmin = currentAdmin?.role === 'main_admin';

  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modal / Form state for adding sub-admin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAdmins = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.adminGetSubAdmins();
      if (res.success && Array.isArray(res.admins)) {
        setAdmins(res.admins);
      }
    } catch (err) {
      console.error('Failed to load admin users:', err);
      setError(err.message || 'Failed to load administrator accounts.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
      setFormError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.adminCreateSubAdmin({
        fullName: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Sub-admin created successfully.');
        setIsModalOpen(false);
        setFullName('');
        setUsername('');
        setEmail('');
        setPassword('');
        fetchAdmins();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create sub-admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus, adminName) => {
    try {
      const res = await api.adminToggleSubAdminStatus(id);
      if (res.success) {
        setSuccessMsg(res.message);
        setAdmins(prev =>
          prev.map(a => a.id === id ? { ...a, isActive: res.isActive } : a)
        );
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  const handleDelete = async (id, adminUsername) => {
    if (!window.confirm(`Are you sure you want to permanently remove sub-admin '${adminUsername}'?`)) {
      return;
    }

    try {
      const res = await api.adminDeleteSubAdmin(id);
      if (res.success) {
        setSuccessMsg(res.message);
        setAdmins(prev => prev.filter(a => a.id !== id));
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete sub-admin.');
    }
  };

  return (
    <div className="p-4 p-md-5">
      {/* Top Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <span className="badge-luxury mb-1">ACCESS CONTROL & TEAM</span>
          <h1 className="fs-2 font-decorative text-gold-gradient m-0">Administrator Accounts</h1>
          <p className="text-muted small m-0 mt-1">
            Manage main administrator and secondary sub-admin accounts for store operations.
          </p>
        </div>

        {isMainAdmin && (
          <button
            id="add-sub-admin-btn"
            onClick={() => {
              setFormError(null);
              setIsModalOpen(true);
            }}
            className="btn btn-luxury-primary py-2 px-3 d-flex align-items-center gap-2"
          >
            <i className="fa-solid fa-user-plus"></i>
            <span>Add Sub-Admin</span>
          </button>
        )}
      </div>

      {/* Alert Notices */}
      {successMsg && (
        <div className="alert alert-success d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 shadow-sm">
          <i className="fa-solid fa-circle-check text-success"></i>
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-4 rounded-3 shadow-sm">
          <i className="fa-solid fa-circle-exclamation text-danger"></i>
          <span>{error}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4 col-12">
          <div className="luxury-card p-3 rounded-3 border h-100 d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', background: 'rgba(197, 160, 89, 0.15)', color: '#C5A059' }}
            >
              <i className="fa-solid fa-crown fs-5"></i>
            </div>
            <div>
              <span className="text-muted small d-block">Main Administrator</span>
              <strong className="fs-5" style={{ color: '#5A2A18' }}>
                {admins.find(a => a.role === 'main_admin')?.username || 'swami_admin'}
              </strong>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-12">
          <div className="luxury-card p-3 rounded-3 border h-100 d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', background: 'rgba(40, 167, 69, 0.12)', color: '#28a745' }}
            >
              <i className="fa-solid fa-users fs-5"></i>
            </div>
            <div>
              <span className="text-muted small d-block">Active Sub-Admins</span>
              <strong className="fs-5" style={{ color: '#1C1410' }}>
                {admins.filter(a => a.role === 'sub_admin' && a.isActive).length} Active
              </strong>
            </div>
          </div>
        </div>

        <div className="col-md-4 col-12">
          <div className="luxury-card p-3 rounded-3 border h-100 d-flex align-items-center gap-3">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: '48px', height: '48px', background: 'rgba(90, 42, 24, 0.1)', color: '#5A2A18' }}
            >
              <i className="fa-solid fa-key fs-5"></i>
            </div>
            <div>
              <span className="text-muted small d-block">Authentication Mode</span>
              <strong className="fs-6" style={{ color: '#5A2A18' }}>Username & Password Only</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="luxury-card rounded-3 border overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover m-0 align-middle">
            <thead style={{ background: '#FAF8F5', borderBottom: '1px solid rgba(90, 42, 24, 0.12)' }}>
              <tr style={{ color: '#5E4E45', fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                <th className="py-3 px-4">USER / FULL NAME</th>
                <th className="py-3 px-3">EMAIL ADDRESS</th>
                <th className="py-3 px-3">ROLE</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">CREATED</th>
                {isMainAdmin && <th className="py-3 px-4 text-end">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <i className="fa-solid fa-circle-notch fa-spin text-gold fs-3"></i>
                    <p className="text-muted small mt-2">Loading administrator accounts...</p>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-5 text-muted">
                    No administrator accounts found.
                  </td>
                </tr>
              ) : (
                admins.map((adm) => {
                  const isMain = adm.role === 'main_admin';
                  return (
                    <tr key={adm.id} style={{ borderBottom: '1px solid rgba(90, 42, 24, 0.06)' }}>
                      <td className="py-3 px-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                            style={{
                              width: '38px',
                              height: '38px',
                              background: isMain ? '#5A2A18' : 'rgba(90, 42, 24, 0.08)',
                              color: isMain ? '#FFFFFF' : '#5A2A18',
                              border: isMain ? '1px solid #5A2A18' : '1px solid rgba(90, 42, 24, 0.15)'
                            }}
                          >
                            {adm.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold" style={{ color: '#1C1410', fontSize: '0.92rem' }}>{adm.fullName || adm.username}</div>
                            <span className="small text-muted font-monospace">@{adm.username}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="small" style={{ color: '#3A2A20' }}>{adm.email}</span>
                      </td>

                      <td className="py-3 px-3">
                        {isMain ? (
                          <span
                            className="badge py-1 px-2 fw-semibold text-uppercase"
                            style={{
                              background: 'rgba(90, 42, 24, 0.1)',
                              color: '#5A2A18',
                              border: '1px solid rgba(90, 42, 24, 0.3)',
                              fontSize: '0.72rem'
                            }}
                          >
                            <i className="fa-solid fa-crown me-1 text-gold"></i> Main Admin
                          </span>
                        ) : (
                          <span
                            className="badge py-1 px-2 fw-semibold text-uppercase"
                            style={{
                              background: 'rgba(27, 42, 74, 0.1)',
                              color: '#1B2A4A',
                              border: '1px solid rgba(27, 42, 74, 0.25)',
                              fontSize: '0.72rem'
                            }}
                          >
                            <i className="fa-solid fa-user-shield me-1"></i> Sub-Admin
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {adm.isActive ? (
                          <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-1 px-2 small">
                            <i className="fa-solid fa-circle-dot me-1"></i> Active
                          </span>
                        ) : (
                          <span className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 py-1 px-2 small">
                            <i className="fa-solid fa-ban me-1"></i> Deactivated
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-muted small">
                        {adm.createdAt ? new Date(adm.createdAt).toLocaleDateString() : '—'}
                      </td>

                      {isMainAdmin && (
                        <td className="py-3 px-4 text-end">
                          {isMain ? (
                            <span className="badge bg-secondary bg-opacity-10 text-muted py-1 px-2 small">
                              Owner
                            </span>
                          ) : (
                            <div className="d-flex justify-content-end align-items-center gap-2">
                              <button
                                onClick={() => handleToggleStatus(adm.id, adm.isActive, adm.username)}
                                className={`btn btn-sm ${adm.isActive ? 'btn-outline-warning' : 'btn-outline-success'} py-1 px-2`}
                                title={adm.isActive ? 'Deactivate sub-admin' : 'Activate sub-admin'}
                                style={{ fontSize: '0.78rem' }}
                              >
                                {adm.isActive ? 'Deactivate' : 'Activate'}
                              </button>

                              <button
                                onClick={() => handleDelete(adm.id, adm.username)}
                                className="btn btn-sm btn-outline-danger py-1 px-2"
                                title="Delete sub-admin"
                                style={{ fontSize: '0.78rem' }}
                              >
                                <i className="fa-solid fa-trash-can"></i>
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sub-Admin Modal */}
      {isModalOpen && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 10600 }}
          tabIndex="-1"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content bg-white text-dark border shadow-lg rounded-3">
              <div className="modal-header border-bottom" style={{ borderColor: 'rgba(90, 42, 24, 0.1)' }}>
                <h5 className="modal-title font-decorative fs-5 fw-bold" style={{ color: '#5A2A18' }}>
                  <i className="fa-solid fa-user-plus me-2 text-gold"></i>
                  Add Sub-Admin User
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setIsModalOpen(false)}
                />
              </div>

              <form onSubmit={handleCreateSubAdmin}>
                <div className="modal-body p-4">
                  {formError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-2 mb-3">
                      {formError}
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-semibold" style={{ color: '#5E4E45' }}>Full Name</label>
                    <input
                      type="text"
                      className="form-control bg-white text-dark border"
                      placeholder="e.g. Rahul Patil"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  {/* Username */}
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-semibold" style={{ color: '#5E4E45' }}>Username (for sign in)</label>
                    <input
                      type="text"
                      className="form-control bg-white text-dark border font-monospace"
                      placeholder="e.g. rahul_store"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                    <div className="form-text text-muted small">
                      Sub-admin will use this username to sign into the admin portal.
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-semibold" style={{ color: '#5E4E45' }}>Email Address</label>
                    <input
                      type="email"
                      className="form-control bg-white text-dark border"
                      placeholder="e.g. rahul@swamifashion.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div className="mb-3 text-start">
                    <label className="form-label small fw-semibold" style={{ color: '#5E4E45' }}>Initial Password</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="form-control bg-white text-dark border"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <div className="form-text text-muted small">
                      Sub-admin logs in with Username & Password only (no PIN code required).
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top" style={{ borderColor: 'rgba(90, 42, 24, 0.1)' }}>
                  <button
                    type="button"
                    className="btn btn-outline-secondary py-2 px-3"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-luxury-primary py-2 px-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="fa-solid fa-circle-notch fa-spin me-2"></i>
                        Creating Sub-Admin...
                      </>
                    ) : (
                      'Create Sub-Admin'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
