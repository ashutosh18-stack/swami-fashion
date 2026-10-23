import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function ProductCard({ product }) {
  const { generateWhatsAppOrderUrl } = useSettings();
  if (!product) return null;

  const sellingPrice = parseFloat(product.selling_price || 0);
  const originalPrice = product.original_price ? parseFloat(product.original_price) : null;
  const hasDiscount = originalPrice && originalPrice > sellingPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - sellingPrice) / originalPrice) * 100) : 0;

  const primaryImage = product.primary_image || '/uploads/mens_casual_shirt.jpg';
  const sizes = Array.isArray(product.available_sizes) ? product.available_sizes : [];

  const handleQuickWhatsApp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = generateWhatsAppOrderUrl({
      product,
      selectedSize: sizes[0] || 'Standard',
      selectedColor: 'Standard',
      quantity: 1,
      currentUrl: window.location.origin + `/product/${product.slug}`
    });
    window.open(url, '_blank');
  };

  return (
    <div className="h-100">
      <div className="luxury-card h-100 d-flex flex-column bg-white">
        
        {/* Product Image */}
        <Link
          to={`/product/${product.slug}`}
          className="position-relative d-block overflow-hidden bg-light"
          style={{ paddingTop: '120%' }} // 5:6 modern fashion ratio
        >
          <img
            src={primaryImage}
            alt={product.name}
            className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
            loading="lazy"
          />

          {/* Discount Badge if available */}
          {hasDiscount && (
            <span
              className="position-absolute top-0 start-0 m-2 badge bg-danger text-white rounded-1 py-1 px-2"
              style={{ fontSize: '0.65rem' }}
            >
              {discountPercent}% OFF
            </span>
          )}

          {/* Quick WhatsApp Action Button Overlay on Mobile/Desktop */}
          <button
            onClick={handleQuickWhatsApp}
            className="btn btn-sm position-absolute bottom-0 end-0 m-2 rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
            style={{
              width: '32px',
              height: '32px',
              background: '#25D366',
              color: '#FFFFFF',
              border: 'none',
              zIndex: 3
            }}
            title="Order directly on WhatsApp"
            aria-label="Order on WhatsApp"
          >
            <i className="fa-brands fa-whatsapp fs-6"></i>
          </button>
        </Link>

        {/* Product Info */}
        <div className="p-2 p-md-3 d-flex flex-column flex-grow-1 justify-content-between text-start">
          <div>
            {/* Category / Sub-tag */}
            <span
              className="d-block text-uppercase text-truncate mb-1"
              style={{
                fontSize: '0.65rem',
                letterSpacing: '0.08em',
                color: 'var(--brand-muted)',
                fontWeight: 600
              }}
            >
              {product.category_name || "MEN'S CASUAL"}
            </span>

            {/* Product Title */}
            <h3
              className="mb-1 fw-semibold"
              style={{
                fontSize: '0.88rem',
                lineHeight: '1.3',
                fontFamily: 'var(--font-heading)',
                minHeight: '2.4em',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              <Link to={`/product/${product.slug}`} className="text-dark text-decoration-none hover-primary">
                {product.name}
              </Link>
            </h3>

            {/* Size pills */}
            {sizes.length > 0 && (
              <div className="d-flex flex-wrap gap-1 my-1">
                {sizes.slice(0, 3).map((sz, i) => (
                  <span
                    key={i}
                    className="border rounded px-1 text-muted"
                    style={{ fontSize: '0.62rem', borderColor: 'var(--brand-border)' }}
                  >
                    {sz}
                  </span>
                ))}
                {sizes.length > 3 && (
                  <span className="text-muted" style={{ fontSize: '0.62rem' }}>
                    +{sizes.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="pt-2 mt-2 border-top d-flex align-items-baseline justify-content-between" style={{ borderColor: 'rgba(90,42,24,0.08)' }}>
            <div className="d-flex align-items-baseline gap-1 gap-md-2">
              <span className="fw-bold text-dark" style={{ fontSize: '1rem', fontFamily: 'var(--font-heading)', color: 'var(--brand-primary)' }}>
                ₹{sellingPrice.toLocaleString('en-IN')}
              </span>
              {hasDiscount && (
                <span className="text-muted text-decoration-line-through" style={{ fontSize: '0.72rem' }}>
                  ₹{originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            <Link
              to={`/product/${product.slug}`}
              className="btn btn-sm p-0 text-decoration-none fw-bold"
              style={{
                fontSize: '0.72rem',
                color: 'var(--brand-primary)',
                letterSpacing: '0.05em'
              }}
            >
              VIEW <i className="fa-solid fa-arrow-right-long fs-7 ms-1"></i>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
