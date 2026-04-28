import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Sparkles, Loader2, Search } from 'lucide-react';

// Data & Types
import productsData from '../data/simba_products.json';
import { Product } from '../store/useCartStore';
import { getLocalizedCategoryName } from '../lib/localize';
import { groqIdSearch, localSearch } from '../lib/groq';

// Components
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import PageTransition from '../components/PageTransition';
import { ShoppingBag } from 'lucide-react';

// --- Constants & Config ---
const productsList = (Array.isArray(productsData) ? productsData : ((productsData as any).products || [])) as Product[];
const CATEGORIES = ["All", ...Array.from(new Set(productsList.map(p => p.category))).filter(Boolean)];

// --- Main Component ---
export default function ShopPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryParam = searchParams.get('category') || 'All';
  const queryParam = searchParams.get('q') || '';
  
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('featured');
  const [aiProducts, setAiProducts] = useState<Product[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const lastQuery = useRef('');

  // Handle Search Execution — skip product search for conversational queries
  useEffect(() => {
    if (!queryParam || queryParam === lastQuery.current) return;
    lastQuery.current = queryParam;

    // Don't search products for conversational questions
    const conversationalWords = ['how','who','what','when','where','why','are you','is simba','tell me','do you','can you','hello','hi','hey','thanks','thank'];
    const isConversational = conversationalWords.some(w => queryParam.toLowerCase().includes(w));
    if (isConversational) {
      setAiProducts([]);
      setAiLoading(false);
      return;
    }

    setAiLoading(true);
    groqIdSearch(queryParam, 24).then(results => {
      setAiProducts(results);
      setAiLoading(false);
    });
  }, [queryParam]);

  // Sync Category with URL
  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  const filteredProducts = useMemo(() => {
    let list = queryParam ? (aiProducts || []) : [...productsList];
    
    if (!queryParam && activeCategory !== 'All') {
      list = list.filter(p => p.category === activeCategory);
    }

    if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    
    return list;
  }, [activeCategory, sortBy, aiProducts, queryParam]);

  const clearFilters = () => {
    setSearchParams({});
    setAiProducts(null);
    lastQuery.current = '';
  };

  return (
    <PageTransition
      title={t('shop')}
      subtitle={aiLoading ? '...' : `${filteredProducts.length} ${t('productsFoundText', 'products found')}`}
      icon={<ShoppingBag className="w-5 h-5" />}
    >
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Sort row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          {aiLoading && (
            <p className="text-sm text-orange-500 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> {t('searching')}
            </p>
          )}
        </div>

        {!queryParam && (
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <div className="pl-3 text-gray-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <select 
              value={sortBy} 
              onChange={e => setSortBy(e.target.value)}
              className="bg-transparent text-sm font-bold pr-8 py-2 focus:outline-none dark:text-white cursor-pointer"
            >
              <option value="featured">{t('featured')}</option>
              <option value="price-low">{t('priceLowHigh')}</option>
              <option value="price-high">{t('priceHighLow')}</option>
              <option value="name">{t('nameAZ', 'Name: A-Z')}</option>
            </select>
          </div>
        )}
      </div>

      {/* AI Search Notification */}
      {queryParam && !aiLoading && (
        <div className="mb-8 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white dark:from-slate-900 dark:to-slate-950 border border-orange-100 dark:border-slate-800 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg text-white shadow-lg shadow-orange-200 dark:shadow-none">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-widest">{t('aiSearch')}</p>
              <p className="text-gray-900 dark:text-white font-medium italic">"{queryParam}"</p>
            </div>
          </div>
          <button onClick={clearFilters} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}

      {/* Category Navigation */}
      {!queryParam && (
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSearchParams(cat === 'All' ? {} : { category: cat })}
              className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200 ${
                activeCategory === cat 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-black shadow-lg scale-105' 
                  : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-300 dark:bg-slate-900 dark:text-gray-400 dark:border-slate-800'
              }`}
            >
              {cat === 'All' ? t('allCategories') : getLocalizedCategoryName(cat)}
            </button>
          ))}
        </div>
      )}

      {/* Grid Display */}
      {aiLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-slate-900/50 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-full shadow-xl mb-6">
            <Search className="w-12 h-12 text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('noProductsFound')}</h3>
          <p className="text-gray-500 mb-6 text-center max-w-xs">{t('tryAdjustingFilters')}</p>
          <button onClick={clearFilters} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-lg shadow-orange-200 dark:shadow-none">
            {t('clearFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(p => <ProductCard key={p.id} product={p as any} compact />)}
        </div>
      )}
    </div>
    </PageTransition>
  );
}