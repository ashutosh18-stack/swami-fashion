import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

export default function AdminLoginModal({ isOpen, onClose }) {
  const { login, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [cooldownMinutes, setCooldownMinutes] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setPassword('');
      setShowPassword(false);
      setError(null);
      setCooldownMinutes(null);
    }
  }, [isOpen]);

  // If already authenticated and modal is open, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && isOpen) {
      onClose();
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, isOpen, navigate, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please provide your admin username and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await login(username.trim(), password);
      if (res.success) {
        onClose();
        navigate('/admin/dashboard');
      }
    } catch (err) {
      if (err.status === 429) {
        setError(err.data?.error || 'Too many login attempts. Please try again later.');
        setCooldownMinutes(err.data?.cooldownMinutes || 15);
      } else {
        setError(err.message || 'Invalid username or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{
        backgroundColor: 'rgba(28, 20, 16, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 10500
      }}
      tabIndex="-1"
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="modal-content shadow-lg border-0"
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid rgba(197, 160, 89, 0.35)',
            boxShadow: '0 25px 60px rgba(90, 42, 24, 0.2)'
          }}
        >
          {/* Header */}
          <div className="modal-header border-0 pb-0 pt-4 px-4 position-relative justify-content-center">
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 m-3"
              onClick={onClose}
              aria-label="Close"
            />
            <div className="text-center">
              <div
                className="rounded-circle mx-auto d-flex align-items-center justify-content-center mb-2"
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'rgba(90, 42, 24, 0.06)',
                  border: '2px solid rgba(197, 160, 89, 0.4)'
                }}
              >
                <img
                  src={settings.logo_url || '/logo.jpg'}
                  alt="Swami Fashion Seal"
                  className="rounded-circle"
                  style={{ width: '48px', height: '48px', objectFit: 'contain' }}
                />
              </div>
              <h2
                className="fs-4 font-decorative fw-bold m-0"
                style={{ color: '#5A2A18', letterSpacing: '0.04em' }}
              >
                Admin Sign In
              </h2>
              <p className="text-muted small m-0 mt-1">
                Enter your administrative credentials to continue
              </p>
            </div>
          </div>

          {/* Form Body */}
          <div className="modal-body p-4">
            {error && (
              <div
                className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3"
                role="alert"
                style={{ fontSize: '0.82rem' }}
              >
                <i className="fa-solid fa-circle-exclamation flex-shrink-0"></i>
                <div>
                  {error}
                  {cooldownMinutes && (
                    <div className="small mt-1 opacity-75">
                      Security lockout active for ~{cooldownMinutes} minutes.
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Username Input */}
              <div className="mb-3 text-start">
                <label
                  className="form-label small fw-semibold text-uppercase"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: '#5A2A18' }}
                >
                  Admin Username
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0" style={{ borderColor: 'rgba(90,42,24,0.15)' }}>
                    <i className="fa-solid fa-user" style={{ color: '#8A7A70' }}></i>
                  </span>
                  <input
                    id="admin-username-input"
                    type="text"
                    className="form-control bg-light border-start-0"
                    placeholder="e.g. swami_admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                    style={{ borderColor: 'rgba(90,42,24,0.15)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-4 text-start">
                <label
                  className="form-label small fw-semibold text-uppercase"
                  style={{ fontSize: '0.75rem', letterSpacing: '0.08em', color: '#5A2A18' }}
                >
                  Password
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0" style={{ borderColor: 'rgba(90,42,24,0.15)' }}>
                    <i className="fa-solid fa-lock" style={{ color: '#8A7A70' }}></i>
                  </span>
                  <input
                    id="admin-password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control bg-light border-start-0 border-end-0"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    style={{ borderColor: 'rgba(90,42,24,0.15)', fontSize: '0.9rem' }}
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light border-start-0"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ borderColor: 'rgba(90,42,24,0.15)', cursor: 'pointer' }}
                    tabIndex="-1"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{ color: '#8A7A70' }}></i>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="admin-login-submit-btn"
                type="submit"
                className="btn w-100 py-3 fw-bold text-uppercase d-flex align-items-center justify-content-center gap-2 shadow-sm"
                disabled={isSubmitting}
                style={{
                  background: '#5A2A18',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  letterSpacing: '0.08em',
                  transition: 'all 0.25s ease'
                }}
              >
                {isSubmitting ? (
                  <>
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-to-bracket"></i>
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-3 pt-2 border-top" style={{ borderColor: 'rgba(90,42,24,0.08)' }}>
              <span className="small text-muted" style={{ fontSize: '0.76rem' }}>
                <i className="fa-solid fa-shield-halved me-1 text-success"></i>
                Authorized Store Personnel Only
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
