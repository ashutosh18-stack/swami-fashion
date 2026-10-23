import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

export default function AboutPage() {
  const { settings } = useSettings();

  return (
    <div className="pt-5 mt-5" style={{ minHeight: '85vh', background: '#FAF8F5' }}>
      
      {/* Editorial Hero Header */}
      <section className="py-5 text-center position-relative">
        <div className="container py-4">
          <h1 className="display-4 font-decorative mb-3" style={{ color: '#5A2A18' }}>
            The Story Behind Swami Fashion
          </h1>
          <div className="d-flex align-items-center justify-content-center gap-2 mb-4">
            <span style={{ width: '40px', height: '1px', background: '#C5A059' }}></span>
            <i className="fa-solid fa-shirt" style={{ color: '#C5A059', fontSize: '0.9rem' }}></i>
            <span style={{ width: '40px', height: '1px', background: '#C5A059' }}></span>
          </div>
          <p className="fs-5 mx-auto" style={{ maxWidth: '780px', color: '#6E5D53', lineHeight: '1.8' }}>
            "Bringing comfortable regular fit cuts, breathable cotton fabrics, and honest everyday pricing directly to the men of Kolhapur."
          </p>
        </div>
      </section>

      {/* The Medallion Crest & Symbolism */}
      <section className="py-5 position-relative" style={{ background: '#FFFFFF', borderTop: '1px solid rgba(90,42,24,0.08)', borderBottom: '1px solid rgba(90,42,24,0.08)' }}>
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-5 text-center">
              <div
                className="rounded-circle overflow-hidden shadow-sm mx-auto position-relative"
                style={{
                  width: '280px',
                  height: '280px',
                  border: '3px solid #C5A059',
                  background: '#FFFFFF',
                  padding: '12px'
                }}
              >
                <img
                  src={settings.logo_url || '/logo.jpg'}
                  alt="Swami Fashion Logo Medallion"
                  className="w-100 h-100 object-fit-contain rounded-circle"
                />
              </div>
              <p
                className="mt-3 text-uppercase fw-semibold"
                style={{ fontSize: '0.75rem', letterSpacing: '0.15em', color: '#8A7A70' }}
              >
                SWAMI FASHION • KOLHAPUR LOGO IDENTITY
              </p>
            </div>

            <div className="col-lg-7">
              <span
                className="badge mb-2 px-3 py-2 fw-semibold text-uppercase"
                style={{ background: 'rgba(90,42,24,0.08)', color: '#5A2A18', fontSize: '0.72rem', letterSpacing: '0.1em' }}
              >
                OUR HERITAGE & DESIGN PHILOSOPHY
              </span>
              <h2 className="display-6 font-decorative mb-4" style={{ color: '#1C1410' }}>
                Comfortable Men's Regular Fit Fashion
              </h2>
              <p className="fs-6 mb-4" style={{ color: '#6E5D53', lineHeight: '1.8' }}>
                {settings.about_story || 'Located in the historic heart of Kolhapur at Chhatrapati Shivaji Peth (near School No. 8, Tiranga Chowk), Swami Fashion is dedicated to providing high-quality, comfortable men’s casual wear. From soft Oxford cotton casual shirts to durable regular-fit stretch jeans and classic pique polo t-shirts, every garment is chosen for comfort, longevity, and modern everyday style.'}
              </p>
              
              <div className="d-flex flex-column gap-3">
                <div className="d-flex align-items-start gap-3">
                  <i className="fa-solid fa-shirt fs-5 mt-1" style={{ color: '#C5A059' }}></i>
                  <div>
                    <h5 className="fs-6 m-0 fw-bold" style={{ color: '#1C1410' }}>100% Breathable Cottons & Linen Blends</h5>
                    <p className="m-0" style={{ fontSize: '0.88rem', color: '#6E5D53' }}>
                      Skin-friendly fabrics tailored for warm Indian climates and all-day casual wear.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <i className="fa-solid fa-check-double fs-5 mt-1" style={{ color: '#C5A059' }}></i>
                  <div>
                    <h5 className="fs-6 m-0 fw-bold" style={{ color: '#1C1410' }}>Relaxed Regular Fit Cuts</h5>
                    <p className="m-0" style={{ fontSize: '0.88rem', color: '#6E5D53' }}>
                      No awkward tight fits — our shirts, polos, and chinos are cut generously for authentic ease of movement.
                    </p>
                  </div>
                </div>

                <div className="d-flex align-items-start gap-3">
                  <i className="fa-solid fa-tags fs-5 mt-1" style={{ color: '#C5A059' }}></i>
                  <div>
                    <h5 className="fs-6 m-0 fw-bold" style={{ color: '#1C1410' }}>Honest Pricing: ₹299 to ₹1300</h5>
                    <p className="m-0" style={{ fontSize: '0.88rem', color: '#6E5D53' }}>
                      Premium store quality directly accessible to every customer without middlemen markups.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store & Atelier Experience */}
      <section className="py-5" style={{ background: '#FAF8F5' }}>
        <div className="container py-5">
          <div className="row g-5 align-items-center flex-column-reverse flex-lg-row">
            <div className="col-lg-6">
              <span
                className="badge mb-2 px-3 py-2 fw-semibold text-uppercase"
                style={{ background: 'rgba(90,42,24,0.08)', color: '#5A2A18', fontSize: '0.72rem', letterSpacing: '0.1em' }}
              >
                VISIT OUR STORE
              </span>
              <h2 className="display-6 font-decorative mb-4" style={{ color: '#1C1410' }}>
                Kolhapur's Destination for Everyday Menswear
              </h2>
              <p className="fs-6 mb-4" style={{ color: '#6E5D53', lineHeight: '1.8' }}>
                {settings.about_philosophy || 'Whether you are shopping for daily office wear, weekend hangouts, or versatile evening casuals, Swami Fashion offers a handpicked assortment of regular fit apparel that fits your lifestyle perfectly.'}
              </p>
              <p className="mb-4" style={{ fontSize: '0.92rem', color: '#6E5D53', lineHeight: '1.7' }}>
                <strong>Store Location:</strong> {settings.business_address || 'Chhatrapati Shivaji Peth, near School No. 8, Tiranga Chowk, Kolhapur.'}<br />
                <strong>Direct WhatsApp Ordering:</strong> +91 8180004630<br />
                <strong>Follow us on Instagram:</strong> @swami_fashion_09
              </p>
              <Link
                to="/catalogue"
                className="btn py-2 px-4 fw-semibold text-uppercase"
                style={{
                  background: '#5A2A18',
                  color: '#FFFFFF',
                  borderRadius: '6px',
                  fontSize: '0.82rem'
                }}
              >
                EXPLORE MEN'S COLLECTION <i className="fa-solid fa-arrow-right-long ms-2"></i>
              </Link>
            </div>

            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6">
                  <img
                    src="/uploads/mens_casual_shirt.jpg"
                    alt="Men's Casual Shirt"
                    className="w-100 rounded-3 shadow-sm"
                    style={{ height: '320px', objectFit: 'cover' }}
                  />
                </div>
                <div className="col-6 pt-4">
                  <img
                    src="/uploads/mens_denim_jeans.jpg"
                    alt="Men's Regular Fit Denim"
                    className="w-100 rounded-3 shadow-sm"
                    style={{ height: '320px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
