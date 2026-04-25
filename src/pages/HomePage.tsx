import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import productsData from '../data/simba_products.json';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { ChevronRight, Search as SearchIcon, X, Filter } from 'lucide-react';
import { getLocalizedProductCategory, getLocalizedProductName, getLocalizedCategoryName } from '../lib/localize';
import { Product } from '../store/useCartStore';

const productsList = Array.isArray(productsData) ? productsData : ((productsData as any).products || []);
const CATEGORIES = Array.from(new Set(productsList.map((p: any) => p.category))).filter(Boolean).slice(0, 10) as string[];

import catKitchenStorage from '../assets/cat-kitchen-storage.jpg';
import catCosmetics from '../assets/cat-cosmetics.jpg';
import catSports from '../assets/cat-sports.jpg';
import catBaby from '../assets/cat-baby.jpg';
import catKitchenware from '../assets/cat-kitchenware.jpg';
import catCleaning from '../assets/cat-cleaning.jpg';
import catFood from '../assets/cat-food.jpg';
import catAlcoholic from '../assets/cat-alcholic.jpg';

const CATEGORY_IMAGES: Record<string, string> = {
  'Kitchen Storage': catKitchenStorage,
  'Cosmetics & Personal Care': catCosmetics,
  'Sports & Wellness': catSports,
  'Baby Products': catBaby,
  'Kitchenware & Electronics': catKitchenware,
  'Cleaning & Sanitary': catCleaning,
  'Food Products': catFood,
  'Alcoholic Drinks': catAlcoholic,
  'General': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80',
  'Pet Care': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80',
};

const BENTO_SIZES = ['', '', '', '', '', '', '', '', '', ''];

const getLocalizedCat = (catName: string) => getLocalizedCategoryName(catName);

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-10 pb-16 text-foreground min-h-screen"
    >
      
      {/* Show regular HomePage content only if NOT filtered */}
      {!isFiltered && (
        <>
          {/* Main Hero */}
          <section className="container mx-auto px-4 mt-8">
            <div className="flex gap-8 items-stretch lg:h-[600px]">
               {/* Hero Banner */}
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

                   {/* Value props */}
                   <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ duration: 0.5, delay: 0.8 }}
                     className="flex flex-wrap gap-4 mt-8"
                   >
                     {[
                       { icon: '⚡', label: t('fastPickup', '45-min Pick-up') },
                       { icon: '📱', label: t('momoPayment', 'MoMo Payment') },
                       { icon: '🛒', label: `789+ ${t('productsCount', 'Products')}` },
                       { icon: '📍', label: t('branchesCount', '9 Branches') },
                     ].map((v) => (
                       <div key={v.label} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-semibold">
                         <span>{v.icon}</span>
                         <span>{v.label}</span>
                       </div>
                     ))}
                   </motion.div>
                 </div>
               </motion.div>
            </div>
          </section>

          {/* BENTO GRID CATEGORIES */}
          <section className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl font-black text-gray-900 dark:text-white">Shop by Category</h2>
              <Link to="/shop" className="text-[#F47A3E] text-sm font-semibold hover:underline flex items-center gap-1">
                {t('viewAll')} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="bento-grid">
              {CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className={`bento-item ${BENTO_SIZES[i] || ''}`}
                  onClick={() => setSearchParams({ category: cat })}
                >
                  <img src={CATEGORY_IMAGES[cat] || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=600&q=80'} alt={cat} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-bold text-sm leading-tight hyphens-auto">{getLocalizedCat(cat)}</p>
                    <p className="text-orange-300 text-xs mt-0.5">{productsList.filter((p: any) => p.category === cat).length} items</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
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
      
    </motion.div>
  );
}

