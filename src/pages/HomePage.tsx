import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import productsData from '../data/simba_products.json';
import ProductCard from '../components/ProductCard';
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
               {/* Main Categories Menu */}
               <div className="hidden lg:flex w-[21rem] shrink-0 flex-col">
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
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 0.6, ease: "easeOut" }}
                 className="flex-1 relative rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(255,138,0,0.15)] h-[400px] lg:h-[600px] flex items-center border border-white/10 dark:border-white/5"
               >
                 <img 
                   src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=2000" 
                   alt="Modern Supermarket Interior" 
                   className="absolute inset-0 w-full h-full object-cover" 
                 />
                 {/* Dark Overlay for Text Pop */}
                 <div className="absolute inset-0 z-10 bg-gradient-to-r from-[#050B14]/95 via-[#050B14]/70 to-[#050B14]/30 mix-blend-multiply" />
                 <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-[2px]" />
                 
                 <div className="relative z-20 p-8 md:p-14 lg:p-20 max-w-2xl flex flex-col justify-center h-full">
                   <motion.h1 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.2 }}
                     className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight text-white mb-6 tracking-tight drop-shadow-lg"
                   >
                     {t("qualityFirst")}.<br/>
                     <span className="text-[#FF8A00] drop-shadow-[0_0_15px_rgba(255,138,0,0.5)]">{t("deliveredFast")}.</span>
                   </motion.h1>
                   
                   <motion.p 
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ duration: 0.5, delay: 0.4 }}
                     className="text-lg md:text-xl font-medium text-gray-200 mb-8 max-w-lg tracking-wide"
                   >
                     {t("heroDescription")}
                   </motion.p>
                   
                   <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ duration: 0.5, delay: 0.6 }}
                   >
                     <button 
                       onClick={() => document.getElementById('products-display')?.scrollIntoView({ behavior: 'smooth' })}
                       className="inline-flex items-center justify-center bg-[#FF8A00] text-white px-10 py-5 rounded-full font-black text-lg tracking-wide uppercase shadow-[0_0_20px_rgba(255,138,0,0.4)] hover:shadow-[0_0_35px_rgba(255,138,0,0.7)] hover:bg-[#ff9e33] transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
                     >
                       {t("startShopping")}
                     </button>
                   </motion.div>
                 </div>
               </motion.div>
            </div>
          </section>

          {/* Categories Grid */}
          <CategoryGrid />
        </>
      )}

      {/* Products Display (Popular or Filtered) */}
      <section id="products-display" className="container mx-auto px-4 mt-8">
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
