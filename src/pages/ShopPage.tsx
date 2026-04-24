import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import productsData from '../data/simba_products.json';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';
import { Product } from '../store/useCartStore';
import { getLocalizedProductName, getLocalizedProductCategory, getLocalizedCategoryName } from '../lib/localize';

const productsList = Array.isArray(productsData) ? productsData : ((productsData as any).products || []);
const CATEGORIES = ["All", ...Array.from(new Set(productsList.map((p: any) => p.category))).filter(Boolean)] as string[];

export default function ShopPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || 'All';
  const queryParam = searchParams.get('q') || '';

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchQuery] = useState(queryParam);
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    let filtered = [...productsList] as Product[];
    if (activeCategory && activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        getLocalizedProductName(p).toLowerCase().includes(q) ||
        p.name?.toLowerCase().includes(q) ||
        getLocalizedProductCategory(p).toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [activeCategory, searchQuery, sortBy]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    cat !== 'All' ? newParams.set('category', cat) : newParams.delete('category');
    setSearchParams(newParams);
  };

  return (
    <div className="container mx-auto px-4 py-6 text-foreground">

      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black dark:text-white">{t('shop')}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{filteredProducts.length} {t('productsFoundText')}</p>
        </div>
        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-card dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F47A3E]"
          >
            <option value="featured">{t('featured')}</option>
            <option value="price-low">{t('priceLowHigh')}</option>
            <option value="price-high">{t('priceHighLow')}</option>
            <option value="name">{t('nameAZ', 'Name: A-Z')}</option>
          </select>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-6">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`pill ${activeCategory === cat ? 'active' : ''}`}
          >
            {cat === 'All' ? t('allCategories') : getLocalizedCategoryName(cat)}
          </button>
        ))}
        {activeCategory !== 'All' && (
          <button onClick={() => handleCategoryChange('All')} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
            <X className="w-3 h-3" /> {t('clearFilters')}
          </button>
        )}
      </div>

      {/* Product grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-16 text-center shadow-sm">
          <p className="text-xl font-bold mb-2 dark:text-white">{t('noProductsFound')}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t('tryAdjustingFilters')}</p>
          <button onClick={() => handleCategoryChange('All')} className="bg-[#F47A3E] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#D46A2E] transition">
            {t('clearFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  );
}
