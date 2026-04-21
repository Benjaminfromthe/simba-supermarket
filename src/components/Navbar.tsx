import type React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Sun, Moon, Globe, Phone, Mail, User, Grid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/useCartStore';
import { useState, useEffect } from 'react';

export default function Navbar({ onOpenCart }: { onOpenCart: () => void }) {
  const { t, i18n } = useTranslation();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="w-full z-50">
      {/* Top Header - Contact & Tracking */}
      <div className="hidden border-b bg-muted text-muted-foreground md:block text-xs py-2 dark:bg-card">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex gap-6">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-primary" /> +250 788 123 456</span>
            <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-primary" /> info@simbasupermarket.rw</span>
          </div>
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-3">
               <span>{t('trackOrder')}</span>
               <span className="text-gray-300">|</span>
               <span>Help & FAQs</span>
             </div>
             
             {/* Language Dropdown */}
             <div className="group relative cursor-pointer flex items-center gap-1 hover:text-primary transition-colors">
                <Globe className="w-3 h-3" /> {i18n.language.toUpperCase()}
                <div className="absolute top-full right-0 mt-1 bg-white dark:bg-card border dark:border-border text-foreground rounded shadow-lg hidden group-hover:block z-50 overflow-hidden w-32">
                  <button className="w-full text-left px-3 py-1 hover:bg-muted" onClick={() => changeLanguage('en')}>{t('english')}</button>
                  <button className="w-full text-left px-3 py-1 hover:bg-muted" onClick={() => changeLanguage('fr')}>{t('french')}</button>
                  <button className="w-full text-left px-3 py-1 hover:bg-muted" onClick={() => changeLanguage('rw')}>{t('kinyarwanda')}</button>
                </div>
             </div>
             
             {/* Theme Toggle */}
             <button onClick={toggleTheme} className="hover:text-primary transition-colors">
              {theme === 'light' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
             </button>
          </div>
        </div>
      </div>

      {/* Main Header - Logo & Search */}
      <div className="bg-white dark:bg-background border-b shadow-sm py-4">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4 lg:gap-8">
          
          {/* Logo */}
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <img 
              src="https://drive.google.com/uc?export=view&id=1sD9_n1MUfQ91TMaWr-y2Vp6yxAoPp_pN" 
              alt="Simba Logo" 
              className="h-16 w-auto object-contain hidden md:block drop-shadow-sm" 
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col text-primary leading-none uppercase">
               <span className="font-extrabold text-2xl tracking-tighter">Simba</span>
               <span className="text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400">{t('supermarket')}</span>
            </div>
          </Link>

          {/* Big Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-2xl relative">
            <form onSubmit={handleSearch} className="w-full flex rounded-full border-2 border-primary overflow-hidden h-12 shadow-sm">
              <span className="bg-gray-50 dark:bg-muted text-sm font-semibold px-4 flex items-center text-gray-600 dark:text-gray-300 border-r dark:border-gray-700 w-44 shrink-0 transition-colors">
                {t('allCategories')}
              </span>
              <input
                type="text"
                placeholder={t('search')}
                className="w-full px-4 text-sm focus:outline-none dark:bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="bg-primary hover:opacity-90 px-6 text-white transition-opacity flex items-center gap-2 font-semibold">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-5 shrink-0">
            <div className="hidden md:flex items-center gap-2 cursor-pointer hover:text-primary transition">
               <User className="w-7 h-7 text-gray-500 dark:text-gray-400" />
               <div className="flex flex-col text-left">
                 <span className="text-xs text-gray-500">{t('signIn')}</span>
                 <span className="text-sm font-bold">{t('account')}</span>
               </div>
            </div>

            <button onClick={onOpenCart} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <div className="bg-secondary/10 p-3 rounded-full group-hover:bg-secondary/20 transition">
                  <ShoppingCart className="w-6 h-6 text-secondary" />
                </div>
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-background">
                  {cartCount}
                </span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                 <span className="text-xs text-gray-500">{t('myCart')}</span>
                 <span className="text-sm font-bold text-primary">{t('priceRwf', { price: useCartStore.getState().getCartTotal().toLocaleString() })}</span>
              </div>
            </button>

            {/* Mobile Toggle */}
            <button className="lg:hidden p-2 text-gray-600 dark:text-gray-300" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Header - Navigation Menu */}
      <div className="hidden lg:block bg-primary text-white shadow-md">
         <div className="container mx-auto px-4 flex justify-between h-14 items-center">
            
            <div className="flex items-center gap-2 bg-black/20 h-full px-6 font-bold cursor-pointer hover:bg-black/30 transition uppercase">
               <Grid className="w-5 h-5" /> 
               <span>{t('browseDepartments')}</span>
            </div>

            <nav className="flex items-center gap-8 font-semibold text-sm uppercase">
               <Link to="/" className="hover:text-yellow-300 transition">{t('home')}</Link>
               <Link to="/shop" className="hover:text-yellow-300 transition">{t('shop')}</Link>
               <Link to="/shop?category=Food Products" className="hover:text-yellow-300 transition">{t('freshFood')}</Link>
               <Link to="/shop?category=Alcoholic Drinks" className="hover:text-yellow-300 transition">{t('beverages')}</Link>
               <Link to="/shop?category=Cosmetics & Personal Care" className="hover:text-yellow-300 transition">{t('beautyHealth')}</Link>
            </nav>
            
            <div className="text-sm font-bold text-yellow-300 animate-pulse uppercase">
               ⚡ {t('weekendSale')}
            </div>
         </div>
      </div>

      {/* Mobile Menu & Search (Expands below) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b bg-white dark:bg-card p-4 flex flex-col gap-4 shadow-inner">
           <form onSubmit={handleSearch} className="w-full relative border rounded-lg overflow-hidden flex">
            <input
              type="text"
              placeholder={t('search')}
              className="w-full py-3 px-4 focus:outline-none dark:bg-background"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-primary text-white px-5">
              <Search className="w-5 h-5" />
            </button>
          </form>
          
          <nav className="flex flex-col gap-3 mt-2 font-semibold">
             <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">{t('home')}</Link>
             <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">{t('shop')}</Link>
             <Link to="/shop?category=Food Products" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">{t('freshFood')}</Link>
             <Link to="/shop?category=Alcoholic Drinks" onClick={() => setIsMobileMenuOpen(false)} className="py-2 border-b">{t('beverages')}</Link>
          </nav>

          <div className="flex gap-4 mt-2 mb-2">
             <button className="flex-1 py-2 text-center rounded border hover:bg-muted font-bold" onClick={() => { changeLanguage('en'); setIsMobileMenuOpen(false)}}>{t('english')}</button>
             <button className="flex-1 py-2 text-center rounded border hover:bg-muted font-bold" onClick={() => { changeLanguage('fr'); setIsMobileMenuOpen(false)}}>{t('french')}</button>
             <button className="flex-1 py-2 text-center rounded border hover:bg-muted font-bold" onClick={() => { changeLanguage('rw'); setIsMobileMenuOpen(false)}}>{t('kinyarwanda')}</button>
          </div>
        </div>
      )}
    </header>
  );
}
