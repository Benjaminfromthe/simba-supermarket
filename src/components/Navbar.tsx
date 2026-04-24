import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Sun, Moon, Globe, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/useCartStore';
import { useAuth } from '../contexts/AuthContext';
import { AnimatePresence, motion } from 'motion/react';
import SmartSearchBar from './SmartSearchBar';

export default function Navbar({ onOpenCart }: { onOpenCart: () => void }) {
  const { t, i18n } = useTranslation();
  const cartItems = useCartStore(s => s.items);
  const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0);
  const { currentUser, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    (localStorage.getItem('simba-theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('simba-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) setLangOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const langs = [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'rw', label: 'Kinyarwanda' },
  ];

  const isAdmin = currentUser?.email === 'benjaminnshimiye633@gmail.com';

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
      {/* Top orange bar */}
      <div className="bg-[#F47A3E]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden shrink-0">
              <img 
                src="/simba-logo.jpg" 
                alt="Simba" 
                className="w-9 h-9 object-contain"
                onError={(e) => {
                  // Fallback to text logo if image fails
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="font-size:18px;font-weight:900;color:#F47A3E;">S</span>';
                }}
              />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-black text-lg leading-none">Simba</p>
              <p className="text-orange-100 text-xs font-medium leading-none">Supermarket</p>
            </div>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-6 text-white text-sm font-semibold">
            <Link to="/" className="hover:text-orange-100 transition-colors">{t('home')}</Link>
            <Link to="/shop" className="hover:text-orange-100 transition-colors">{t('shop')}</Link>
            <Link to="/about" className="hover:text-orange-100 transition-colors">{t('about')}</Link>
            <Link to="/contact" className="hover:text-orange-100 transition-colors">{t('contactUs')}</Link>
            <Link to="/reviews" className="hover:text-orange-100 transition-colors">⭐ Reviews</Link>
            {currentUser && <Link to="/orders" className="hover:text-orange-100 transition-colors">{t('myOrders')}</Link>}
            {isAdmin && <Link to="/branch-dashboard" className="text-yellow-200 hover:text-yellow-100 transition-colors font-bold">Dashboard</Link>}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Auth */}
            <div className="hidden lg:flex items-center gap-2">
              {!currentUser ? (
                <>
                  <Link to="/login" className="text-white text-sm font-bold hover:text-orange-100 transition-colors">{t('signIn')}</Link>
                  <Link to="/signup" className="bg-white text-[#F47A3E] text-sm font-bold px-4 py-1.5 rounded-full hover:bg-orange-50 transition-colors shadow-sm">{t('signUp')}</Link>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <Link to="/admin/orders" className="text-yellow-200 text-xs font-bold uppercase tracking-wide hover:text-yellow-100">{t('adminDashboard')}</Link>
                  )}
                  <button onClick={() => signOut()} className="flex items-center gap-1 text-white text-sm font-bold hover:text-orange-100 transition-colors">
                    <LogOut className="w-4 h-4" /> {t('logout')}
                  </button>
                </div>
              )}
            </div>

            <div className="w-px h-5 bg-white/30 hidden lg:block" />

            {/* Dark mode */}
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Language */}
            <div className="relative" ref={langRef}>
              <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors">
                <Globe className="w-4 h-4" />
                <span className="text-xs font-bold hidden sm:inline">{i18n.language.toUpperCase()}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden w-40 z-50">
                    {langs.map(l => (
                      <button key={l.code} onClick={() => { i18n.changeLanguage(l.code); setLangOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${i18n.language === l.code ? 'bg-[#F47A3E] text-white' : 'text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700'}`}>
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart */}
            <button onClick={onOpenCart} className="relative p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-white">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Search bar — glassmorphism */}
      <div className="navbar-glass border-b border-gray-100 dark:border-gray-800 py-2.5">
        <div className="container mx-auto px-4 flex justify-center">
          <SmartSearchBar />
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 overflow-hidden">
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {[
                { to: '/', label: t('home') },
                { to: '/shop', label: t('shop') },
                { to: '/about', label: t('about') },
                { to: '/contact', label: t('contactUs') },
                { to: '/reviews', label: '⭐ Reviews' },
                ...(currentUser ? [{ to: '/orders', label: t('myOrders') }] : []),
                ...(isAdmin ? [{ to: '/branch-dashboard', label: 'Dashboard' }] : []),
              ].map(item => (
                <Link key={item.to} to={item.to} onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors">
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                {!currentUser ? (
                  <>
                    <Link to="/login" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-700 dark:text-gray-200">{t('signIn')}</Link>
                    <Link to="/signup" onClick={() => setMobileOpen(false)} className="flex-1 text-center py-2.5 rounded-xl bg-[#F47A3E] text-white text-sm font-bold">{t('signUp')}</Link>
                  </>
                ) : (
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-bold">{t('logout')}</button>
                )}
              </div>
              <div className="flex gap-2 mt-1">
                {langs.map(l => (
                  <button key={l.code} onClick={() => { i18n.changeLanguage(l.code); setMobileOpen(false); }}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors ${i18n.language === l.code ? 'bg-[#F47A3E] text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                    {l.code.toUpperCase()}
                  </button>
                ))}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
