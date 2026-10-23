import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.getDashboardStats();
        if (res.success) {
          setStats(res.stats);
          setRecentProducts(res.recentProducts || []);
          setRecentLogs(res.recentLogs || []);
        }
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <i className="fa-solid fa-circle-notch fa-spin text-gold fs-3"></i>
        <p className="text-muted mt-2">Loading atelier metrics...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Products', value: stats?.totalProducts || 0, icon: 'fa-shirt', color: 'var(--brand-secondary)' },
    { label: 'Active Catalogues', value: stats?.activeProducts || 0, icon: 'fa-circle-check', color: '#25D366' },
    { label: 'Out of Stock', value: stats?.outOfStockProducts || 0, icon: 'fa-triangle-exclamation', color: '#E53E3E' },
    { label: 'Total Categories', value: stats?.totalCategories || 0, icon: 'fa-tags', color: 'var(--brand-secondary-light)' },
    { label: 'Haute Suites', value: stats?.totalCollections || 0, icon: 'fa-gem', color: '#FFA5BD' },
    { label: 'Featured Pieces', value: stats?.featuredProducts || 0, icon: 'fa-crown', color: '#ECC94B' }
  ];

  return (
    <div>
      {/* Page Title & Quick Actions */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-5">
        <div>
          <span className="badge-luxury mb-1">REAL-TIME OVERVIEW</span>
          <h1 className="font-decorative text-gold-gradient fs-2 m-0">Atelier Administration</h1>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/products?new=1" className="btn-luxury-primary py-2 px-3" style={{ fontSize: '0.78rem' }}>
            <i className="fa-solid fa-plus me-1"></i> ADD NEW PRODUCT
          </Link>
          <Link to="/admin/settings" className="btn-luxury-outline py-2 px-3" style={{ fontSize: '0.78rem' }}>
            <i className="fa-solid fa-sliders me-1"></i> SETTINGS
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="row g-4 mb-5">
        {statCards.map((card, idx) => (
          <div key={idx} className="col-xl-2 col-lg-4 col-sm-6">
            <div className="luxury-card p-4 h-100 d-flex flex-column justify-content-between shadow-sm">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <span className="text-uppercase fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.08em', color: '#5E4E45' }}>
                  {card.label}
                </span>
                <i className={`fa-solid ${card.icon}`} style={{ color: card.color, fontSize: '1.2rem' }}></i>
              </div>
              <h2 className="display-6 fw-bold m-0" style={{ fontFamily: 'var(--font-heading)', color: '#1C1410' }}>
                {card.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        
        {/* Recently Added Products */}
        <div className="col-lg-7">
          <div className="luxury-card p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'rgba(90, 42, 24, 0.1)' }}>
              <h3 className="fs-6 font-heading text-uppercase m-0 fw-bold" style={{ color: '#5A2A18' }}>
                Recently Added Masterpieces
              </h3>
              <Link to="/admin/products" className="btn btn-link text-gold p-0 text-decoration-none fw-semibold" style={{ fontSize: '0.78rem' }}>
                View All Products <i className="fa-solid fa-arrow-right-long ms-1"></i>
              </Link>
            </div>

            <div className="table-responsive">
              <table className="table-luxury">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentProducts.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <img
                            src={p.primary_image || '/logo.jpg'}
                            alt={p.name}
                            className="rounded"
                            style={{ width: '40px', height: '50px', objectFit: 'cover' }}
                          />
                          <div>
                            <span className="d-block text-dark fw-bold text-truncate" style={{ maxWidth: '180px', fontSize: '0.88rem' }}>
                              {p.name}
                            </span>
                            <span className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                              {p.sku}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-luxury py-1 px-2" style={{ fontSize: '0.68rem' }}>
                          {p.category_name || 'Men Regular'}
                        </span>
                      </td>
                      <td className="fw-bold" style={{ color: '#5A2A18' }}>
                        ₹{parseFloat(p.selling_price).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <span className={p.stock_quantity > 0 ? "text-dark fw-medium" : "text-danger fw-semibold"}>
                          {p.stock_quantity}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${p.is_active ? 'bg-success bg-opacity-10 text-success border border-success border-opacity-25' : 'bg-secondary bg-opacity-10 text-muted'}`} style={{ fontSize: '0.72rem' }}>
                          {p.is_active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security Audit & Activity Logs */}
        <div className="col-lg-5">
          <div className="luxury-card p-4 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom" style={{ borderColor: 'rgba(90, 42, 24, 0.1)' }}>
              <h3 className="fs-6 font-heading text-uppercase m-0 fw-bold" style={{ color: '#5A2A18' }}>
                Security & Audit Trail
              </h3>
              <Link to="/admin/security" className="btn btn-link text-gold p-0 text-decoration-none fw-semibold" style={{ fontSize: '0.78rem' }}>
                Full Log <i className="fa-solid fa-arrow-right-long ms-1"></i>
              </Link>
            </div>

            <div className="d-flex flex-column gap-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded border d-flex align-items-start gap-3"
                  style={{
                    background: '#FAF8F5',
                    borderColor: 'rgba(90, 42, 24, 0.1)'
                  }}
                >
                  <i className="fa-solid fa-shield text-gold mt-1"></i>
                  <div className="flex-grow-1" style={{ fontSize: '0.82rem' }}>
                    <div className="d-flex justify-content-between mb-1">
                      <strong style={{ color: '#1C1410' }}>{log.event_type}</strong>
                      <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                        {new Date(log.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-muted m-0 text-truncate" style={{ maxWidth: '280px', fontSize: '0.78rem' }}>
                      {log.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
