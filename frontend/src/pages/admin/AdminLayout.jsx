import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export default function AdminLayout() {
  const {
    admin,
    isAuthenticated,
    isLoading,
    idleSecondsLeft,
    absoluteSecondsLeft,
    sessionExpiryNotice,
    recordAdminActivity,
    logout
  } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Record user interactions to refresh idle activity
  useEffect(() => {
    const handleActivity = () => {
      recordAdminActivity();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [recordAdminActivity]);

  if (isLoading) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-dark text-light">
        <i className="fa-solid fa-circle-notch fa-spin text-gold fs-2"></i>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  // Format MM:SS for idle timer
  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const navLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: 'fa-gauge-high' },
    { name: 'Products', path: '/admin/products', icon: 'fa-shirt' },
    { name: 'Categories', path: '/admin/categories', icon: 'fa-tags' },
    { name: 'Collections', path: '/admin/collections', icon: 'fa-gem' },
    { name: 'Hero Banners', path: '/admin/banners', icon: 'fa-panorama' },
    { name: 'Website Settings', path: '/admin/settings', icon: 'fa-sliders' },
    { name: 'Security & Audit', path: '/admin/security', icon: 'fa-shield-halved' },
    { name: 'Admin Users', path: '/admin/users', icon: 'fa-users-gear' }
  ];

  return (
    <div className="d-flex" style={{ minHeight: '100vh', background: '#F8F6F2' }}>
      
      {/* Admin Light Theme Sidebar */}
      <aside className="admin-sidebar">
        
        {/* Brand Header */}
        <div className="p-4 border-bottom d-flex align-items-center gap-3" style={{ borderColor: 'rgba(90, 42, 24, 0.1)' }}>
          <div
            className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center shadow-sm"
            style={{
              width: '44px',
              height: '44px',
              border: '2px solid #C5A059',
              background: '#FFFFFF'
            }}
          >
            <img
              src={settings.logo_url || '/logo.jpg'}
              alt={settings.brand_name || 'Swami Fashion'}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          <div>
            <h5 className="font-decorative m-0 fw-bold fs-6" style={{ color: '#5A2A18', letterSpacing: '0.04em' }}>
              SWAMI FASHION
            </h5>
            <span className="text-uppercase fw-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: '#8A7A70' }}>
              ADMIN PORTAL
            </span>
          </div>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-grow-1 py-3">
          {navLinks.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/admin/dashboard'}
              className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info & Logout Button */}
        <div className="p-3 border-top" style={{ borderColor: 'rgba(90, 42, 24, 0.1)', background: '#FAF8F5' }}>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="text-truncate me-2">
              <span className="d-block fw-bold text-truncate" style={{ fontSize: '0.82rem', color: '#1C1410' }}>
                {admin?.fullName || 'Master Administrator'}
              </span>
              <div className="d-flex align-items-center gap-2 mt-1">
                <span className="font-monospace small" style={{ fontSize: '0.72rem', color: '#736155' }}>
                  @{admin?.username}
                </span>
                <span
                  className="badge py-1 px-2 fw-semibold text-uppercase"
                  style={{
                    background: admin?.role === 'main_admin' ? '#5A2A18' : '#1B2A4A',
                    color: '#FFFFFF',
                    fontSize: '0.62rem',
                    letterSpacing: '0.06em'
                  }}
                >
                  {admin?.role === 'main_admin' ? 'MAIN ADMIN' : 'SUB-ADMIN'}
                </span>
              </div>
            </div>
            <button
              onClick={logout}
              className="btn btn-sm btn-outline-danger p-2"
              title="Logout Session"
              style={{ borderRadius: '6px' }}
            >
              <i className="fa-solid fa-power-off"></i>
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm w-100 mt-2 py-1 fw-semibold text-uppercase d-flex align-items-center justify-content-center gap-1"
            style={{
              fontSize: '0.72rem',
              color: '#5A2A18',
              border: '1px solid rgba(90, 42, 24, 0.25)',
              background: '#FFFFFF'
            }}
          >
            <i className="fa-solid fa-arrow-up-right-from-square me-1"></i> View Storefront
          </a>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, background: '#F8F6F2' }}>
        
        {/* Top Bar with Real-time Security Timer */}
        <div className="admin-topbar d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <span
              className="badge px-3 py-2 fw-semibold d-flex align-items-center gap-2"
              style={{
                background: '#FAF8F5',
                color: '#5A2A18',
                border: '1px solid rgba(90, 42, 24, 0.15)',
                fontSize: '0.75rem',
                letterSpacing: '0.04em'
              }}
            >
              <i className="fa-solid fa-shield-halved text-success"></i>
              <span>{admin?.role === 'main_admin' ? 'MAIN ADMIN ACTIVE' : 'SUB-ADMIN ACTIVE'}</span>
            </span>
          </div>

          {/* Idle & Absolute Timers Warning Display */}
          <div className="d-flex align-items-center gap-4">
            <div
              className={`d-flex align-items-center gap-2 px-3 py-1 rounded border ${
                idleSecondsLeft < 60 ? 'border-danger text-danger bg-danger bg-opacity-10' : 'border-secondary text-muted'
              }`}
              style={{ fontSize: '0.78rem' }}
              title="Idle session invalidates after 5 minutes of inactivity"
            >
              <i className="fa-regular fa-clock"></i>
              <span>
                Inactivity Expiry: <strong>{formatTimer(idleSecondsLeft)}</strong>
              </span>
            </div>

            <div
              className="text-muted d-none d-md-block"
              style={{ fontSize: '0.75rem' }}
              title="Absolute session lifetime is 30 minutes"
            >
              Absolute Max: {formatTimer(absoluteSecondsLeft)}
            </div>

            <button
              onClick={logout}
              className="btn btn-sm btn-luxury-outline py-1 px-3"
              style={{ fontSize: '0.75rem' }}
            >
              LOGOUT
            </button>
          </div>
        </div>

        {/* Expired Session Notice Alert if triggered */}
        {sessionExpiryNotice && (
          <div className="alert alert-warning m-4 mb-0 d-flex align-items-center gap-2" role="alert">
            <i className="fa-solid fa-triangle-exclamation"></i>
            <span>{sessionExpiryNotice}</span>
          </div>
        )}

        {/* Page Content */}
        <div className="p-4 p-md-5 flex-grow-1">
          <Outlet />
        </div>
      </main>

    </div>
  );
}
