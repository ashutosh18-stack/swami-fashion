import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [successNotice, setSuccessNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadCollections = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminGetCollections();
      if (res.success) {
        setCollections(res.collections || []);
      }
    } catch (err) {
      console.error('Error loading collections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const openAddModal = () => {
    setEditingCollection(null);
    setName('');
    setTagline('Centuries of Royal Grandeur');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1200&q=80');
    setSortOrder(String(collections.length + 1));
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (coll) => {
    setEditingCollection(coll);
    setName(coll.name);
    setTagline(coll.tagline || '');
    setDescription(coll.description || '');
    setImageUrl(coll.image_url || '');
    setSortOrder(String(coll.sort_order || 0));
    setIsActive(coll.is_active === 1);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    const payload = {
      name: name.trim(),
      tagline,
      description,
      image_url: imageUrl,
      sort_order: parseInt(sortOrder) || 0,
      is_active: isActive
    };

    try {
      if (editingCollection) {
        await api.adminUpdateCollection(editingCollection.id, payload);
        setSuccessNotice(`Collection "${name}" updated.`);
      } else {
        await api.adminCreateCollection(payload);
        setSuccessNotice(`Collection "${name}" created.`);
      }
      setIsModalOpen(false);
      loadCollections();
    } catch (err) {
      alert('Failed to save collection: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (coll) => {
    if (!window.confirm(`Are you sure you want to delete collection "${coll.name}"?`)) {
      return;
    }

    try {
      await api.adminDeleteCollection(coll.id);
      setSuccessNotice(`Collection "${coll.name}" deleted.`);
      loadCollections();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge-luxury mb-1">HAUTE SUITES</span>
          <h1 className="font-decorative text-gold-gradient fs-2 m-0">Collection Management</h1>
        </div>
        <button onClick={openAddModal} className="btn-luxury-primary py-2 px-4" style={{ fontSize: '0.8rem' }}>
          <i className="fa-solid fa-plus me-2"></i> ADD COLLECTION
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
            <p className="text-muted mt-2">Loading collections...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Tagline</th>
                  <th>Attached Pieces</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {collections.map((coll) => (
                  <tr key={coll.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={coll.image_url || '/logo.jpg'}
                          alt={coll.name}
                          className="rounded"
                          style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                        />
                        <div>
                          <strong className="d-block" style={{ color: '#1C1410', fontSize: '0.92rem' }}>{coll.name}</strong>
                          <code className="text-gold" style={{ fontSize: '0.72rem' }}>{coll.slug}</code>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted font-editorial fs-6">
                        {coll.tagline}
                      </span>
                    </td>
                    <td>
                      <span className="badge bg-light border text-dark px-2 py-1" style={{ borderColor: 'rgba(90, 42, 24, 0.15)' }}>
                        {coll.product_count} Pieces
                      </span>
                    </td>
                    <td>{coll.sort_order}</td>
                    <td>
                      <span className={`badge ${coll.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {coll.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(coll)}
                          className="btn btn-sm btn-luxury-outline py-1 px-2"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(coll)}
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
          <div className="luxury-modal-content w-100 p-4 p-md-5 position-relative" style={{ maxWidth: '600px' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              className="position-absolute top-0 end-0 m-4 btn btn-link text-decoration-none p-1"
              style={{ color: 'var(--brand-muted)' }}
            >
              <i className="fa-solid fa-xmark fs-5"></i>
            </button>

            <h3 className="font-decorative text-gold-gradient fs-4 mb-4">
              {editingCollection ? 'Edit Collection' : 'Create Haute Collection'}
            </h3>

            <form onSubmit={handleSave}>
              <div className="mb-3 text-start">
                <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Collection Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. The Imperial Rajputana Suite"
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Centuries of Royal Grandeur"
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Atmospheric storytelling regarding the fabrics and design inspiration..."
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="form-control form-control-luxury"
                />
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
                      id="collActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="form-check-input"
                    />
                    <label htmlFor="collActive" className="form-check-label text-dark fs-7 ms-2 fw-medium">
                      Active on Storefront
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-luxury-outline py-2 px-3">
                  CANCEL
                </button>
                <button type="submit" disabled={isSaving} className="btn-luxury-primary py-2 px-4">
                  {isSaving ? 'SAVING...' : 'SAVE COLLECTION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
