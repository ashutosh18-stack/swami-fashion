import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter States
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Filter Values
  const categoryParam = searchParams.get('category') || '';
  const collectionParam = searchParams.get('collection') || '';
  const newArrivalParam = searchParams.get('new_arrival') || '';
  const featuredParam = searchParams.get('featured') || '';
  const searchParam = searchParams.get('search') || '';
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [sortOption, setSortOption] = useState('featured');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [catRes, collRes] = await Promise.all([
          api.getCategories(),
          api.getCollections()
        ]);
        if (catRes.success) setCategories(catRes.categories || []);
        if (collRes.success) setCollections(collRes.collections || []);
      } catch (err) {
        console.error('Error loading filters:', err);
      }
    }
    loadFilterOptions();
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const params = {
          category: categoryParam,
          collection: collectionParam,
          new_arrival: newArrivalParam,
          featured: featuredParam,
          search: searchParam,
          size: selectedSize,
          color: selectedColor,
          sort: sortOption,
          min_price: minPrice,
          max_price: maxPrice,
          limit: 40
        };

        const res = await api.getProducts(params);
        if (res.success) {
          setProducts(res.products || []);
        }
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [categoryParam, collectionParam, newArrivalParam, featuredParam, searchParam, selectedSize, selectedColor, sortOption, minPrice, maxPrice]);

  const handleCategorySelect = (slug) => {
    const next = new URLSearchParams(searchParams);
    if (slug) {
      next.set('category', slug);
    } else {
      next.delete('category');
    }
    setSearchParams(next);
  };

  const handleClearFilters = () => {
    setSelectedSize('');
    setSelectedColor('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('featured');
    setSearchParams({});
  };

  const availableSizes = ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36'];
  const availableColors = ['Sky Blue', 'White', 'Navy Blue', 'Forest Green', 'Khaki', 'Black'];

  return (
    <div className="pt-5 mt-4" style={{ minHeight: '85vh', background: '#FAF8F5' }}>
      <div className="container-fluid px-3 px-md-4 px-lg-5 py-4">
        
        {/* Header Title */}
        <div className="text-center mb-4">
          <span className="badge-luxury mb-1">SWAMI FASHION • KOLHAPUR</span>
          <h1 className="display-5 font-decorative fw-bold mb-2" style={{ color: 'var(--brand-primary)' }}>
            Men's Casual & Regular Fit Collection
          </h1>
          <p className="font-editorial fs-5 text-muted mx-auto" style={{ maxWidth: '650px' }}>
            Everyday shirts, classic polo t-shirts, comfort stretch denims, and cargo trousers priced between ₹299 to ₹1300.
          </p>
        </div>

        {/* Category Pills Bar */}
        <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mb-4">
          <button
            onClick={() => handleCategorySelect('')}
            className={`btn btn-sm rounded-pill px-3 py-1 text-uppercase ${
              !categoryParam ? 'btn-luxury-primary' : 'btn-luxury-outline'
            }`}
            style={{ fontSize: '0.78rem' }}
          >
            All Items ({products.length})
          </button>

          {categories.map((cat) => {
            const isSelected = categoryParam === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(isSelected ? '' : cat.slug)}
                className={`btn btn-sm rounded-pill px-3 py-1 text-uppercase ${
                  isSelected ? 'btn-luxury-primary' : 'btn-luxury-outline'
                }`}
                style={{ fontSize: '0.78rem' }}
              >
                {cat.name} ({cat.product_count})
              </button>
            );
          })}
        </div>

        <div className="row g-3 g-md-4">
          
          {/* Left Filter Sidebar */}
          <div className="col-lg-3 col-md-4">
            <div className="luxury-card p-3 p-md-4 sticky-top" style={{ top: '80px', zIndex: 10 }}>
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom" style={{ borderColor: 'var(--brand-border)' }}>
                <h4 className="fs-6 font-heading text-uppercase text-dark m-0 fw-bold">Filter Products</h4>
                <button
                  onClick={handleClearFilters}
                  className="btn btn-link p-0 text-decoration-none"
                  style={{ fontSize: '0.75rem', color: 'var(--brand-primary)' }}
                >
                  Reset
                </button>
              </div>

              {/* Sort Filter */}
              <div className="mb-3">
                <label className="text-uppercase text-muted d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  Sort By
                </label>
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="form-select form-control-luxury"
                  style={{ fontSize: '0.85rem' }}
                >
                  <option value="featured">Featured Picks</option>
                  <option value="newest">Newest Stock</option>
                  <option value="price_asc">Price: Low to High (₹299+)</option>
                  <option value="price_desc">Price: High to Low (₹1300)</option>
                </select>
              </div>

              {/* Sizes */}
              <div className="mb-3">
                <label className="text-uppercase text-muted d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  Size Filter
                </label>
                <div className="d-flex flex-wrap gap-1">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? '' : sz)}
                      className={`btn btn-sm ${
                        selectedSize === sz ? 'btn-luxury-primary' : 'btn-luxury-outline'
                      } px-2 py-1`}
                      style={{ fontSize: '0.72rem' }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-3">
                <label className="text-uppercase text-muted d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                  Price Filter (₹299 - ₹1300)
                </label>
                <div className="d-flex gap-2">
                  <input
                    type="number"
                    placeholder="Min ₹299"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="form-control form-control-luxury p-2"
                    style={{ fontSize: '0.8rem' }}
                  />
                  <input
                    type="number"
                    placeholder="Max ₹1300"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="form-control form-control-luxury p-2"
                    style={{ fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              {/* Collections list */}
              {collections.length > 0 && (
                <div className="pt-2 border-top" style={{ borderColor: 'var(--brand-border)' }}>
                  <label className="text-uppercase text-muted d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.08em' }}>
                    Special Editions
                  </label>
                  <ul className="list-unstyled d-flex flex-column gap-1 mb-0" style={{ fontSize: '0.8rem' }}>
                    {collections.map((coll) => (
                      <li key={coll.id}>
                        <button
                          onClick={() => {
                            const next = new URLSearchParams(searchParams);
                            if (collectionParam === coll.slug) next.delete('collection');
                            else next.set('collection', coll.slug);
                            setSearchParams(next);
                          }}
                          className={`btn btn-link p-0 text-decoration-none text-start ${
                            collectionParam === coll.slug ? 'fw-bold text-dark' : 'text-muted'
                          }`}
                          style={{ fontSize: '0.8rem', color: collectionParam === coll.slug ? 'var(--brand-primary)' : 'inherit' }}
                        >
                          {coll.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Product Grid: 2 per row on mobile (col-6), 3 on desktop (col-lg-4) */}
          <div className="col-lg-9 col-md-8">
            {isLoading ? (
              <div className="text-center py-5">
                <i className="fa-solid fa-circle-notch fa-spin text-gold fs-3"></i>
                <p className="text-muted mt-2">Loading men's collection...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-5 luxury-card p-4">
                <i className="fa-solid fa-shirt text-muted fs-1 mb-2"></i>
                <h3 className="font-decorative text-dark fs-4 mb-2">No Items Found</h3>
                <p className="text-muted mb-3">No products match your current filter selection.</p>
                <button onClick={handleClearFilters} className="btn btn-luxury-primary">
                  CLEAR FILTERS
                </button>
              </div>
            ) : (
              <div className="row g-2 g-md-3 product-grid-mobile">
                {products.map((product) => (
                  <div key={product.id} className="col-6 col-md-6 col-lg-4">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
