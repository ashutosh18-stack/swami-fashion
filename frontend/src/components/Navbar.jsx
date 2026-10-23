import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function Navbar({ onOpenSearch }) {
  const { settings } = useSettings();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Exactly 3 pages as requested: Home, Collection, Contact
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collection', path: '/catalogue' },
    { name: 'Contact', path: '/contact' }
  ];

  const whatsappPhone = (settings.whatsapp_number || '918180004630').replace(/[^\d]/g, '');

  return (
    <header
      className={`fixed-top ${
        isScrolled
          ? 'bg-white shadow-sm py-2 border-bottom'
          : 'bg-white py-3 border-bottom'
      }`}
      style={{
        zIndex: 1050,
        borderColor: 'var(--brand-border)',
        transition: 'all 0.3s ease',
        background: '#FFFFFF'
      }}
    >
      <div className="container-fluid px-3 px-md-4 px-lg-5">
        <div className="d-flex align-items-center justify-content-between">
          
          {/* Brand Logo & Medallion Badge */}
          <Link to="/" className="d-flex align-items-center gap-2 gap-md-3 text-decoration-none">
            <div
              className="rounded-circle overflow-hidden shadow-sm d-flex align-items-center justify-content-center flex-shrink-0"
              style={{
                width: '42px',
                height: '42px',
                border: '2px solid var(--brand-secondary)',
                background: '#FAF8F5'
              }}
            >
              <img
                src={settings.logo_url || '/logo.jpg'}
                alt={settings.brand_name || 'Swami Fashion'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <span
                className="d-block font-decorative fw-bold text-dark"
                style={{
                  fontSize: '1.15rem',
                  letterSpacing: '0.08em',
                  lineHeight: '1.1',
                  color: 'var(--brand-primary)'
                }}
              >
                {settings.brand_name || 'SWAMI FASHION'}
              </span>
              <span
                className="d-block text-uppercase"
                style={{
                  fontSize: '0.62rem',
                  letterSpacing: '0.16em',
                  color: 'var(--brand-muted)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                MEN'S CASUAL STUDIO • KOLHAPUR
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Exactly 3 Pages: Home, Collection, Contact) */}
          <nav className="d-none d-md-flex align-items-center gap-4 gap-lg-5">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path || (link.path === '/catalogue' && (location.pathname.startsWith('/product') || location.pathname.startsWith('/collections')));
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-uppercase text-decoration-none position-relative py-1 ${
                    isActive ? 'fw-bold' : 'fw-medium'
                  }`}
                  style={{
                    fontSize: '0.85rem',
                    letterSpacing: '0.12em',
                    fontFamily: 'var(--font-heading)',
                    color: isActive ? 'var(--brand-primary)' : 'var(--brand-text)'
                  }}
                >
                  {link.name}
                  {isActive && (
                    <span
                      className="position-absolute bottom-0 start-0 w-100"
                      style={{
                        height: '2px',
                        background: 'var(--brand-primary)',
                        borderRadius: '2px'
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="d-flex align-items-center gap-2 gap-sm-3">
            {onOpenSearch && (
              <button
                onClick={onOpenSearch}
                className="btn btn-link text-decoration-none p-2"
                style={{ color: 'var(--brand-primary)' }}
                aria-label="Search Collection"
                title="Search Products"
              >
                <i className="fa-solid fa-magnifying-glass fs-5"></i>
              </button>
            )}

            <a
              href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hello Swami Fashion, I would like to inquire about men’s casual collection.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-luxury-outline py-2 px-3 d-none d-sm-inline-flex align-items-center gap-2"
              style={{ fontSize: '0.78rem' }}
            >
              <i className="fa-brands fa-whatsapp text-success fs-6"></i>
              <span>+91 8180004630</span>
            </a>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="d-md-none btn btn-link text-decoration-none p-2"
              style={{ color: 'var(--brand-primary)' }}
              aria-label="Toggle navigation menu"
            >
              <i className={`fa-solid ${mobileMenuOpen ? 'fa-xmark' : 'fa-bars'} fs-4`}></i>
            </button>
          </div>
        </div>

        {/* Mobile & Small Tablet Drawer - Fixed and Glitch-Free */}
        {mobileMenuOpen && (
          <div
            className="d-md-none mt-3 p-3 rounded-3 shadow-lg border"
            style={{
              background: '#FFFFFF',
              borderColor: 'var(--brand-border)',
              position: 'relative',
              zIndex: 1060
            }}
          >
            <div className="d-flex flex-column gap-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path || (link.path === '/catalogue' && location.pathname.startsWith('/product'));
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-uppercase text-decoration-none py-2 px-3 rounded d-flex justify-content-between align-items-center"
                    style={{
                      fontSize: '0.88rem',
                      letterSpacing: '0.1em',
                      fontFamily: 'var(--font-heading)',
                      fontWeight: isActive ? '700' : '500',
                      background: isActive ? 'rgba(90, 42, 24, 0.08)' : 'transparent',
                      color: isActive ? 'var(--brand-primary)' : 'var(--brand-text)'
                    }}
                  >
                    <span>{link.name}</span>
                    <i className="fa-solid fa-chevron-right fs-7 text-muted"></i>
                  </Link>
                );
              })}

              <div className="pt-2 border-top mt-2" style={{ borderColor: 'var(--brand-border)' }}>
                <a
                  href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hello Swami Fashion, I would like to order.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-luxury-primary w-100 py-2 d-flex align-items-center justify-content-center gap-2"
                  style={{ fontSize: '0.82rem' }}
                >
                  <i className="fa-brands fa-whatsapp fs-5"></i>
                  <span>ORDER VIA WHATSAPP</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
