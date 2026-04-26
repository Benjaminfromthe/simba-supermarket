import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import productsData from '../data/simba_products.json';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { ChevronRight, Search as SearchIcon, X, Filter, Clock } from 'lucide-react';
import { getLocalizedProductCategory, getLocalizedProductName, getLocalizedCategoryName } from '../lib/localize';
import { Product } from '../store/useCartStore';

const productsList = Array.isArray(productsData) ? productsData : ((productsData as any).products || []);
const CATEGORIES = Array.from(new Set(productsList.map((p: any) => p.category))).filter(Boolean).slice(0, 10) as string[];

// Category images — real product photos from Simba's own Cloudinary catalog
// Transformed to 120x120 crop for fast loading on small circles
const CATEGORY_IMAGES: Record<string, string> = {
  'Cosmetics & Personal Care': 'https://res.cloudinary.com/eskalate/image/upload/c_fill,w_120,h_120,q_75/simba_contest/product_13001.jpg',
  'Sports & Wellness':         'https://res.cloudinary.com/eskalate/image/upload/c_fill,w_120,h_120,q_75/simba_contest/product_15001.jpg',
  'Baby Products':             'https://res.cloudinary.com/eskalate/image/upload/c_fill,w_120,h_120,q_75/simba_contest/product_16001.jpg',
  'Kitchenware & Electronics': 'https://res.cloudinary.com/eskalate/image/upload/c_fill,w_120,h_120,q_75/simba_contest/product_19001.jpg',
  'Food Products':             'https://res.cloudinary.com/eskalate/image/upload/c_fill,w_120,h_120,q_75/simba_contest/product_22001.jpg',
  'Alcoholic Drinks':          'https://res.cloudinary.com/eskalate/image/upload/c_fill,w_120,h_120,q_75/simba_contest/product_27001.jpg',
  'General':                   'https://res.cloudinary.com/eskalate/image/upload/c_fill,w_120,h_120,q_75/simba_contest/product_71001.jpg',
  'Cleaning & Sanitary':       'https://res.cloudinary.com/eskalate/image/upload/c_fill,w_120,h_120,q_75/simba_contest/product_103001.jpg',
  'Kitchen Storage':           'https://res.cloudinary.com/eskalate/image/upload/c_fill,w_120,h_120,q_75/simba_contest/product_168001.jpg',
  'Pet Care':                  'https://res.cloudinary.com/eskalate/image/upload/c_fill,w_120,h_120,q_75/simba_contest/product_471001.jpg',
};

// Curated showcase IDs — recognizable everyday products across categories
// River Dog Shampoo, Nestle Baby Milk, Clamic Bread, Salt Bread, Olive Oil, Floor Cloth, Shampoo 5L, Sweet Bread
const FEATURED_IDS = [29001, 58001, 61005, 61010, 65001, 103001, 29002, 61012];
const FEATURED_PRODUCTS = FEATURED_IDS
  .map(id => productsList.find((p: any) => p.id === id))
  .filter(Boolean) as Product[];
const DEALS_PRODUCTS = FEATURED_PRODUCTS.length >= 4
  ? FEATURED_PRODUCTS
  : productsList.filter((p: any) =>
      ['Food Products', 'Cleaning & Sanitary', 'Baby Products', 'Cosmetics & Personal Care'].includes(p.category)
    ).slice(0, 8) as Product[];

const getLocalizedCat = (catName: string) => getLocalizedCategoryName(catName);

export default function HomePage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category');
  const queryParam = searchParams.get('q');
  const isFiltered = !!(categoryParam || queryParam);

  const filteredProducts = useMemo(() => {
    let filtered = [...productsList] as Product[];
    if (categoryParam) filtered = filtered.filter(p => p.category === categoryParam);
    if (queryParam) {
      const q = queryParam.toLowerCase();
      filtered = filtered.filter(p =>
        getLocalizedProductName(p).toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        getLocalizedProductCategory(p).toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    return isFiltered ? filtered : DEALS_PRODUCTS;
  }, [categoryParam, queryParam, isFiltered]);

  const clearFilters = () => setSearchParams({});

  // Brief skeleton on first mount so the grid doesn't pop in abruptly
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col pb-12 text-foreground min-h-screen"
    >
      {!isFiltered && (
        <>
          {/* ── COMPACT HERO (40% shorter than before) ── */}
          <section className="max-w-[1200px] mx-auto w-full px-4 mt-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative rounded-2xl overflow-hidden h-[280px] md:h-[420px] flex items-center"
            >
              <img
                src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=2000"
                alt="Simba Supermarket"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
              <div className="relative z-10 p-4 md:p-8 max-w-xl">
                {/* Identity line — translated */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#F47A3E] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                    🇷🇼 {t('rwandaNo1', "Rwanda's #1 Supermarket")}
                  </span>
                </div>
                <h1 className="text-xl md:text-4xl font-black text-white leading-tight mb-2" style={{ fontFamily: 'Playfair Display, serif' }}>
                  {t('qualityFirst')}. <span className="text-[#FF8A00]">{t('deliveredFast')}.</span>
                </h1>
                <p className="text-gray-300 text-xs md:text-sm mb-3 max-w-sm block">{t('heroDescription')}</p>
                {/* Value prop badges — flex-wrap so they never overflow */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {[
                    { icon: '⚡', label: t('fastPickup') },
                    { icon: '📱', label: t('momoPayment') },
                    { icon: '🛒', label: `789+ ${t('productsCount2', 'Produits')}` },
                    { icon: '📍', label: `9 ${t('branchesCount')}` },
                  ].map(v => (
                    <span key={v.label} className="flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-full px-2.5 py-1 text-white text-[11px] font-semibold whitespace-nowrap">
                      {v.icon} {v.label}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const el = document.getElementById('deals');
                    if (!el) return;
                    const header = document.querySelector('header');
                    const headerH = header ? header.getBoundingClientRect().height : 0;
                    const top = el.getBoundingClientRect().top + window.scrollY - headerH - 16;
                    window.scrollTo({ top, behavior: 'smooth' });
                  }}
                  className="bg-[#F47A3E] hover:bg-[#D46A2E] text-white px-5 py-2 rounded-full font-bold text-sm uppercase tracking-wide transition-all hover:scale-105 active:scale-95"
                >
                  {t('startShopping')} →
                </button>
              </div>
            </motion.div>
          </section>

          {/* ── CATEGORY RIBBON (directly under hero, no gap) ── */}
          <section className="max-w-[1200px] mx-auto w-full px-4 mt-3">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-black text-gray-700 dark:text-white uppercase tracking-widest">{t('shopByCategory', 'Shop by Category')}</h2>
              <Link to="/shop" className="text-[#F47A3E] text-xs font-semibold hover:underline">{t('viewAll')} →</Link>
            </div>
            {/* Scrollable circles — navigate to ShopPage with category filter */}
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <motion.div
                  key={cat}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center gap-1.5 shrink-0 group cursor-pointer"
                >
                  <Link to={`/shop?category=${encodeURIComponent(cat)}`} className="flex flex-col items-center gap-1.5">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 dark:border-gray-700 group-hover:border-[#F47A3E] transition-all shadow-sm">
                      <img
                        src={CATEGORY_IMAGES[cat] || CATEGORY_IMAGES['General']}
                        alt={cat}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-700 dark:text-white text-center leading-tight max-w-[56px] hyphens-auto">
                      {getLocalizedCat(cat)}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── DEALS OF THE DAY (above the fold) ── */}
      <section id="deals" className="max-w-[1200px] mx-auto w-full px-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase border-l-4 border-[#F47A3E] pl-3 flex items-center gap-3">
            {isFiltered ? (
              <span className="flex items-center gap-2">
                <SearchIcon className="w-5 h-5 text-[#F47A3E]" />
                {queryParam ? `${t('resultsFor')}: "${queryParam}"` : getLocalizedCat(categoryParam || '')}
              </span>
            ) : t('dealsOfDay')}
          </h2>
          {isFiltered ? (
            <button onClick={clearFilters} className="flex items-center gap-1 text-sm font-bold text-red-500 hover:text-red-600">
              <X className="w-4 h-4" /> {t('clearFilters')}
            </button>
          ) : (
            <Link to="/shop" className="text-[#F47A3E] font-bold hover:underline text-sm flex items-center gap-1">
              {t('viewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {!ready ? (
          // Skeleton grid while page mounts
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : isFiltered && filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-2xl p-16 text-center shadow-sm">
            <Filter className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{t('noProductsFound')}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t('tryAdjustingFilters')}</p>
            <button onClick={clearFilters} className="bg-[#F47A3E] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#D46A2E] transition">
              {t('clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p as any} compact />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
