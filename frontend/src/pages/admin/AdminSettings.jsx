import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';

export default function AdminSettings() {
  const { refreshSettings } = useSettings();
  const [formData, setFormData] = useState({
    brand_name: '',
    brand_tagline: '',
    logo_url: '',
    whatsapp_number: '',
    instagram_url: '',
    contact_email: '',
    business_address: '',
    business_hours: '',
    footer_description: '',
    about_story: '',
    about_philosophy: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [successNotice, setSuccessNotice] = useState('');
  const [errorNotice, setErrorNotice] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.adminGetSettings();
        if (res.success && res.settings) {
          setFormData(prev => ({ ...prev, ...res.settings }));
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('images', file);

    setIsUploadingLogo(true);
    try {
      const res = await api.uploadImages(data);
      if (res.success && res.urls?.length > 0) {
        setFormData(prev => ({ ...prev, logo_url: res.urls[0] }));
        setSuccessNotice('New brand logo uploaded and applied successfully.');
      }
    } catch (err) {
      alert('Logo upload failed: ' + err.message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorNotice('');
    setSuccessNotice('');

    try {
      const res = await api.adminUpdateSettings(formData);
      if (res.success) {
        setSuccessNotice('Website settings updated successfully.');
        refreshSettings();
      }
    } catch (err) {
      setErrorNotice(err.message || 'Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <i className="fa-solid fa-circle-notch fa-spin text-gold fs-3"></i>
        <p className="text-muted mt-2">Loading atelier settings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <span className="badge-luxury mb-1">GENERAL PREFERENCES</span>
        <h1 className="font-decorative text-gold-gradient fs-2 m-0">Website & Concierge Settings</h1>
      </div>

      {successNotice && (
        <div className="alert alert-success alert-dismissible fade show mb-4 d-flex align-items-center justify-content-between p-3" role="alert">
          <div><i className="fa-solid fa-circle-check me-2"></i>{successNotice}</div>
          <button type="button" className="btn-close btn-close-white" onClick={() => setSuccessNotice('')}></button>
        </div>
      )}

      {errorNotice && (
        <div className="alert alert-danger alert-dismissible fade show mb-4 d-flex align-items-center justify-content-between p-3" role="alert">
          <div><i className="fa-solid fa-triangle-exclamation me-2"></i>{errorNotice}</div>
          <button type="button" className="btn-close btn-close-white" onClick={() => setErrorNotice('')}></button>
        </div>
      )}

      <form onSubmit={handleSave}>
        
        {/* Brand Identity & Logo Card */}
        <div className="luxury-card p-4 p-md-5 mb-4">
          <h3 className="fs-5 font-heading fw-bold mb-4 pb-2 border-bottom" style={{ color: '#5A2A18', borderColor: 'rgba(90, 42, 24, 0.12)' }}>
            Maison Branding & Logo
          </h3>

          <div className="row g-4 align-items-center mb-4">
            <div className="col-md-3 text-center">
              <div
                className="rounded-circle overflow-hidden shadow-sm mx-auto position-relative"
                style={{
                  width: '120px',
                  height: '120px',
                  border: '3px solid #C5A059',
                  background: '#FFFFFF'
                }}
              >
                <img
                  src={formData.logo_url || '/logo.jpg'}
                  alt="Brand Logo"
                  className="w-100 h-100 object-fit-contain"
                />
              </div>
            </div>

            <div className="col-md-9 text-start">
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.78rem', color: '#5E4E45' }}>
                Upload Brand Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={isUploadingLogo}
                className="form-control form-control-luxury mb-2"
              />
              <span className="text-muted d-block" style={{ fontSize: '0.78rem' }}>
                {isUploadingLogo ? 'Uploading new logo...' : 'PNG, JPG, or SVG luxury insignia for storefront header and brand assets.'}
              </span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6 text-start">
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.78rem', color: '#5E4E45' }}>Brand Name</label>
              <input
                type="text"
                required
                value={formData.brand_name}
                onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })}
                className="form-control form-control-luxury"
              />
            </div>
            <div className="col-md-6 text-start">
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.78rem', color: '#5E4E45' }}>Brand Tagline</label>
              <input
                type="text"
                value={formData.brand_tagline}
                onChange={(e) => setFormData({ ...formData, brand_tagline: e.target.value })}
                className="form-control form-control-luxury"
              />
            </div>
          </div>
        </div>

        {/* Concierge & WhatsApp Order Configuration */}
        <div className="luxury-card p-4 p-md-5 mb-4">
          <h3 className="fs-5 font-heading fw-bold mb-4 pb-2 border-bottom" style={{ color: '#5A2A18', borderColor: 'rgba(90, 42, 24, 0.12)' }}>
            WhatsApp Ordering System & Contact Concierge
          </h3>

          <div className="row g-3 mb-3">
            <div className="col-md-6 text-start">
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.78rem', color: '#5E4E45' }}>
                WhatsApp Concierge Number (with Country Code) *
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border text-gold">
                  <i className="fa-brands fa-whatsapp text-success fs-5"></i>
                </span>
                <input
                  type="text"
                  required
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="e.g. 918180004630"
                  className="form-control form-control-luxury"
                />
              </div>
              <span className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                Orders initiated by customers on product pages are dynamically dispatched to this number.
              </span>
            </div>

            <div className="col-md-6 text-start">
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.78rem', color: '#5E4E45' }}>
                Official Instagram URL
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border text-danger">
                  <i className="fa-brands fa-instagram fs-5"></i>
                </span>
                <input
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  placeholder="https://www.instagram.com/swami_fashion_09/"
                  className="form-control form-control-luxury"
                />
              </div>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6 text-start">
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.78rem', color: '#5E4E45' }}>Contact Email</label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="form-control form-control-luxury"
              />
            </div>
            <div className="col-md-6 text-start">
              <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.78rem', color: '#5E4E45' }}>Business / Atelier Hours</label>
              <input
                type="text"
                value={formData.business_hours}
                onChange={(e) => setFormData({ ...formData, business_hours: e.target.value })}
                className="form-control form-control-luxury"
              />
            </div>
          </div>

          <div className="mb-3 text-start">
            <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.78rem', color: '#5E4E45' }}>Flagship Physical Store Address</label>
            <input
              type="text"
              value={formData.business_address}
              onChange={(e) => setFormData({ ...formData, business_address: e.target.value })}
              className="form-control form-control-luxury"
            />
          </div>
        </div>

        {/* Editorial Brand Narrative */}
        <div className="luxury-card p-4 p-md-5 mb-4">
          <h3 className="fs-5 font-heading fw-bold mb-4 pb-2 border-bottom" style={{ color: '#5A2A18', borderColor: 'rgba(90, 42, 24, 0.12)' }}>
            Editorial Brand Story & Footer Text
          </h3>

          <div className="mb-3 text-start">
            <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.78rem', color: '#5E4E45' }}>Footer Description Snippet</label>
            <textarea
              rows={2}
              value={formData.footer_description}
              onChange={(e) => setFormData({ ...formData, footer_description: e.target.value })}
              className="form-control form-control-luxury"
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label text-uppercase fw-semibold" style={{ fontSize: '0.78rem', color: '#5E4E45' }}>About Us - Atelier Narrative</label>
            <textarea
              rows={4}
              value={formData.about_story}
              onChange={(e) => setFormData({ ...formData, about_story: e.target.value })}
              className="form-control form-control-luxury"
            />
          </div>
        </div>

        <div className="d-flex justify-content-end gap-3">
          <button type="submit" disabled={isSaving} className="btn-luxury-primary py-3 px-5 fs-6">
            {isSaving ? 'SAVING SETTINGS...' : 'SAVE WEBSITE SETTINGS'}
          </button>
        </div>

      </form>
    </div>
  );
}
