import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { settings, generateWhatsAppOrderUrl } = useSettings();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      setIsLoading(true);
      setValidationError('');
      try {
        const res = await api.getProduct(slug);
        if (res.success && res.product) {
          setProduct(res.product);
          setRelated(res.related || []);
          setActiveImageIndex(0);

          if (Array.isArray(res.product.available_sizes) && res.product.available_sizes.length > 0) {
            setSelectedSize(res.product.available_sizes[0]);
          }
          if (Array.isArray(res.product.available_colors) && res.product.available_colors.length > 0) {
            setSelectedColor(res.product.available_colors[0]);
          }
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="pt-5 mt-5 text-center py-5" style={{ minHeight: '80vh', background: '#FAF8F5' }}>
        <div className="py-5">
          <i className="fa-solid fa-circle-notch fa-spin text-gold fs-2 mb-3"></i>
          <p className="text-muted font-editorial fs-5">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-5 mt-5 text-center py-5" style={{ minHeight: '80vh', background: '#FAF8F5' }}>
        <div className="container py-5">
          <h2 className="font-decorative text-dark mb-3">Item Not Found</h2>
          <p className="text-muted mb-4">The requested product could not be located.</p>
          <Link to="/catalogue" className="btn btn-luxury-primary">
            RETURN TO COLLECTION
          </Link>
        </div>
      </div>
    );
  }

  const sellingPrice = parseFloat(product.selling_price || 0);
  const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
  const hasDiscount = originalPrice && originalPrice > sellingPrice;
  const totalPrice = sellingPrice * quantity;

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['/uploads/mens_casual_shirt.jpg'];

  const sizes = Array.isArray(product.available_sizes) ? product.available_sizes : [];
  const colors = Array.isArray(product.available_colors) ? product.available_colors : [];

  const handleWhatsAppOrder = (e) => {
    if (sizes.length > 0 && !selectedSize) {
      e.preventDefault();
      setValidationError('Please select a size before placing your WhatsApp order.');
      return;
    }

    setValidationError('');
    const waUrl = generateWhatsAppOrderUrl({
      product,
      selectedSize,
      selectedColor,
      quantity,
      currentUrl: window.location.href
    });

    window.open(waUrl, '_blank');
  };

  return (
    <div className="pt-5 mt-4" style={{ minHeight: '85vh', background: '#FAF8F5' }}>
      <div className="container-fluid px-3 px-md-4 px-lg-5 py-4">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-4" aria-label="breadcrumb">
          <ol className="breadcrumb" style={{ fontSize: '0.82rem' }}>
            <li className="breadcrumb-item">
              <Link to="/" className="text-muted text-decoration-none">Home</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to="/catalogue" className="text-muted text-decoration-none">Collection</Link>
            </li>
            <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Main Product Showcase */}
        <div className="row g-4 g-lg-5">
          
          {/* Left Column: Gallery */}
          <div className="col-lg-7">
            <div className="row g-2 g-md-3">
              {images.length > 1 && (
                <div className="col-2 d-flex flex-column gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`btn p-0 border rounded overflow-hidden ${
                        idx === activeImageIndex ? 'border-dark shadow-sm' : 'border-light opacity-75'
                      }`}
                      style={{
                        height: '90px',
                        borderColor: idx === activeImageIndex ? 'var(--brand-primary)' : 'rgba(90,42,24,0.15)'
                      }}
                    >
                      <img
                        src={img}
                        alt={`View ${idx + 1}`}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className={images.length > 1 ? "col-10" : "col-12"}>
                <div
                  className="luxury-card overflow-hidden position-relative rounded bg-white shadow-sm"
                  style={{
                    height: '560px'
                  }}
                >
                  <img
                    src={images[activeImageIndex]}
                    alt={product.name}
                    className="w-100 h-100 object-fit-cover"
                  />

                  {hasDiscount && (
                    <span className="position-absolute top-0 start-0 m-3 badge bg-danger text-white px-2 py-1 fs-7">
                      Special Offer
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Details & WhatsApp Action */}
          <div className="col-lg-5">
            <div className="p-2 text-start">
              
              {/* Category & SKU */}
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span
                  className="text-uppercase fw-bold"
                  style={{
                    fontSize: '0.72rem',
                    letterSpacing: '0.1em',
                    color: 'var(--brand-primary)'
                  }}
                >
                  {product.category_name || "MEN'S CASUAL"}
                </span>
                <span className="badge bg-light border text-muted px-2 py-1" style={{ fontSize: '0.7rem' }}>
                  SKU: {product.sku}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-decorative text-dark fs-2 fw-bold mb-2">
                {product.name}
              </h1>

              {/* Price */}
              <div className="d-flex align-items-baseline gap-3 mb-3 pb-3 border-bottom" style={{ borderColor: 'var(--brand-border)' }}>
                <span className="display-6 fw-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--brand-primary)' }}>
                  ₹{sellingPrice.toLocaleString('en-IN')}
                </span>
                {hasDiscount && (
                  <span className="fs-5 text-muted text-decoration-line-through">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
                {hasDiscount && (
                  <span className="badge bg-success text-white py-1 px-2" style={{ fontSize: '0.72rem' }}>
                    Save ₹{(originalPrice - sellingPrice).toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-muted mb-3" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
                {product.description}
              </p>

              {/* Fabric Specs */}
              <div className="luxury-card p-3 mb-3 bg-white">
                <div className="d-flex flex-column gap-2" style={{ fontSize: '0.84rem' }}>
                  {product.fabric && (
                    <div className="d-flex">
                      <strong className="text-dark" style={{ width: '130px' }}>
                        Fabric Material:
                      </strong>
                      <span className="text-muted">{product.fabric}</span>
                    </div>
                  )}
                  {product.care_instructions && (
                    <div className="d-flex">
                      <strong className="text-dark" style={{ width: '130px' }}>
                        Care Guide:
                      </strong>
                      <span className="text-muted">{product.care_instructions}</span>
                    </div>
                  )}
                  <div className="d-flex">
                    <strong className="text-dark" style={{ width: '130px' }}>
                      In Store Stock:
                    </strong>
                    <span className={product.stock_quantity > 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
                      {product.stock_quantity > 0 ? `In Stock at Kolhapur (${product.stock_quantity} available)` : 'Restocking Soon'}
                    </span>
                  </div>
                </div>
              </div>

              {validationError && (
                <div className="alert alert-danger py-2 px-3 mb-3" style={{ fontSize: '0.82rem' }}>
                  <i className="fa-solid fa-circle-exclamation me-2"></i>{validationError}
                </div>
              )}

              {/* Size Selector */}
              {sizes.length > 0 && (
                <div className="mb-3">
                  <label className="text-uppercase text-dark fw-bold d-block mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                    Select Size: <span className="text-primary">{selectedSize}</span>
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {sizes.map((sz, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedSize(sz); setValidationError(''); }}
                        className={`btn btn-sm ${
                          selectedSize === sz ? 'btn-luxury-primary' : 'btn-luxury-outline'
                        } px-3 py-1`}
                        style={{ fontSize: '0.82rem' }}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selector */}
              {colors.length > 0 && (
                <div className="mb-3">
                  <label className="text-uppercase text-dark fw-bold d-block mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                    Select Color: <span className="text-primary">{selectedColor}</span>
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {colors.map((col, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedColor(col); setValidationError(''); }}
                        className={`btn btn-sm ${
                          selectedColor === col ? 'btn-luxury-primary' : 'btn-luxury-outline'
                        } px-3 py-1`}
                        style={{ fontSize: '0.82rem' }}
                      >
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div>
                  <label className="text-uppercase text-muted d-block mb-1" style={{ fontSize: '0.7rem' }}>
                    Quantity
                  </label>
                  <div className="d-flex align-items-center border rounded bg-white">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="btn btn-link text-dark p-2 text-decoration-none"
                    >
                      <i className="fa-solid fa-minus fs-7"></i>
                    </button>
                    <span className="px-3 fw-bold text-dark">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="btn btn-link text-dark p-2 text-decoration-none"
                    >
                      <i className="fa-solid fa-plus fs-7"></i>
                    </button>
                  </div>
                </div>

                <div className="flex-grow-1 text-end">
                  <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Total Amount</span>
                  <span className="fs-4 fw-bold" style={{ color: 'var(--brand-primary)', fontFamily: 'var(--font-heading)' }}>
                    ₹{totalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Direct WhatsApp Order Action */}
              <div className="d-flex flex-column gap-2 mb-3">
                <button
                  onClick={handleWhatsAppOrder}
                  className="btn-luxury-primary py-3 px-4 fs-6 w-100 shadow-sm"
                  style={{
                    background: '#25D366',
                    borderColor: '#1EBE5D'
                  }}
                >
                  <i className="fa-brands fa-whatsapp fs-5 me-2"></i>
                  <span>ORDER ON WHATSAPP (+91 8180004630)</span>
                </button>

                <p className="text-muted text-center m-0" style={{ fontSize: '0.75rem' }}>
                  <i className="fa-solid fa-location-dot me-1 text-primary"></i>
                  Store Location: Chhatrapati Shivaji Peth, near School No. 8, Tiranga Chowk, Kolhapur.
                </p>
              </div>

            </div>
          </div>
        </div>

        {/* Related Products in 2-column mobile layout */}
        {related.length > 0 && (
          <div className="mt-5 pt-4 border-top" style={{ borderColor: 'var(--brand-border)' }}>
            <h3 className="font-decorative text-dark fs-3 mb-4 text-start">
              Similar Men's Casual Wear
            </h3>
            <div className="row g-2 g-md-4 product-grid-mobile">
              {related.map((relProduct) => (
                <div key={relProduct.id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={relProduct} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
