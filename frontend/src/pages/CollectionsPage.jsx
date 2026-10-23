import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export default function CollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCollections() {
      try {
        const res = await api.getCollections();
        if (res.success) {
          setCollections(res.collections || []);
        }
      } catch (err) {
        console.error('Error loading collections:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCollections();
  }, []);

  return (
    <div className="pt-5 mt-5" style={{ minHeight: '80vh', background: '#FAF8F5' }}>
      <div className="container py-5 text-center">
        <h1 className="display-4 font-decorative mb-3" style={{ color: '#5A2A18' }}>Men's Casual & Regular Fit Collections</h1>
        <p className="fs-5 mx-auto mb-5" style={{ maxWidth: '650px', color: '#6E5D53' }}>
          Explore our everyday cotton shirts, breathable pique polos, and durable regular fit denims — priced from ₹299 to ₹1300.
        </p>

        {isLoading ? (
          <div className="text-center py-5">
            <i className="fa-solid fa-circle-notch fa-spin fs-3" style={{ color: '#C5A059' }}></i>
            <p className="mt-2" style={{ color: '#8A7A70' }}>Loading collections...</p>
          </div>
        ) : (
          <div className="row g-4">
            {collections.map((coll) => (
              <div key={coll.id} className="col-lg-6">
                <div
                  className="overflow-hidden text-start h-100 d-flex flex-column rounded-3"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid rgba(90, 42, 24, 0.1)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
                  }}
                >
                  <div className="position-relative" style={{ height: '320px' }}>
                    <img
                      src={coll.image_url || '/uploads/mens_casual_shirt.jpg'}
                      alt={coll.name}
                      className="w-100 h-100 object-fit-cover transition-all"
                      style={{ transition: 'transform 0.8s ease' }}
                    />
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100"
                      style={{
                        background: 'linear-gradient(180deg, transparent 50%, rgba(28,20,16,0.7) 100%)'
                      }}
                    />
                    {coll.tagline && (
                      <div className="position-absolute bottom-0 start-0 p-3">
                        <span
                          className="badge py-2 px-3 fw-semibold text-uppercase"
                          style={{
                            background: '#5A2A18',
                            color: '#FFFFFF',
                            fontSize: '0.72rem',
                            letterSpacing: '0.1em'
                          }}
                        >
                          {coll.tagline}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 d-flex flex-column justify-content-between flex-grow-1">
                    <div>
                      <h3 className="fs-4 font-decorative fw-bold mb-2" style={{ color: '#1C1410' }}>
                        {coll.name}
                      </h3>
                      <p className="fs-6 mb-4" style={{ color: '#6E5D53', lineHeight: '1.6' }}>
                        {coll.description}
                      </p>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top" style={{ borderColor: 'rgba(90, 42, 24, 0.08)' }}>
                      <span style={{ fontSize: '0.85rem', color: '#8A7A70' }}>
                        <i className="fa-solid fa-shirt me-2" style={{ color: '#C5A059' }}></i>
                        {coll.product_count || 'Regular Fit'} Designs
                      </span>
                      <Link
                        to={`/catalogue?collection=${coll.slug}`}
                        className="btn py-2 px-4 fw-semibold text-uppercase"
                        style={{
                          background: '#5A2A18',
                          color: '#FFFFFF',
                          fontSize: '0.78rem',
                          borderRadius: '6px'
                        }}
                      >
                        VIEW DESIGNS <i className="fa-solid fa-arrow-right-long ms-2"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
