import React, { useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';

export default function ContactPage() {
  const { settings } = useSettings();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Store Inquiry & Sizing',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const whatsappPhone = (settings.whatsapp_number || '918180004630').replace(/[^\d]/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await api.submitContact(formData);
      if (res.success) {
        setSuccessMessage('Thank you. We have received your inquiry and will reply shortly.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Store Inquiry & Sizing',
          message: ''
        });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to submit your message. Please message us on WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-5 mt-4" style={{ minHeight: '85vh', background: '#FAF8F5' }}>
      <div className="container py-4">
        
        {/* Header */}
        <div className="text-center mb-5">
          <span className="badge-luxury mb-1">SWAMI FASHION • KOLHAPUR</span>
          <h1 className="display-5 font-decorative fw-bold mb-2" style={{ color: 'var(--brand-primary)' }}>
            Visit Us or Contact
          </h1>
          <p className="font-editorial fs-5 text-muted mx-auto" style={{ maxWidth: '600px' }}>
            We're located in Kolhapur at Shivaji Peth. Visit our store or connect with us instantly on WhatsApp.
          </p>
        </div>

        <div className="row g-4 g-lg-5">
          
          {/* Left Column: Kolhapur Store Details */}
          <div className="col-lg-5">
            <div className="luxury-card p-4 h-100 bg-white shadow-sm d-flex flex-column justify-content-between">
              <div>
                <h4 className="fs-5 font-heading text-dark mb-4 pb-2 border-bottom" style={{ borderColor: 'var(--brand-border)' }}>
                  Kolhapur Store Information
                </h4>

                <div className="d-flex flex-column gap-3 mb-4" style={{ fontSize: '0.9rem' }}>
                  
                  {/* Address */}
                  <div className="d-flex gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '42px',
                        height: '42px',
                        background: 'rgba(90, 42, 24, 0.08)',
                        color: 'var(--brand-primary)'
                      }}
                    >
                      <i className="fa-solid fa-location-dot fs-5"></i>
                    </div>
                    <div>
                      <strong className="d-block text-dark mb-1">Store Address</strong>
                      <span className="text-muted">
                        {settings.business_address || 'Chhatrapati Shivaji Peth, near School No. 8, Tiranga Chowk, Kolhapur.'}
                      </span>
                    </div>
                  </div>

                  {/* WhatsApp */}
                  <div className="d-flex gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '42px',
                        height: '42px',
                        background: 'rgba(37, 211, 102, 0.1)',
                        color: '#25D366'
                      }}
                    >
                      <i className="fa-brands fa-whatsapp fs-5"></i>
                    </div>
                    <div>
                      <strong className="d-block text-dark mb-1">WhatsApp Order & Inquiries</strong>
                      <a href={`https://wa.me/${whatsappPhone}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-bold text-success">
                        +91 8180004630
                      </a>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="d-flex gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '42px',
                        height: '42px',
                        background: 'rgba(225, 48, 108, 0.1)',
                        color: '#E1306C'
                      }}
                    >
                      <i className="fa-brands fa-instagram fs-5"></i>
                    </div>
                    <div>
                      <strong className="d-block text-dark mb-1">Follow on Instagram</strong>
                      <a
                        href={settings.instagram_url || 'https://www.instagram.com/swami_fashion_09/'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-decoration-none text-primary fw-medium"
                      >
                        @swami_fashion_09
                      </a>
                    </div>
                  </div>

                  {/* Opening Hours */}
                  <div className="d-flex gap-3">
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '42px',
                        height: '42px',
                        background: 'rgba(90, 42, 24, 0.08)',
                        color: 'var(--brand-primary)'
                      }}
                    >
                      <i className="fa-regular fa-clock fs-5"></i>
                    </div>
                    <div>
                      <strong className="d-block text-dark mb-1">Store Timings</strong>
                      <span className="text-muted">{settings.business_hours || 'Mon - Sun: 10:00 AM - 09:30 PM'}</span>
                    </div>
                  </div>

                </div>

                <a
                  href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hello Swami Fashion Kolhapur, I would like to visit the store.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-luxury-primary w-100 py-3 mb-3 d-flex align-items-center justify-content-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp fs-5"></i>
                  <span>DIRECT WHATSAPP (+91 8180004630)</span>
                </a>
              </div>

              {/* Google Map of Kolhapur */}
              <div className="rounded overflow-hidden border mt-2" style={{ height: '200px', borderColor: 'var(--brand-border)' }}>
                <iframe
                  title="Swami Fashion Kolhapur Store"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src="https://maps.google.com/maps?q=Chhatrapati+Shivaji+Peth,Kolhapur,Maharashtra&t=&z=14&ie=UTF8&iwloc=&output=embed"
                />
              </div>

            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="col-lg-7">
            <div className="luxury-card p-4 p-md-5 bg-white shadow-sm">
              <span className="badge-luxury mb-2">QUICK MESSAGE</span>
              <h3 className="font-decorative text-dark fs-3 mb-4">Send a Message to Swami Fashion</h3>

              {successMessage && (
                <div className="alert alert-success d-flex align-items-center gap-2 p-3 mb-4">
                  <i className="fa-solid fa-circle-check fs-5"></i>
                  <div>{successMessage}</div>
                </div>
              )}

              {errorMessage && (
                <div className="alert alert-danger d-flex align-items-center gap-2 p-3 mb-4">
                  <i className="fa-solid fa-circle-exclamation fs-5"></i>
                  <div>{errorMessage}</div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6 text-start">
                    <label className="form-label text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Your Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Patil"
                      className="form-control form-control-luxury"
                    />
                  </div>

                  <div className="col-md-6 text-start">
                    <label className="form-label text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="form-control form-control-luxury"
                    />
                  </div>
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="form-control form-control-luxury"
                  />
                </div>

                <div className="mb-3 text-start">
                  <label className="form-label text-muted fw-bold" style={{ fontSize: '0.75rem' }}>Message</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us what shirts, t-shirts, sizes, or quantities you need..."
                    className="form-control form-control-luxury"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-luxury-primary w-100 py-3"
                >
                  {isSubmitting ? 'SENDING MESSAGE...' : 'SEND INQUIRY'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
