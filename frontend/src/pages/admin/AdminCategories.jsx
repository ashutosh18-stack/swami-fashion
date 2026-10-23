import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [errorNotice, setErrorNotice] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await api.adminGetCategories();
      if (res.success) {
        setCategories(res.categories || []);
      }
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80');
    setSortOrder(String(categories.length + 1));
    setIsActive(true);
    setErrorNotice('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setImageUrl(cat.image_url || '');
    setSortOrder(String(cat.sort_order || 0));
    setIsActive(cat.is_active === 1);
    setErrorNotice('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    setErrorNotice('');

    const payload = {
      name: name.trim(),
      description,
      image_url: imageUrl,
      sort_order: parseInt(sortOrder) || 0,
      is_active: isActive
    };

    try {
      if (editingCategory) {
        await api.adminUpdateCategory(editingCategory.id, payload);
        setSuccessNotice(`Category "${name}" updated successfully.`);
      } else {
        await api.adminCreateCategory(payload);
        setSuccessNotice(`Category "${name}" created successfully.`);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (err) {
      setErrorNotice(err.message || 'Failed to save category.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    // If category has products, alert user
    if (cat.product_count > 0) {
      alert(`Cannot delete "${cat.name}" because it contains ${cat.product_count} active product(s). Please reassign or delete the products first.`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      return;
    }

    try {
      await api.adminDeleteCategory(cat.id);
      setSuccessNotice(`Category "${cat.name}" deleted.`);
      loadCategories();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge-luxury mb-1">STRUCTURE & TAXONOMY</span>
          <h1 className="font-decorative text-gold-gradient fs-2 m-0">Category Management</h1>
        </div>
        <button onClick={openAddModal} className="btn-luxury-primary py-2 px-4" style={{ fontSize: '0.8rem' }}>
          <i className="fa-solid fa-plus me-2"></i> ADD CATEGORY
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
            <p className="text-muted mt-2">Loading categories...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Attached Products</th>
                  <th>Sort Order</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={cat.image_url || '/logo.jpg'}
                          alt={cat.name}
                          className="rounded"
                          style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                        />
                        <div>
                          <strong className="d-block" style={{ color: '#1C1410', fontSize: '0.92rem' }}>{cat.name}</strong>
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {cat.description?.slice(0, 50)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="text-gold">{cat.slug}</code>
                    </td>
                    <td>
                      <span className="badge bg-light border text-dark px-2 py-1" style={{ borderColor: 'rgba(90, 42, 24, 0.15)' }}>
                        {cat.product_count} Products
                      </span>
                    </td>
                    <td>{cat.sort_order}</td>
                    <td>
                      <span className={`badge ${cat.is_active ? 'bg-success' : 'bg-secondary'}`}>
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="btn btn-sm btn-luxury-outline py-1 px-2"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className={`btn btn-sm ${cat.product_count > 0 ? 'btn-outline-secondary opacity-50' : 'btn-outline-danger'} py-1 px-2`}
                          title={cat.product_count > 0 ? 'Cannot delete categories containing products' : 'Delete Category'}
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
          <div className="luxury-modal-content w-100 p-4 p-md-5 position-relative" style={{ maxWidth: '550px' }}>
            <button
              onClick={() => setIsModalOpen(false)}
              className="position-absolute top-0 end-0 m-4 btn btn-link text-decoration-none p-1"
              style={{ color: 'var(--brand-muted)' }}
            >
              <i className="fa-solid fa-xmark fs-5"></i>
            </button>

            <h3 className="font-decorative text-gold-gradient fs-4 mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>

            {errorNotice && (
              <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.85rem' }}>
                <i className="fa-solid fa-triangle-exclamation me-2"></i>{errorNotice}
              </div>
            )}

            <form onSubmit={handleSave}>
              <div className="mb-3 text-start">
                <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Heritage Bridal"
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Editorial description of the category..."
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
                      id="catActive"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="form-check-input"
                    />
                    <label htmlFor="catActive" className="form-check-label text-dark fs-7 ms-2 fw-medium">
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
                  {isSaving ? 'SAVING...' : 'SAVE CATEGORY'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
