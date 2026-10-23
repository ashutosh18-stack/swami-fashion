import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.getProducts({ search: query.trim(), limit: 8 });
        if (res.success) {
          setResults(res.products || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center p-3 p-md-5"
      style={{
        zIndex: 9998,
        background: 'rgba(28, 18, 13, 0.75)',
        backdropFilter: 'blur(12px)'
      }}
    >
      <div className="w-100 position-relative luxury-card p-4 p-md-5 bg-white shadow-lg" style={{ maxWidth: '720px' }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="position-absolute end-0 top-0 m-3 btn btn-link text-decoration-none p-1 text-dark"
          aria-label="Close search"
        >
          <i className="fa-solid fa-xmark fs-4"></i>
        </button>

        <div className="text-center mb-4">
          <span
            className="text-uppercase fw-semibold"
            style={{ fontSize: '0.72rem', letterSpacing: '0.12em', color: 'var(--brand-muted)' }}
          >
            SWAMI FASHION • KOLHAPUR
          </span>
          <h3 className="font-decorative text-dark m-0 mt-1 fw-bold fs-3">Search Men's Collection</h3>
        </div>

        {/* Search Input */}
        <div className="position-relative mb-4">
          <i
            className="fa-solid fa-magnifying-glass position-absolute top-50 start-0 translate-middle-y ms-3 fs-5"
            style={{ color: 'var(--brand-primary)' }}
          ></i>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search casual shirts, polo t-shirts, denims, chinos..."
            className="form-control form-control-luxury py-3 ps-5 pe-4 fs-6"
            style={{
              borderRadius: '30px',
              border: '2px solid var(--brand-primary)'
            }}
          />
        </div>

        {/* Search Results */}
        <div
          className="overflow-auto pe-1"
          style={{ maxHeight: '55vh' }}
        >
          {isSearching && (
            <div className="text-center py-4 text-muted">
              <i className="fa-solid fa-circle-notch fa-spin fs-4 mb-2 text-primary"></i>
              <p className="m-0" style={{ fontSize: '0.85rem' }}>Searching products...</p>
            </div>
          )}

          {!isSearching && query.trim() && results.length === 0 && (
            <div className="text-center py-4 text-muted">
              <p className="m-0 fs-6">No products found matching "{query}".</p>
              <p className="m-0 mt-1 text-muted" style={{ fontSize: '0.8rem' }}>
                Try searching for 'Shirt', 'Polo', 'Denim', 'Cotton', or 'Linen'.
              </p>
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="d-flex flex-column gap-2">
              {results.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="p-3 rounded border d-flex align-items-center gap-3 text-decoration-none bg-white hover-light"
                  style={{ borderColor: 'var(--brand-border)' }}
                >
                  <img
                    src={product.primary_image || '/logo.jpg'}
                    alt={product.name}
                    className="rounded"
                    style={{ width: '50px', height: '62px', objectFit: 'cover' }}
                  />
                  <div className="flex-grow-1 text-start">
                    <span
                      className="text-uppercase fw-bold d-block"
                      style={{ fontSize: '0.65rem', letterSpacing: '0.08em', color: 'var(--brand-primary)' }}
                    >
                      {product.category_name} • {product.sku}
                    </span>
                    <h5 className="fs-6 m-0 text-dark fw-semibold">{product.name}</h5>
                    {product.fabric && (
                      <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                        {product.fabric}
                      </span>
                    )}
                  </div>
                  <div className="text-end">
                    <span className="fs-6 fw-bold text-dark">
                      ₹{parseFloat(product.selling_price).toLocaleString('en-IN')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
