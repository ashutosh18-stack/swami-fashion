import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';

export default function AdminProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formFabric, setFormFabric] = useState('');
  const [formCare, setFormCare] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formOriginalPrice, setFormOriginalPrice] = useState('');
  const [formStock, setFormStock] = useState('10');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formNewArrival, setFormNewArrival] = useState(false);
  const [formSizes, setFormSizes] = useState(['XS', 'S', 'M', 'L', 'XL']);
  const [sizeInput, setSizeInput] = useState('');
  const [formColors, setFormColors] = useState(['Royal Crimson', 'Antique Gold']);
  const [colorInput, setColorInput] = useState('');
  const [formImages, setFormImages] = useState([]);
  const [formCollectionIds, setFormCollectionIds] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodRes, catRes, collRes] = await Promise.all([
        api.adminGetProducts({ search: searchQuery, category_id: selectedCategory }),
        api.adminGetCategories(),
        api.adminGetCollections()
      ]);

      if (prodRes.success) setProducts(prodRes.products || []);
      if (catRes.success) setCategories(catRes.categories || []);
      if (collRes.success) setCollections(collRes.collections || []);
    } catch (err) {
      console.error('Error loading admin products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchQuery, selectedCategory]);

  // Open Add modal if url contains ?new=1
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openAddModal();
      setSearchParams({});
    }
  }, [searchParams]);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku(`SWAMI-${Math.floor(100 + Math.random() * 900)}`);
    setFormCategoryId(categories[0]?.id || '1');
    setFormDescription('');
    setFormFabric('Pure Raw Mulberry Silk & Tested Gold Zari');
    setFormCare('Specialist Dry Clean Only');
    setFormSellingPrice('85000');
    setFormOriginalPrice('95000');
    setFormStock('10');
    setFormFeatured(false);
    setFormNewArrival(true);
    setFormSizes(['XS', 'S', 'M', 'L', 'XL', 'Custom']);
    setFormColors(['Imperial Gold', 'Royal Crimson']);
    setFormImages([]);
    setFormCollectionIds([]);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = async (product) => {
    setModalError('');
    setIsModalOpen(true);
    try {
      const res = await api.adminGetProduct(product.id);
      if (res.success && res.product) {
        const p = res.product;
        setEditingProduct(p);
        setFormName(p.name);
        setFormSku(p.sku);
        setFormCategoryId(String(p.category_id));
        setFormDescription(p.description || '');
        setFormFabric(p.fabric || '');
        setFormCare(p.care_instructions || '');
        setFormSellingPrice(String(p.selling_price));
        setFormOriginalPrice(p.original_price ? String(p.original_price) : '');
        setFormStock(String(p.stock_quantity));
        setFormFeatured(p.is_featured === 1);
        setFormNewArrival(p.is_new_arrival === 1);
        setFormSizes(Array.isArray(p.available_sizes) ? p.available_sizes : []);
        setFormColors(Array.isArray(p.available_colors) ? p.available_colors : []);
        setFormImages(Array.isArray(p.images) ? p.images.map(img => img.image_url) : []);
        setFormCollectionIds(Array.isArray(p.collection_ids) ? p.collection_ids : []);
      }
    } catch (err) {
      setModalError('Could not load product details: ' + err.message);
    }
  };

  // Multiple Image Upload Handler
  const handleImageFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate size and mime types
    const validFiles = files.filter(f => f.size <= 8 * 1024 * 1024);
    if (validFiles.length < files.length) {
      alert('Some images exceeded the maximum permitted size (8 MB) and were skipped.');
    }

    const formData = new FormData();
    validFiles.forEach(file => {
      formData.append('images', file);
    });

    setIsUploading(true);
    try {
      const res = await api.uploadImages(formData);
      if (res.success && Array.isArray(res.urls)) {
        setFormImages(prev => [...prev, ...res.urls]);
      }
    } catch (err) {
      alert('Image upload failed: ' + err.message);
    } finally {
      setIsUploading(false);
      e.target.value = null;
    }
  };

  const handleAddExternalImage = () => {
    const url = prompt('Enter public image URL:');
    if (url && url.trim()) {
      setFormImages(prev => [...prev, url.trim()]);
    }
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formSku.trim() || !formSellingPrice) {
      setModalError('Product Name, SKU, and Selling Price are required.');
      return;
    }

    setIsSaving(true);
    setModalError('');

    const payload = {
      name: formName.trim(),
      sku: formSku.trim(),
      category_id: parseInt(formCategoryId) || categories[0]?.id || 1,
      description: formDescription,
      fabric: formFabric,
      care_instructions: formCare,
      selling_price: parseFloat(formSellingPrice),
      original_price: formOriginalPrice ? parseFloat(formOriginalPrice) : null,
      stock_quantity: parseInt(formStock) || 0,
      is_featured: formFeatured ? 1 : 0,
      is_new_arrival: formNewArrival ? 1 : 0,
      available_sizes: formSizes,
      available_colors: formColors,
      images: formImages.length > 0 ? formImages : ['/logo.jpg'],
      collection_ids: formCollectionIds
    };

    try {
      if (editingProduct) {
        await api.adminUpdateProduct(editingProduct.id, payload);
        setSuccessNotice(`Product "${formName}" updated successfully.`);
      } else {
        await api.adminCreateProduct(payload);
        setSuccessNotice(`Product "${formName}" created successfully.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      setModalError(err.message || 'Failed to save product.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${product.name}"?`)) {
      return;
    }

    try {
      await api.adminDeleteProduct(product.id);
      setSuccessNotice(`Product "${product.name}" deleted.`);
      loadData();
    } catch (err) {
      alert('Failed to delete product: ' + err.message);
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await api.adminToggleProductStatus(product.id);
      loadData();
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  return (
    <div>
      {/* Title & Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <span className="badge-luxury mb-1">CATALOGUE MANAGEMENT</span>
          <h1 className="font-decorative text-gold-gradient fs-2 m-0">Haute Couture Pieces</h1>
        </div>

        <button onClick={openAddModal} className="btn-luxury-primary py-2 px-4" style={{ fontSize: '0.8rem' }}>
          <i className="fa-solid fa-plus me-2"></i> CREATE NEW PRODUCT
        </button>
      </div>

      {successNotice && (
        <div className="alert alert-success alert-dismissible fade show mb-4 d-flex align-items-center justify-content-between p-3" role="alert">
          <div><i className="fa-solid fa-circle-check me-2"></i>{successNotice}</div>
          <button type="button" className="btn-close btn-close-white" onClick={() => setSuccessNotice('')}></button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="luxury-card p-3 mb-4 d-flex flex-column flex-md-row gap-3 align-items-center">
        <div className="flex-grow-1 position-relative w-100">
          <i className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 text-gold"></i>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product title or SKU..."
            className="form-control form-control-luxury ps-5"
          />
        </div>

        <div className="w-100 w-md-auto" style={{ minWidth: '220px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="form-select form-control-luxury"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="luxury-card p-4">
        {isLoading ? (
          <div className="text-center py-5">
            <i className="fa-solid fa-circle-notch fa-spin text-gold fs-3"></i>
            <p className="text-muted mt-2">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-muted fs-5 m-0">No products found matching your search.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Tags</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={p.primary_image || '/logo.jpg'}
                          alt={p.name}
                          className="rounded"
                          style={{ width: '45px', height: '58px', objectFit: 'cover' }}
                        />
                        <div>
                          <strong className="d-block" style={{ color: '#1C1410', fontSize: '0.92rem' }}>{p.name}</strong>
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                            Created: {new Date(p.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light border text-dark font-monospace px-2 py-1" style={{ fontSize: '0.75rem', borderColor: 'rgba(90, 42, 24, 0.15)' }}>
                        {p.sku}
                      </span>
                    </td>
                    <td style={{ color: '#3A2A20', fontSize: '0.88rem' }}>{p.category_name}</td>
                    <td className="fw-bold" style={{ color: '#5A2A18' }}>
                      ₹{parseFloat(p.selling_price).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={p.stock_quantity > 0 ? "text-dark fw-medium" : "text-danger fw-semibold"}>
                        {p.stock_quantity}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {p.is_featured === 1 && (
                          <span className="badge bg-warning text-dark" style={{ fontSize: '0.65rem' }}>Featured</span>
                        )}
                        {p.is_new_arrival === 1 && (
                          <span className="badge bg-danger" style={{ fontSize: '0.65rem' }}>New</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`btn btn-sm ${p.is_active ? 'btn-success' : 'btn-secondary'} py-1 px-2`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {p.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="text-end">
                      <div className="d-inline-flex gap-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="btn btn-sm btn-luxury-outline py-1 px-2"
                          title="Edit"
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="btn btn-sm btn-outline-danger py-1 px-2"
                          title="Delete"
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

      {/* Product Add / Edit Modal */}
      {isModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ zIndex: 9999, background: 'rgba(5, 3, 2, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="luxury-modal-content w-100 p-4 p-md-5 overflow-auto position-relative"
            style={{ maxWidth: '850px', maxHeight: '90vh' }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="position-absolute top-0 end-0 m-4 btn btn-link text-decoration-none p-1"
              style={{ color: 'var(--brand-muted)' }}
            >
              <i className="fa-solid fa-xmark fs-5"></i>
            </button>

            <h3 className="font-decorative text-gold-gradient fs-4 mb-4">
              {editingProduct ? 'Edit Masterpiece' : 'Add New Couture Piece'}
            </h3>

            {modalError && (
              <div className="alert alert-danger py-2 px-3 mb-4" style={{ fontSize: '0.85rem' }}>
                <i className="fa-solid fa-triangle-exclamation me-2"></i>{modalError}
              </div>
            )}

            <form onSubmit={handleSaveProduct}>
              <div className="row g-3 mb-3">
                <div className="col-md-8 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. The Maharani Velvet & Zari Bridal Lehenga"
                    className="form-control form-control-luxury"
                  />
                </div>
                <div className="col-md-4 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Product Code / SKU *</label>
                  <input
                    type="text"
                    required
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="e.g. SWAMI-BR-101"
                    className="form-control form-control-luxury"
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-4 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Category *</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="form-select form-control-luxury"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-4 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(e.target.value)}
                    placeholder="95000"
                    className="form-control form-control-luxury"
                  />
                </div>
                <div className="col-md-4 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(e.target.value)}
                    placeholder="115000"
                    className="form-control form-control-luxury"
                  />
                </div>
              </div>

              <div className="mb-3 text-start">
                <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Description</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detailed luxury storytelling describing the weave, motifs, and inspiration..."
                  className="form-control form-control-luxury"
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Fabric Specification</label>
                  <input
                    type="text"
                    value={formFabric}
                    onChange={(e) => setFormFabric(e.target.value)}
                    placeholder="e.g. 100% Pure Mulberry Silk & Real Silver Tested Zari"
                    className="form-control form-control-luxury"
                  />
                </div>
                <div className="col-md-6 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Care Instructions</label>
                  <input
                    type="text"
                    value={formCare}
                    onChange={(e) => setFormCare(e.target.value)}
                    placeholder="e.g. Specialist Dry Clean Only. Store in muslin cloth."
                    className="form-control form-control-luxury"
                  />
                </div>
              </div>

              {/* Sizes & Colors Editor */}
              <div className="row g-3 mb-4">
                <div className="col-md-6 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Available Sizes</label>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {formSizes.map((sz, idx) => (
                      <span key={idx} className="badge bg-light border text-dark px-2 py-1" style={{ borderColor: 'rgba(90, 42, 24, 0.2)' }}>
                        {sz}
                        <button
                          type="button"
                          onClick={() => setFormSizes(formSizes.filter((_, i) => i !== idx))}
                          className="btn-close ms-2"
                          style={{ fontSize: '0.5rem' }}
                        ></button>
                      </span>
                    ))}
                  </div>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      value={sizeInput}
                      onChange={(e) => setSizeInput(e.target.value)}
                      placeholder="Add size (e.g. XXL)"
                      className="form-control form-control-luxury p-1 px-2"
                      style={{ fontSize: '0.8rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => { if (sizeInput.trim()) { setFormSizes([...formSizes, sizeInput.trim()]); setSizeInput(''); } }}
                      className="btn btn-sm btn-luxury-outline"
                    >Add</button>
                  </div>
                </div>

                <div className="col-md-6 text-start">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Available Color Shades</label>
                  <div className="d-flex flex-wrap gap-2 mb-2">
                    {formColors.map((col, idx) => (
                      <span key={idx} className="badge bg-light border text-dark px-2 py-1" style={{ borderColor: 'rgba(90, 42, 24, 0.2)' }}>
                        {col}
                        <button
                          type="button"
                          onClick={() => setFormColors(formColors.filter((_, i) => i !== idx))}
                          className="btn-close ms-2"
                          style={{ fontSize: '0.5rem' }}
                        ></button>
                      </span>
                    ))}
                  </div>
                  <div className="d-flex gap-2">
                    <input
                      type="text"
                      value={colorInput}
                      onChange={(e) => setColorInput(e.target.value)}
                      placeholder="Add shade (e.g. Royal Maroon)"
                      className="form-control form-control-luxury p-1 px-2"
                      style={{ fontSize: '0.8rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => { if (colorInput.trim()) { setFormColors([...formColors, colorInput.trim()]); setColorInput(''); } }}
                      className="btn btn-sm btn-luxury-outline"
                    >Add</button>
                  </div>
                </div>
              </div>

              {/* Images Management */}
              <div className="mb-4 text-start">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <label className="form-label text-uppercase text-muted m-0" style={{ fontSize: '0.72rem' }}>
                    Gallery Images ({formImages.length})
                  </label>
                  <div className="d-flex gap-2">
                    <button type="button" onClick={handleAddExternalImage} className="btn btn-sm btn-luxury-outline py-1 px-2" style={{ fontSize: '0.72rem' }}>
                      <i className="fa-solid fa-link me-1"></i> Add Image URL
                    </button>
                  </div>
                </div>

                {/* Upload from Computer */}
                <div className="p-3 border rounded mb-3 text-center" style={{ borderColor: 'rgba(90, 42, 24, 0.15)', background: '#FAF8F5' }}>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={handleImageFileUpload}
                    className="form-control form-control-luxury"
                    disabled={isUploading}
                  />
                  <span className="text-muted d-block mt-1" style={{ fontSize: '0.7rem' }}>
                    {isUploading ? 'Uploading images to secure storage...' : 'Accepts JPEG, PNG, WEBP (Max 8 MB per file)'}
                  </span>
                </div>

                {/* Image Previews */}
                <div className="d-flex flex-wrap gap-3">
                  {formImages.map((img, idx) => (
                    <div key={idx} className="position-relative border rounded overflow-hidden" style={{ width: '80px', height: '100px' }}>
                      <img src={img} alt="Preview" className="w-100 h-100 object-fit-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="btn btn-danger position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                        style={{ width: '20px', height: '20px', borderRadius: '0 0 0 4px' }}
                      >
                        <i className="fa-solid fa-xmark fs-7"></i>
                      </button>
                      {idx === 0 && (
                        <span className="position-absolute bottom-0 start-0 w-100 bg-warning text-dark text-center fw-bold" style={{ fontSize: '0.6rem' }}>
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Badges Checkboxes */}
              <div className="row g-3 mb-4 text-start">
                <div className="col-md-4">
                  <label className="form-label text-uppercase text-muted" style={{ fontSize: '0.72rem' }}>Stock Quantity</label>
                  <input
                    type="number"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="form-control form-control-luxury"
                  />
                </div>
                <div className="col-md-4 d-flex align-items-center pt-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="featCheck"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="form-check-input"
                    />
                    <label htmlFor="featCheck" className="form-check-label text-dark fs-7 ms-2 fw-medium">
                      Mark as Featured / Royal Edit
                    </label>
                  </div>
                </div>
                <div className="col-md-4 d-flex align-items-center pt-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="newCheck"
                      checked={formNewArrival}
                      onChange={(e) => setFormNewArrival(e.target.checked)}
                      className="form-check-input"
                    />
                    <label htmlFor="newCheck" className="form-check-label text-dark fs-7 ms-2 fw-medium">
                      Mark as New Arrival
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-3 pt-3 border-top" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-luxury-outline py-2 px-4"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-luxury-primary py-2 px-4"
                >
                  {isSaving ? 'SAVING CREATION...' : 'SAVE PRODUCT'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
