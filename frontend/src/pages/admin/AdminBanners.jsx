import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tag, setTag] = useState('');
  const [mediaType, setMediaType] = useState('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [buttonText, setButtonText] = useState('Explore Collection');
  const [buttonUrl, setButtonUrl] = useState('/collections');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [successNotice, setSuccessNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadBanners = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminGetBanners();
      if (res.success) {
        setBanners(res.banners || []);
      }
    } catch (err) {
      console.error('Error loading banners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('SWAMI HAUTE COUTURE');
    setSubtitle('Royal Indian Heritage Woven into Modern Aristocracy');
    setTag('THE ROYAL BRIDAL CAMPAIGN 2026');
    setMediaType('image');
    setMediaUrl('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1920&q=85');
    setButtonText('Discover The Collection');
    setButtonUrl('/collections');
    setSortOrder(String(banners.length + 1));
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setTag(b.tag || '');
    setMediaType(b.media_type || 'image');
    setMediaUrl(b.media_url);
    setButtonText(b.button_text || 'Explore Collection');
    setButtonUrl(b.button_url || '/collections');
    setSortOrder(String(b.sort_order || 0));
    setIsActive(b.is_active === 1);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) return;

    setIsSaving(true);
    const payload = {
      title: title.trim(),
      subtitle,
      tag,
      media_type: mediaType,
      media_url: mediaUrl.trim(),
      button_text: buttonText,
      button_url: buttonUrl,
      sort_order: parseInt(sortOrder) || 0,
      is_active: isActive
    };

    try {
      if (editingBanner) {
        await api.adminUpdateBanner(editingBanner.id, payload);
        setSuccessNotice(`Banner "${title}" updated.`);
      } else {
        await api.adminCreateBanner(payload);
        setSuccessNotice(`Banner "${title}" created.`);
      }
      setIsModalOpen(false);
      loadBanners();
    } catch (err) {
      alert('Failed to save banner: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete hero slide "${b.title}"?`)) return;
    try {
      await api.adminDeleteBanner(b.id);
      setSuccessNotice(`Slide deleted.`);
      loadBanners();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge-luxury mb-1">HOMEPAGE CINEMATIC SLIDES</span>
          <h1 className="font-decorative text-gold-gradient fs-2 m-0">Hero Banner Campaign</h1>
        </div>
        <button onClick={openAddModal} className="btn-luxury-primary py-2 px-4" style={{ fontSize: '0.8rem' }}>
          <i className="fa-solid fa-plus me-2"></i> ADD HERO SLIDE
        </button>
      </div>

      {successNotice && (
        <div className="alert alert-success alert-dismissible fade show mb-4 d-flex align-items-center justify-content-between p-3" role="alert">
          <div><i className="fa-solid fa-circle-check me-2"></i>{successNotice}</div>
          <button type="button" className="btn-close btn-close-white" onClick={() => setSuccessNotice('')}></button>
        </div>
      )}

      <div className="luxury-card p-4">
        {isLoading ? (
          <div className="text-center py-5">
            <i className="fa-solid fa-circle-notch fa-spin text-gold fs-3"></i>
            <p className="text-muted mt-2">Loading hero banners...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Preview</th>
                  <th>Heading & Tagline</th>
                  <th>Tag / Campaign</th>
                  <th>Button</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b) => (
                  <tr key={b.id}>
                    <td>
                      <div className="rounded overflow-hidden" style={{ width: '80px', height: '48px' }}>
                        <img src={b.media_url} alt={b.title} className="w-100 h-100 object-fit-cover" />
                      </div>
                    </td>
                    <td>
                      <strong className="d-block" style={{ color: '#1C1410', fontSize: '0.92rem' }}>{b.title}</strong>
                      <span className="text-muted font-editorial" style={{ fontSize: '0.75rem' }}>
                        {b.subtitle}
                      </span>
                    </td>
                    <td>
                      <span className="badge-luxury py-1 px-2" style={{ fontSize: '0.65rem' }}>
                        {b.tag}
                      </span>
                    </td>
                    <td>
                      <span className="text-gold" style={{ fontSize: '0.75rem' }}>
                        {b.button_text} ({b.button_url})
                      </span>
                    </td>
                    <td>{b.sort_order}</td>
                    <td>
                      <span className={`badge ${b.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {b.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(b)}
                          className="btn btn-sm btn-luxury-outline py-1 px-2"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          className="btn btn-sm btn-outline-danger py-1 px-2"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 9999, background: 'rgba(5, 3, 2, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div className="luxury-modal-content w-100 p-4 p-md-5 position-relative" style={{ maxWidth: '650px' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              className="position-absolute top-0 end-0 m-4 btn btn-link text-decoration-none p-1"
              style={{ color: 'var(--brand-muted)' }}
            >
              <i className="fa-solid fa-xmark fs-5"></i>
            </button>

            <h3 className="font-decorative text-gold-gradient fs-4 mb-4">
              {editingBanner ? 'Edit Hero Slide' : 'Create New Hero Slide'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="mb-3 text-start">
                <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Hero Heading *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. SWAMI HAUTE COUTURE"
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Hero Tagline</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Royal Indian Heritage Woven into Modern Aristocracy"
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Campaign Badge Tag</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. THE ROYAL BRIDAL CAMPAIGN 2026"
                    className="form-control form-control-luxury"
                  />
                </div>
                <div className="col-md-6 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Media Type</label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value)}
                    className="form-select form-control-luxury"
                  >
                    <option value="image">Cinematic Image</option>
                    <option value="video">Cinematic Video (MP4)</option>
                  </select>
                </div>
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Media Image/Video URL *</label>
                <input
                  type="text"
                  required
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://..."
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Button Text</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="e.g. Discover The Collection"
                    className="form-control form-control-luxury"
                  />
                </div>
                <div className="col-md-6 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Button Destination URL</label>
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="e.g. /collections/imperial-rajputana"
                    className="form-control form-control-luxury"
                  />
                </div>
              </div>

              <div className="row g-3 mb-4 text-start">
                <div className="col-6">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="form-control form-control-luxury"
                  />
                </div>
                <div className="col-6 d-flex align-items-center pt-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="slideActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="form-check-input"
                    />
                    <label htmlFor="slideActive" className="form-check-label text-dark fs-7 ms-2 fw-medium">
                      Active Slide
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-luxury-outline py-2 px-3">
                  CANCEL
                </button>
                <button type="submit" disabled={isSaving} className="btn-luxury-primary py-2 px-4">
                  {isSaving ? 'SAVING...' : 'SAVE SLIDE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
