import React, { useState } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLoginModal from './components/AdminLoginModal';
import SearchModal from './components/SearchModal';

// Storefront Pages
import Home from './pages/Home';
import CollectionsPage from './pages/CollectionsPage';
import CataloguePage from './pages/CataloguePage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminCollections from './pages/admin/AdminCollections';
import AdminBanners from './pages/admin/AdminBanners';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSecurity from './pages/admin/AdminSecurity';
import AdminUsers from './pages/admin/AdminUsers';
import Preloader from './components/Preloader';

// Public Storefront Layout with Luxury Header and Footer
function StorefrontLayout() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [showPreloader, setShowPreloader] = useState(true);

  const handlePreloaderComplete = () => {
    setShowPreloader(false);
  };

  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: '#FAF8F5' }}>
      {showPreloader && <Preloader onComplete={handlePreloaderComplete} />}
      
      <Navbar onOpenSearch={() => setIsSearchModalOpen(true)} />
      
      <main className="flex-grow-1">
        <Outlet />
      </main>

      <Footer onOpenAdminLogin={() => setIsAdminModalOpen(true)} />

      {/* Admin 2FA PIN Login Modal */}
      <AdminLoginModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />

      {/* Live Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route path="/" element={<StorefrontLayout />}>
        <Route index element={<Home />} />
        <Route path="collection" element={<CataloguePage />} />
        <Route path="collections" element={<CataloguePage />} />
        <Route path="catalogue" element={<CataloguePage />} />
        <Route path="product/:slug" element={<ProductDetailPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="contact" element={<ContactPage />} />
        {/* Category alias */}
        <Route path="category/:slug" element={<CataloguePage />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="dashboard" element={<AdminOverview />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="collections" element={<AdminCollections />} />
        <Route path="banners" element={<AdminBanners />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="security" element={<AdminSecurity />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<StorefrontLayout />}>
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
