import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  const [banners, setBanners] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setBanners(data);
          }
        }
      } catch (err) {
        console.error('Failed to load hero banners:', err);
      }
    };
    fetchBanners();
  }, []);

  const defaultSlides = [
    {
      id: 'default-1',
      title: "MEN'S CASUAL & REGULAR FIT",
      subtitle: 'Breathable Pure Cottons, Relaxed Silhouettes and Everyday Essentials',
      media_url: '/uploads/mens_hero_banner.jpg',
      button_text: 'Shop Collection',
      button_url: '/catalogue'
    },
    {
      id: 'default-2',
      title: 'EVERYDAY PIQUE POLOS & DENIMS',
      subtitle: 'Honest Kolhapur Value from ₹299 to ₹1300 with Instant WhatsApp Ordering',
      media_url: '/uploads/mens_hero_banner_2.jpg',
      button_text: 'Explore Polos & Denims',
      button_url: '/catalogue?category=polo-tshirts'
    }
  ];

  const slides = banners.length > 0 ? banners : defaultSlides;

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const active = slides[currentSlide] || slides[0];

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

  return (
    <section
      className="position-relative overflow-hidden d-flex align-items-center"
      style={{
        minHeight: '88vh',
        marginTop: '68px',
        backgroundColor: '#FAF8F5'
      }}
    >
      {/* Background Slides with Vibrant High-Resolution Presentation */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{ zIndex: 1 }}>
        {slides.map((slide, index) => (
          <div
            key={slide.id || index}
            className={`position-absolute top-0 start-0 w-100 h-100 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <img
              src={slide.media_url}
              alt={slide.title}
              className="w-100 h-100 object-fit-cover"
              style={{
                transform: index === currentSlide ? 'scale(1.0)' : 'scale(1.04)',
                transition: 'transform 6s ease-out'
              }}
            />
            {/* Soft Ambient Light Gradient on Left for Editorial Clarity */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background: 'linear-gradient(90deg, rgba(250, 248, 245, 0.72) 0%, rgba(250, 248, 245, 0.35) 45%, transparent 75%)'
              }}
            />
          </div>
        ))}
      </div>

      {/* Hero Content Encased in Ultra-Premium Glassmorphism Card */}
      <div className="container position-relative py-5" style={{ zIndex: 10 }}>
        <div className="row">
          <div className="col-xl-6 col-lg-7 col-md-9 col-12">
            <div
              className="p-4 p-md-5 rounded-4 shadow-lg text-start"
              style={{
                background: 'rgba(255, 255, 255, 0.90)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '1px solid rgba(197, 160, 89, 0.38)',
                boxShadow: '0 25px 60px rgba(90, 42, 24, 0.12)'
              }}
            >
              {/* Store & Collection Badge */}
              <div className="d-flex align-items-center gap-2 mb-3">
                <span
                  className="badge px-3 py-2 fw-bold text-uppercase"
                  style={{
                    background: '#5A2A18',
                    color: '#FFFFFF',
                    fontSize: '0.72rem',
                    letterSpacing: '0.12em',
                    borderRadius: '4px'
                  }}
                >
                  SWAMI FASHION • KOLHAPUR
                </span>
                <span
                  className="badge px-3 py-2 fw-semibold text-uppercase"
                  style={{
                    background: 'rgba(197, 160, 89, 0.18)',
                    color: '#5A2A18',
                    fontSize: '0.72rem',
                    letterSpacing: '0.08em',
                    border: '1px solid rgba(197, 160, 89, 0.4)',
                    borderRadius: '4px'
                  }}
                >
                  REGULAR FIT COLLECTION
                </span>
              </div>

              {/* Title */}
              <h1
                className="display-5 font-decorative fw-bold mb-3 text-uppercase"
                style={{
                  color: '#5A2A18',
                  lineHeight: 1.15,
                  letterSpacing: '0.02em'
                }}
              >
                {active.title}
              </h1>

              {/* Subtitle */}
              <p
                className="lead mb-4"
                style={{
                  fontSize: '1.08rem',
                  color: '#4A3B32',
                  lineHeight: 1.6
                }}
              >
                {active.subtitle}
              </p>

              {/* Pricing & Guarantee Pill */}
              <div className="d-flex flex-wrap align-items-center gap-2 mb-4 pb-1">
                <span
                  className="badge px-3 py-2 fw-bold"
                  style={{
                    background: '#FAF8F5',
                    color: '#5A2A18',
                    border: '1px solid rgba(90, 42, 24, 0.15)',
                    fontSize: '0.85rem'
                  }}
                >
                  <i className="fa-solid fa-tag me-1" style={{ color: '#C5A059' }}></i> Prices: ₹299 to ₹1300
                </span>
                <span
                  className="badge px-3 py-2 fw-semibold text-muted"
                  style={{
                    background: '#FAF8F5',
                    border: '1px solid rgba(90, 42, 24, 0.1)',
                    fontSize: '0.8rem'
                  }}
                >
                  <i className="fa-solid fa-check text-success me-1"></i> 100% Breathable Cottons
                </span>
              </div>

              {/* CTAs */}
              <div className="d-flex flex-wrap align-items-center gap-3">
                <Link
                  to={active.button_url || '/catalogue'}
                  className="btn py-3 px-4 fw-bold text-uppercase d-inline-flex align-items-center gap-2 shadow-sm"
                  style={{
                    background: '#5A2A18',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    letterSpacing: '0.08em',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#3D1B0F';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#5A2A18';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <span>{active.button_text || 'SHOP COLLECTION'}</span>
                  <i className="fa-solid fa-arrow-right-long fs-6"></i>
                </Link>

                <Link
                  to="/contact"
                  className="btn py-3 px-4 fw-bold text-uppercase d-inline-flex align-items-center gap-2"
                  style={{
                    background: '#FFFFFF',
                    color: '#5A2A18',
                    border: '1px solid #5A2A18',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    letterSpacing: '0.08em',
                    transition: 'all 0.25s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FAF8F5';
                    e.currentTarget.style.borderColor = '#3D1B0F';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#5A2A18';
                  }}
                >
                  <span>VISIT STORE</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Slide Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="position-absolute start-0 top-50 translate-middle-y ms-3 btn p-0 rounded-circle d-none d-md-flex align-items-center justify-content-center shadow-sm"
            style={{
              width: '44px',
              height: '44px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(197, 160, 89, 0.4)',
              color: '#5A2A18',
              zIndex: 20,
              cursor: 'pointer'
            }}
            aria-label="Previous Slide"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>

          <button
            onClick={nextSlide}
            className="position-absolute end-0 top-50 translate-middle-y me-3 btn p-0 rounded-circle d-none d-md-flex align-items-center justify-content-center shadow-sm"
            style={{
              width: '44px',
              height: '44px',
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(197, 160, 89, 0.4)',
              color: '#5A2A18',
              zIndex: 20,
              cursor: 'pointer'
            }}
            aria-label="Next Slide"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </>
      )}

      {/* Slide Progress Indicators */}
      {slides.length > 1 && (
        <div
          className="position-absolute bottom-0 start-50 translate-middle-x mb-4 d-flex align-items-center gap-2"
          style={{ zIndex: 20 }}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className="btn p-0 border-0"
              style={{
                width: idx === currentSlide ? '28px' : '8px',
                height: '5px',
                borderRadius: '3px',
                background: idx === currentSlide ? '#5A2A18' : 'rgba(90, 42, 24, 0.25)',
                transition: 'all 0.3s ease'
              }}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
