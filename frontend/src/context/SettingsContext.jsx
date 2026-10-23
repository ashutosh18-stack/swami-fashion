import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    brand_name: 'SWAMI FASHION',
    brand_tagline: "Men's Casual & Regular Fit Clothing",
    logo_url: '/logo.jpg',
    primary_color: '#5A2A18',
    secondary_color: '#C5A059',
    accent_color: '#8E163B',
    secondary_accent: '#1B2A4A',
    background_color: '#FAF8F5',
    surface_color: '#FFFFFF',
    text_color: '#1C1410',
    muted_color: '#6E5D53',
    border_color: 'rgba(90, 42, 24, 0.12)',
    whatsapp_number: '918180004630',
    instagram_url: 'https://www.instagram.com/swami_fashion_09/',
    business_address: 'Chhatrapati Shivaji Peth, near School No. 8, Tiranga Chowk, Kolhapur.',
    contact_email: 'contact@swamifashion.com',
    business_hours: 'Mon - Sun: 10:00 AM - 09:30 PM',
    footer_description: 'Swami Fashion Kolhapur - Premium men’s casual & regular fit collection crafted for comfort, daily style, and unmatched everyday value.'
  });
  const [isLoading, setIsLoading] = useState(true);

  const applyThemeTokens = (s) => {
    const root = document.documentElement;
    if (s.primary_color) root.style.setProperty('--brand-primary', s.primary_color);
    if (s.secondary_color) root.style.setProperty('--brand-secondary', s.secondary_color);
    if (s.accent_color) root.style.setProperty('--brand-accent', s.accent_color);
    if (s.secondary_accent) root.style.setProperty('--brand-secondary-accent', s.secondary_accent);
    if (s.background_color) root.style.setProperty('--brand-background', s.background_color);
    if (s.surface_color) root.style.setProperty('--brand-surface', s.surface_color);
    if (s.text_color) root.style.setProperty('--brand-text', s.text_color);
    if (s.muted_color) root.style.setProperty('--brand-muted', s.muted_color);
    if (s.border_color) root.style.setProperty('--brand-border', s.border_color);
  };

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      if (res.success && res.settings) {
        setSettings(prev => {
          const merged = { ...prev, ...res.settings };
          applyThemeTokens(merged);
          return merged;
        });
      }
    } catch (err) {
      console.warn('Using brand defaults:', err.message);
      applyThemeTokens(settings);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const generateWhatsAppOrderUrl = ({ product, selectedSize, selectedColor, quantity, currentUrl }) => {
    const phone = (settings.whatsapp_number || '918180004630').replace(/[^\d]/g, '');
    const totalPrice = (product.selling_price * quantity).toLocaleString('en-IN');

    const message = [
      'Hello,',
      '',
      'I am interested in ordering this product.',
      '',
      `Product Name: ${product.name}`,
      `Product Code: ${product.sku || 'N/A'}`,
      `Size: ${selectedSize || 'Regular'}`,
      `Color: ${selectedColor || 'Standard'}`,
      `Quantity: ${quantity}`,
      `Total Price: ₹${totalPrice}`,
      `Product Link: ${currentUrl || window.location.href}`,
      '',
      'Please confirm availability and ordering details.'
    ].join('\n');

    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      isLoading,
      refreshSettings: loadSettings,
      generateWhatsAppOrderUrl
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
