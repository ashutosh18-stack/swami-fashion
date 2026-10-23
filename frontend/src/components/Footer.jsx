import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export default function Footer({ onOpenAdminLogin }) {
  const { settings } = useSettings();
  const { isAuthenticated } = useAuth();
  const currentYear = new Date().getFullYear();
  const whatsappPhone = (settings.whatsapp_number || '918180004630').replace(/[^\d]/g, '');

  return (
    <footer
      className="pt-5 border-top position-relative"
      style={{
        background: '#FAF8F5',
        borderColor: 'var(--brand-border)'
      }}
    >
      <div className="container-fluid px-3 px-md-4 px-lg-5 pt-3 pb-5">
        <div className="row g-4 g-lg-5 text-start">
          
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-circle overflow-hidden shadow-sm d-flex align-items-center justify-content-center"
                style={{
                  width: '48px',
                  height: '48px',
                  border: '2px solid var(--brand-secondary)',
                  background: '#FFFFFF'
                }}
              >
                <img
                  src={settings.logo_url || '/logo.jpg'}
                  alt={settings.brand_name || 'Swami Fashion'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <h4 className="font-decorative text-dark m-0 fw-bold fs-5">
                  {settings.brand_name || 'SWAMI FASHION'}
                </h4>
                <span
                  className="text-uppercase text-muted"
                  style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.14em',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  MEN'S CASUAL STUDIO • KOLHAPUR
                </span>
              </div>
            </div>

            <p className="text-muted pe-lg-3" style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
              {settings.footer_description || 'Swami Fashion Kolhapur - Premium men’s casual & regular fit collection crafted for comfort, daily style, and unmatched everyday value.'}
            </p>

            <div className="d-flex align-items-center gap-2 mt-3">
              <a
                href={settings.instagram_url || 'https://www.instagram.com/swami_fashion_09/'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-luxury-outline rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px' }}
                aria-label="Instagram"
              >
                <i className="fa-brands fa-instagram fs-6"></i>
              </a>

              <a
                href={`https://wa.me/${whatsappPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-luxury-outline rounded-circle p-0 d-flex align-items-center justify-content-center"
                style={{ width: '36px', height: '36px' }}
                aria-label="WhatsApp"
              >
                <i className="fa-brands fa-whatsapp fs-6 text-success"></i>
              </a>
            </div>
          </div>

          {/* Quick Links (Home, Collection, Contact) */}
          <div className="col-lg-3 col-md-6 col-6">
            <h5 className="font-heading fs-6 text-uppercase mb-3 fw-bold text-dark" style={{ letterSpacing: '0.08em' }}>
              Quick Links
            </h5>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.88rem' }}>
              <li>
                <Link to="/" className="text-decoration-none text-muted hover-dark">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="text-decoration-none text-muted hover-dark">
                  Men's Collection (₹299 - ₹1300)
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-decoration-none text-muted hover-dark">
                  Kolhapur Store & Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Men's Categories */}
          <div className="col-lg-2 col-md-6 col-6">
            <h5 className="font-heading fs-6 text-uppercase mb-3 fw-bold text-dark" style={{ letterSpacing: '0.08em' }}>
              Men's Wear
            </h5>
            <ul className="list-unstyled d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
              <li><Link to="/catalogue?category=casual-shirts" className="text-decoration-none text-muted">Casual Shirts</Link></li>
              <li><Link to="/catalogue?category=polo-tshirts" className="text-decoration-none text-muted">Polo & Tees</Link></li>
              <li><Link to="/catalogue?category=denims-jeans" className="text-decoration-none text-muted">Stretch Denims</Link></li>
              <li><Link to="/catalogue?category=chinos-cargos" className="text-decoration-none text-muted">Chinos & Cargos</Link></li>
            </ul>
          </div>

          {/* Kolhapur Store Details */}
          <div className="col-lg-3 col-md-6">
            <h5 className="font-heading fs-6 text-uppercase mb-3 fw-bold text-dark" style={{ letterSpacing: '0.08em' }}>
              Store Location
            </h5>
            <div className="d-flex flex-column gap-2 text-muted" style={{ fontSize: '0.85rem' }}>
              <div className="d-flex gap-2">
                <i className="fa-solid fa-location-dot mt-1 text-primary"></i>
                <span>Chhatrapati Shivaji Peth, near School No. 8, Tiranga Chowk, Kolhapur.</span>
              </div>
              <div className="d-flex gap-2">
                <i className="fa-brands fa-whatsapp mt-1 text-success"></i>
                <a href={`https://wa.me/${whatsappPhone}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-bold text-dark">
                  +91 8180004630
                </a>
              </div>
              <div className="d-flex gap-2">
                <i className="fa-brands fa-instagram mt-1 text-danger"></i>
                <a href="https://www.instagram.com/swami_fashion_09/" target="_blank" rel="noopener noreferrer" className="text-decoration-none text-muted">
                  @swami_fashion_09
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Separator */}
        <div className="my-4 border-top" style={{ borderColor: 'var(--brand-border)' }} />

        {/* Bottom Bar with Discreet Admin Login Button */}
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-center text-md-start">
          <p className="m-0 text-muted" style={{ fontSize: '0.78rem' }}>
            © {currentYear} {settings.brand_name || 'SWAMI FASHION'}. All Rights Reserved. Kolhapur, Maharashtra.
          </p>

          <div>
            {isAuthenticated ? (
              <Link
                to="/admin/dashboard"
                className="btn btn-sm btn-luxury-primary px-3 py-1"
                style={{ fontSize: '0.72rem' }}
              >
                <i className="fa-solid fa-gauge-high me-1"></i> ADMIN DASHBOARD
              </Link>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="btn btn-sm d-inline-flex align-items-center gap-1 px-3 py-1 border text-muted"
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  background: 'transparent',
                  borderColor: 'rgba(90, 42, 24, 0.2)',
                  borderRadius: '3px'
                }}
                title="Secure Administration Access"
              >
                <i className="fa-solid fa-lock fs-7"></i>
                <span>ADMIN LOGIN</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
