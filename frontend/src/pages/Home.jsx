import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { useSettings } from '../context/SettingsContext';

export default function Home() {
  const { settings } = useSettings();
  const [collections, setCollections] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [collRes, featRes, newRes] = await Promise.all([
          api.getCollections(),
          api.getProducts({ featured: 'true', limit: 8 }),
          api.getProducts({ new_arrival: 'true', limit: 8 })
        ]);

        if (collRes.success) setCollections(collRes.collections || []);
        if (featRes.success) setFeaturedProducts(featRes.products || []);
        if (newRes.success) setNewArrivals(newRes.products || []);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const whatsappPhone = (settings.whatsapp_number || '918180004630').replace(/[^\d]/g, '');

  return (
    <div className="home-page" style={{ background: '#FAF8F5' }}>
      
      {/* Hero Banner (No Campaign Badge Tag) */}
      <Hero />

      {/* Brand Introduction */}
      <section className="py-5 text-center bg-white border-bottom" style={{ borderColor: 'var(--brand-border)' }}>
        <div className="container py-3">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-10">
              <span className="badge-luxury mb-2">KOLHAPUR ATELIER</span>
              <h2 className="display-6 font-decorative fw-bold mb-3" style={{ color: 'var(--brand-primary)' }}>
                Comfortable Regular Fit Men's Clothing
              </h2>
              <div className="gold-divider">
                <i className="fa-solid fa-shirt gold-divider-icon"></i>
              </div>
              <p className="font-editorial fs-4 text-muted px-md-3 mb-0" style={{ lineHeight: '1.7' }}>
                "Crafted for the modern man who values breathability, durability, and relaxed regular fit silhouettes. From everyday cotton Oxford shirts to stretch denims and bio-washed tees, priced honestly from ₹299 to ₹1300."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Men's Collections Showcase */}
      <section className="py-5" style={{ background: '#FAF8F5' }}>
        <div className="container-fluid px-3 px-md-4 px-lg-5 py-2">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
            <div>
              <span className="badge-luxury mb-1">CURATED MEN'S EDITS</span>
              <h2 className="fs-2 font-decorative fw-bold m-0" style={{ color: 'var(--brand-primary)' }}>
                Explore Categories
              </h2>
            </div>
            <Link to="/catalogue" className="btn btn-luxury-outline mt-3 mt-md-0 py-2 px-3">
              VIEW ALL COLLECTIONS <i className="fa-solid fa-arrow-right-long ms-2"></i>
            </Link>
          </div>

          <div className="row g-3 g-md-4">
            {collections.map((coll) => (
              <div key={coll.id} className="col-lg-4 col-md-6 col-12">
                <div className="luxury-card h-100 position-relative overflow-hidden group shadow-sm" style={{ minHeight: '320px' }}>
                  <img
                    src={coll.image_url || '/uploads/mens_casual_shirt.jpg'}
                    alt={coll.name}
                    className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                  />
                  <div
                    className="position-absolute top-0 start-0 w-100 h-100"
                    style={{
                      background: 'linear-gradient(180deg, rgba(36,23,17,0.1) 40%, rgba(36,23,17,0.85) 100%)'
                    }}
                  />
                  <div className="position-absolute bottom-0 start-0 w-100 p-4 text-start text-white" style={{ zIndex: 5 }}>
                    <span className="text-uppercase text-warning fw-semibold d-block mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.12em' }}>
                      {coll.tagline}
                    </span>
                    <h3 className="fs-4 font-decorative text-white fw-bold mb-2">
                      {coll.name}
                    </h3>
                    <p className="font-editorial text-white-50 mb-3" style={{ fontSize: '0.88rem' }}>
                      {coll.description}
                    </p>
                    <Link
                      to={`/catalogue?collection=${coll.slug}`}
                      className="btn btn-sm btn-light py-2 px-3 fw-bold"
                      style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}
                    >
                      EXPLORE NOW <i className="fa-solid fa-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Men's Products (2 per row on mobile: col-6) */}
      <section className="py-5 bg-white border-top border-bottom" style={{ borderColor: 'var(--brand-border)' }}>
        <div className="container-fluid px-3 px-md-4 px-lg-5 py-2">
          <div className="d-flex justify-content-between align-items-end mb-4">
            <div>
              <span className="badge-luxury mb-1">POPULAR ESSENTIALS</span>
              <h2 className="fs-2 font-decorative fw-bold m-0" style={{ color: 'var(--brand-primary)' }}>
                Featured Casual Picks
              </h2>
            </div>
            <Link to="/catalogue" className="btn btn-luxury-outline py-2 px-3">
              SEE ALL PIECES
            </Link>
          </div>

          {/* Grid: col-6 on mobile, col-md-4 on tablet, col-lg-3 on desktop */}
          <div className="row g-2 g-md-4 product-grid-mobile">
            {featuredProducts.map((product) => (
              <div key={product.id} className="col-6 col-md-4 col-lg-3">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-5" style={{ background: '#FAF8F5' }}>
        <div className="container py-3">
          <div className="row g-3 g-md-4 text-center">
            
            <div className="col-md-3 col-6">
              <div className="p-3 p-md-4 rounded bg-white border h-100 shadow-sm" style={{ borderColor: 'var(--brand-border)' }}>
                <i className="fa-solid fa-shirt text-gold fs-3 mb-2" style={{ color: 'var(--brand-primary)' }}></i>
                <h4 className="fs-6 fw-bold text-dark mb-1">100% Breathable Cotton</h4>
                <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>Combed, pre-shrunk cotton for all-day comfort.</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="p-3 p-md-4 rounded bg-white border h-100 shadow-sm" style={{ borderColor: 'var(--brand-border)' }}>
                <i className="fa-solid fa-tag text-gold fs-3 mb-2" style={{ color: 'var(--brand-primary)' }}></i>
                <h4 className="fs-6 fw-bold text-dark mb-1">₹299 to ₹1300 Pricing</h4>
                <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>Affordable pricing without compromising fabric quality.</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="p-3 p-md-4 rounded bg-white border h-100 shadow-sm" style={{ borderColor: 'var(--brand-border)' }}>
                <i className="fa-brands fa-whatsapp text-success fs-3 mb-2"></i>
                <h4 className="fs-6 fw-bold text-dark mb-1">Instant WhatsApp Order</h4>
                <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>Order directly with one tap on WhatsApp.</p>
              </div>
            </div>

            <div className="col-md-3 col-6">
              <div className="p-3 p-md-4 rounded bg-white border h-100 shadow-sm" style={{ borderColor: 'var(--brand-border)' }}>
                <i className="fa-solid fa-store fs-3 mb-2" style={{ color: 'var(--brand-primary)' }}></i>
                <h4 className="fs-6 fw-bold text-dark mb-1">Kolhapur Store</h4>
                <p className="text-muted m-0" style={{ fontSize: '0.78rem' }}>Shivaji Peth, near School 8, Tiranga Chowk.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Fresh New Arrivals (col-6 on mobile, 2 products per row) */}
      {newArrivals.length > 0 && (
        <section className="py-5 bg-white border-top border-bottom" style={{ borderColor: 'var(--brand-border)' }}>
          <div className="container-fluid px-3 px-md-4 px-lg-5 py-2">
            <div className="d-flex justify-content-between align-items-end mb-4">
              <div>
                <span className="badge-luxury mb-1">LATEST STOCK</span>
                <h2 className="fs-2 font-decorative fw-bold m-0" style={{ color: 'var(--brand-primary)' }}>
                  Fresh In Store
                </h2>
              </div>
              <Link to="/catalogue?new_arrival=true" className="btn btn-luxury-outline py-2 px-3">
                VIEW ALL NEW
              </Link>
            </div>

            <div className="row g-2 g-md-4 product-grid-mobile">
              {newArrivals.map((product) => (
                <div key={product.id} className="col-6 col-md-4 col-lg-3">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Kolhapur Store & WhatsApp CTA */}
      <section className="py-5 text-center" style={{ background: '#FAF8F5' }}>
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <span className="badge-luxury mb-2">DIRECT ORDERING</span>
              <h2 className="display-6 font-decorative fw-bold mb-3" style={{ color: 'var(--brand-primary)' }}>
                Order Directly on WhatsApp
              </h2>
              <p className="font-editorial fs-5 text-muted mb-4">
                Have questions about sizing, fabric, or availability? Message us directly on WhatsApp at <strong>+91 8180004630</strong> or visit our Kolhapur store at Shivaji Peth.
              </p>
              <div className="d-flex flex-wrap justify-content-center gap-3">
                <a
                  href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hello Swami Fashion Kolhapur, I would like to see your latest men’s casual collection.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-luxury-primary py-3 px-4 d-inline-flex align-items-center gap-2"
                >
                  <i className="fa-brands fa-whatsapp fs-5"></i>
                  <span>CHAT ON WHATSAPP (+91 8180004630)</span>
                </a>

                <Link to="/contact" className="btn btn-luxury-outline py-3 px-4">
                  VIEW STORE LOCATION
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
