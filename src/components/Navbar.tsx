import type React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Sun, Moon, Globe, Phone, Mail, User, Grid } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../store/useCartStore';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar({ onOpenCart }: { onOpenCart: () => void }) {
  const { t, i18n } = useTranslation();
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { currentUser, signOut } = useAuth();

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
      navigate(`/?q=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="w-full z-50">
      {/* Target Logo Bar Design: Simba 2.0 */}
      <div className="bg-[#F47A3E] text-white py-4 shadow-lg border-b border-white/10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="bg-white rounded-full p-1 w-16 h-16 md:w-24 md:h-24 flex items-center justify-center shadow-xl transition-transform group-hover:scale-105 overflow-hidden">
              <img 
                src="/simba-logo.jpg" 
                alt="Simba Supermarket" 
                className="h-16 w-auto object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-bold font-serif leading-tight tracking-tight">
                Simba Supermarket
              </h1>
              <span className="text-sm md:text-lg font-serif italic text-white/90">
                Online Shopping
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-base md:text-lg font-medium">
            <Link to="/" className="hover:opacity-80 transition-opacity">{t('home')}</Link>
            <Link to="/shop" className="hover:opacity-80 transition-opacity">{t('shop')}</Link>
            <Link to="/about" className="hover:opacity-80 transition-opacity">{t('about', 'About us')}</Link>
            <Link to="/contact" className="hover:opacity-80 transition-opacity">{t('contactUs', 'Contact us')}</Link>
            
            {currentUser && (
              <Link to="/orders" className="hover:opacity-80 transition-opacity">
                 {t('myOrders', 'My Orders')}
              </Link>
            )}

            <div className="h-6 w-[1px] bg-white/30" />

            {/* Auth Actions */}
            <div className="flex items-center gap-4">
              {!currentUser ? (
                <>
                  <Link to="/login" className="hover:opacity-80 transition-opacity text-sm font-bold uppercase tracking-wider">
                    {t('signIn', 'Sign In')}
                  </Link>
                  <Link to="/signup" className="bg-white text-[#F47A3E] px-4 py-1.5 rounded-full text-sm font-bold hover:bg-gray-100 transition shadow-md">
                    {t('signUp', 'Sign Up')}
                  </Link>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  {currentUser.email === 'benjaminnshimiye633@gmail.com' && (
                    <Link to="/admin/orders" className="text-yellow-300 font-bold text-sm uppercase">
                       Admin
                    </Link>
                  )}
                  <button onClick={() => signOut()} className="hover:opacity-80 transition-opacity text-sm font-bold uppercase">
                     {t('logout', 'Logout')}
                  </button>
                </div>
              )}
            </div>

            <div className="h-6 w-[1px] bg-white/30" />

            {/* Cart & Utils */}
            <div className="flex items-center gap-4">
              <button onClick={onOpenCart} className="relative group p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#F47A3E]">
                  {cartCount}
                </span>
              </button>

              <button onClick={toggleTheme} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              <div className="group relative cursor-pointer p-2 bg-white/20 rounded-full hover:bg-white/30 transition">
                 <Globe className="w-5 h-5" />
                 <div className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 border-2 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg shadow-xl hidden group-hover:block z-50 overflow-hidden w-40 font-bold border-gray-400">
                   <button className="w-full text-left px-4 py-3 hover:bg-orange-500 hover:text-white text-base border-b border-gray-200 dark:border-gray-700 transition" onClick={() => changeLanguage('en')}>{t('english')}</button>
                   <button className="w-full text-left px-4 py-3 hover:bg-orange-500 hover:text-white text-base border-b border-gray-200 dark:border-gray-700 transition" onClick={() => changeLanguage('fr')}>{t('french')}</button>
                   <button className="w-full text-left px-4 py-3 hover:bg-orange-500 hover:text-white text-base transition" onClick={() => changeLanguage('rw')}>{t('kinyarwanda')}</button>
                 </div>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Icon */}
          <button className="lg:hidden p-2 text-white" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>
      </div>

      {/* Sub-header with Search (Auxiliary) */}
      <div className="bg-white dark:bg-background border-b py-3">
        <div className="container mx-auto px-4 flex items-center justify-center">
          <form onSubmit={handleSearch} className="w-full max-w-2xl flex rounded-full border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm bg-gray-50 dark:bg-card">
            <input
              type="text"
              placeholder={t('search')}
              className="w-full px-5 py-2.5 text-sm focus:outline-none bg-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="bg-[#F47A3E] text-white px-6 hover:bg-[#D46A2E] transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b bg-white dark:bg-card flex flex-col shadow-2xl animate-in slide-in-from-top duration-300">
           <nav className="flex flex-col font-bold p-2 text-foreground">
             <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50">{t('home')}</Link>
             <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50">{t('about', 'About us')}</Link>
             <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50">{t('contactUs', 'Contact us')}</Link>
             <Link to="/shop" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50">{t('shop')}</Link>
             
             {!currentUser && (
               <>
                 <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50">{t('signUp', 'Sign Up')}</Link>
                 <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50">{t('signIn', 'Sign In')}</Link>
               </>
             )}
             
             {currentUser && (
               <>
                 {currentUser.email === 'benjaminnshimiye633@gmail.com' && (
                   <Link to="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50 text-yellow-600 font-bold">Admin</Link>
                 )}
                 <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="p-4 border-b dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50 text-[#F47A3E]">{t('myOrders', 'My Orders')}</Link>
                 <button onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="p-4 border-b dark:border-border hover:bg-gray-50 dark:hover:bg-muted/50 text-left text-red-500">{t('logout', 'Logout')}</button>
               </>
             )}
           </nav>
           <div className="p-4 bg-gray-50 dark:bg-muted flex gap-4 text-foreground items-center">
             <div className="flex flex-1 gap-2">
               <button onClick={() => changeLanguage('en')} className="flex-1 py-1.5 bg-white dark:bg-card rounded shadow-sm text-[10px] font-bold">EN</button>
               <button onClick={() => changeLanguage('fr')} className="flex-1 py-1.5 bg-white dark:bg-card rounded shadow-sm text-[10px] font-bold">FR</button>
               <button onClick={() => changeLanguage('rw')} className="flex-1 py-1.5 bg-white dark:bg-card rounded shadow-sm text-[10px] font-bold">RW</button>
             </div>
             <button 
               onClick={toggleTheme} 
               className="p-3 bg-white dark:bg-card rounded-full shadow-sm hover:opacity-80 transition"
             >
               {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
             </button>
           </div>
        </div>
      )}
    </header>
  );
}
