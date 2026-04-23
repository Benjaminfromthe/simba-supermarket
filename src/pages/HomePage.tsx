import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import productsData from '../data/simba_products.json';
import ProductCard from '../components/ProductCard';
import BranchLocator from '../components/BranchLocator';
import CategoryGrid from '../components/CategoryGrid';
import { ChevronRight, Percent, Truck, ShieldCheck, Clock, Search as SearchIcon, X, Filter, ShoppingCart, MessageCircle, Phone } from 'lucide-react';
import { getLocalizedProductCategory, getLocalizedProductName } from '../lib/localize';
import { Product } from '../store/useCartStore';

const productsList = Array.isArray(productsData) ? productsData : ((productsData as any).products || []);

const CATEGORIES = Array.from(new Set(productsList.map((p: any) => p.category))).filter(Boolean).slice(0, 10) as string[];

const getLocalizedCat = (catName: string) => {
  const p = productsList.find((p: any) => p.category === catName);
  return p ? getLocalizedProductCategory(p) : catName;
}

export default function HomePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryParam = searchParams.get('category');
  const queryParam = searchParams.get('q');
  
  const isFiltered = !!(categoryParam || queryParam);

  const filteredProducts = useMemo(() => {
    let filtered = [...productsList] as Product[];
    
    if (categoryParam) {
      filtered = filtered.filter(p => p.category === categoryParam);
    }
    
    if (queryParam) {
      const q = queryParam.toLowerCase();
      filtered = filtered.filter(p => {
        const localizedName = getLocalizedProductName(p).toLowerCase();
        const localizedCat = getLocalizedProductCategory(p).toLowerCase();
        return localizedName.includes(q) || 
               p.name?.toLowerCase().includes(q) || 
               localizedCat.includes(q) || 
               p.category?.toLowerCase().includes(q);
      });
    }
    
    return isFiltered ? filtered : productsList.slice(0, 8);
  }, [categoryParam, queryParam, isFiltered]);

  const clearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="flex flex-col gap-8 pb-12 text-foreground bg-gray-50 dark:bg-background min-h-screen">
      
      {/* Show regular HomePage content only if NOT filtered */}
      {!isFiltered && (
        <>
          {/* Main Hero with Sidebar Layout */}
          <section className="container mx-auto px-4 mt-8">
            <div className="flex gap-8 items-stretch lg:h-[600px]">
               {/* Sidebar Workspace (Desktop) */}
               <div className="hidden lg:flex w-[21rem] shrink-0 flex-col gap-6">
                 <BranchLocator />
                 
                 {/* Main Categories Menu */}
                 <div className="bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
                   <div className="bg-[#F47A3E] text-white p-4 font-bold uppercase text-base flex items-center">
                      {t('allCategories')}
                   </div>
                   <div className="flex flex-col py-2 overflow-y-auto">
                     {CATEGORIES.map(cat => (
                       <button 
                         key={cat} 
                         onClick={() => setSearchParams({ category: cat })}
                         className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-muted text-left text-base font-bold border-b border-gray-100 dark:border-border flex justify-between items-center group text-foreground transition-colors"
                       >
                         <span className="group-hover:text-[#F47A3E] transition-colors">{getLocalizedCat(cat)}</span>
                         <ChevronRight className="w-5 h-5 opacity-30 group-hover:opacity-100 group-hover:text-[#F47A3E] transition-all" />
                       </button>
                     ))}
                     <Link to="/shop" className="px-5 py-4 text-sm font-black text-[#F47A3E] hover:underline transition-colors uppercase tracking-widest text-center">{t('allCategories')}</Link>
                   </div>
                 </div>
               </div>

               {/* Hero Banner Slider */}
               <div className="flex-1 relative bg-[#FFECD6] dark:bg-muted rounded-xl overflow-hidden shadow-sm h-[400px] lg:h-auto flex items-center">
                 {/* Envato 3D Concept Styling Background */}
                 <div className="absolute inset-0 z-10 bg-gradient-to-r from-orange-50/90 via-orange-50/70 to-transparent dark:from-black/90 dark:via-black/70 dark:to-transparent" />
                 <img 
                   src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" 
                   alt="Grocery Food Buying Online Delivery Concept" 
                   className="absolute right-0 w-2/3 h-full object-cover mix-blend-multiply dark:mix-blend-normal opacity-80" 
                 />
                 <div className="relative z-20 p-8 md:p-14 max-w-xl flex flex-col justify-center h-full">
                   <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight text-foreground mb-4 tracking-tight drop-shadow-sm">
                     {t('rwandasSupermarket', "Rwanda's Online Supermarket:")} <br/> 
                     <span className="text-[#F47A3E]">{t('freshGroceriesDelivered', 'Fresh groceries,')}</span> {t('deliveredToDoor', 'delivered to your door')}
                   </h1>
                   
                 </div>
               </div>
            </div>
          </section>

          {/* Action Callouts Replacing Trust Badges */}
          <section className="container mx-auto px-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Link to="/shop" className="bg-[#F47A3E] hover:bg-[#D46A2E] text-white p-6 md:p-8 rounded-2xl shadow-xl flex items-center gap-5 transition-all duration-300 active:scale-95 group overflow-hidden relative">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  <div className="bg-white/20 p-4 rounded-xl group-hover:-rotate-6 transition-transform shadow-inner">
                     <ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <div className="relative z-10">
                     <h3 className="font-black text-2xl tracking-tight mb-1">{t('shopNow', 'Shop Now')}</h3>
                     <p className="text-white font-bold text-sm tracking-wide">{t('productsCount', '500+ Products')}</p>
                  </div>
               </Link>

               <a href="https://wa.me/250788316316" target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#20bd5c] text-white p-6 md:p-8 rounded-2xl shadow-xl flex items-center gap-5 transition-all duration-300 active:scale-95 group overflow-hidden relative">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  <div className="bg-white/20 p-4 rounded-xl group-hover:-rotate-6 transition-transform shadow-inner">
                     <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
                  </div>
                  <div className="relative z-10">
                     <h3 className="font-black text-2xl tracking-tight mb-1">{t('whatsappOrder', 'WhatsApp Order')}</h3>
                     <p className="text-white font-bold text-sm tracking-wide">{t('chatWithUs', 'Chat with us')}</p>
                  </div>
               </a>

               <a href="tel:+250788316316" className="bg-gray-900 border-2 border-gray-800 hover:border-[#F47A3E] text-white p-6 md:p-8 rounded-2xl shadow-xl flex items-center gap-5 transition-all duration-300 active:scale-95 group overflow-hidden relative">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#F47A3E]/10 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
                  <div className="bg-gray-800 p-4 rounded-xl group-hover:-rotate-6 transition-transform shadow-inner">
                     <Phone className="w-8 h-8 md:w-10 md:h-10 text-[#F47A3E]" />
                  </div>
                  <div className="relative z-10">
                     <h3 className="font-black text-2xl tracking-tight mb-1">{t('callNumber', 'Call Number')}</h3>
                    <p className="text-gray-300 font-bold text-base">+250 788 316 316</p>
                  </div>
               </a>
            </div>
          </section>

          {/* Categories Grid */}
          <CategoryGrid />

          {/* Promotional Banners */}
          <section className="container mx-auto px-4 mt-4">
            <div className="grid md:grid-cols-2 gap-6">
               <div className="bg-accent/30 rounded-lg p-8 flex items-center border border-accent overflow-hidden relative min-h-[200px]">
                  <div className="z-10 relative left-0 shadow-xl p-5 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl">
                     <h3 className="text-3xl font-black flex items-center text-gray-900 dark:text-white mb-2">{t('freshFruits')}</h3>
                     <p className="mb-4 font-bold text-gray-900 dark:text-gray-100">{t('get10Off')}</p>
                     <button onClick={() => setSearchParams({ q: 'Fruit' })} className="text-base font-black text-primary hover:text-orange-700 dark:hover:text-orange-400 hover:underline border-b-2 border-primary pb-1 transition-colors uppercase tracking-wider">{t('shopNow')}</button>
                  </div>
                  <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=80" alt="Fruits" className="absolute right-0 top-0 bottom-0 h-full object-cover w-1/2 rounded-l-full shadow-xl opacity-90" />
               </div>
               <div className="bg-secondary/40 rounded-lg p-8 flex items-center border border-secondary overflow-hidden relative min-h-[200px]">
                  <div className="z-10 relative left-0 shadow-xl p-5 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl">
                     <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-2">{t('organicVeg')}</h3>
                     <p className="text-gray-900 dark:text-gray-100 mb-4 font-bold">{t('freshFromFarm')}</p>
                     <button onClick={() => setSearchParams({ q: 'Vegetable' })} className="text-base font-black text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 hover:underline border-b-2 border-gray-900 dark:border-white pb-1 transition-colors uppercase tracking-wider">{t('shopNow')}</button>
                  </div>
                  <img src="https://images.unsplash.com/photo-1598090842581-c94b8e1e4bfb?auto=format&fit=crop&w=1200&q=80" alt="Veg" className="absolute right-0 top-0 bottom-0 h-full object-cover w-1/2 rounded-l-full shadow-xl opacity-90" />
               </div>
            </div>
          </section>
        </>
      )}

      {/* Products Display (Popular or Filtered) */}
      <section className="container mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold flex items-center gap-3 text-foreground uppercase border-l-4 border-primary pl-4">
            {isFiltered ? (
              <span className="flex items-center gap-2">
                <SearchIcon className="w-6 h-6 text-primary" />
                {queryParam ? `${t('resultsFor')}: "${queryParam}"` : getLocalizedCat(categoryParam || '')}
              </span>
            ) : t('dealsOfDay')}
          </h2>
          
          {isFiltered ? (
             <button 
               onClick={clearFilters}
               className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
             >
               <X className="w-4 h-4" />
               {t('clearFilters')}
             </button>
          ) : (
            <Link to="/shop" className="text-primary font-bold hover:underline shrink-0 text-sm flex items-center gap-1">
              {t('viewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
        
        {isFiltered && filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-20 text-center shadow-lg animate-in fade-in zoom-in duration-300">
            <Filter className="w-16 h-16 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h3 className="text-xl font-bold mb-2">{t('noProductsFound')}</h3>
            <p className="text-muted-foreground mb-6">{t('tryAdjustingFilters')}</p>
            <button 
              onClick={clearFilters}
              className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition-opacity"
            >
              {t('clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(currentProduct => (
              <ProductCard key={currentProduct.id} product={currentProduct as any} />
            ))}
          </div>
        )}
      </section>
      
    </div>
  );
}
