import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import productsData from '../data/simba_products.json';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';
import { Product } from '../store/useCartStore';
import { getLocalizedProductName, getLocalizedProductCategory } from '../lib/localize';

const productsList = Array.isArray(productsData) ? productsData : ((productsData as any).products || []);

const CATEGORIES = ["All", ...Array.from(new Set(productsList.map((p: any) => p.category))).filter(Boolean)] as string[];

const getLocalizedCat = (catName: string) => {
  if (catName === 'All') return catName;
  const p = productsList.find((p: any) => p.category === catName);
  return p ? getLocalizedProductCategory(p) : catName;
}

export default function ShopPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const categoryParam = searchParams.get('category') || 'All';
  const queryParam = searchParams.get('q') || '';

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [sortBy, setSortBy] = useState('featured');

  const filteredProducts = useMemo(() => {
    let filtered = [...productsList] as Product[];
    
    if (activeCategory && activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        const localizedName = getLocalizedProductName(p).toLowerCase();
        return localizedName.includes(q) || p.name?.toLowerCase().includes(q) || ((p as any).description && (p as any).description.toLowerCase().includes(q));
      });
    }
    
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } // featured = default order
    
    return filtered;
  }, [activeCategory, searchQuery, sortBy]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if(cat !== 'All') {
        newParams.set('category', cat);
    } else {
        newParams.delete('category');
    }
    setSearchParams(newParams);
  }

  return (
    <div className="container mx-auto px-4 py-8 text-foreground">
      {/* Header and Mobile Filters */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('shop')}</h1>
          <p className="text-muted-foreground">{filteredProducts.length} {t('productsFoundText')}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 shrink-0 space-y-8">
          
          <div className="bg-white dark:bg-card border dark:border-border p-5 rounded-2xl shadow-sm">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 border-b dark:border-border pb-2">
              <Filter className="w-5 h-5 text-primary" />
              {t('categories')}
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button 
                    onClick={() => handleCategoryChange(cat)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCategory === cat 
                        ? 'bg-primary/10 text-primary font-bold' 
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {cat === 'All' ? t('allCategories') : getLocalizedCat(cat)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-white dark:bg-card border dark:border-border p-5 rounded-2xl shadow-sm">
             <h3 className="font-bold text-lg mb-4 border-b dark:border-border pb-2">{t('sortBy')}</h3>
             <select 
               className="w-full bg-muted border dark:border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
             >
               <option value="featured">{t('featured')}</option>
               <option value="price-low">{t('priceLowHigh')}</option>
               <option value="price-high">{t('priceHighLow')}</option>
             </select>
          </div>

        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-12 text-center shadow-sm">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                <Filter className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold mb-2">{t('noProductsFound')}</h2>
              <p className="text-muted-foreground">{t('tryAdjustingFilters')}</p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  handleCategoryChange('All');
                }}
                className="mt-6 border dark:border-border px-6 py-2 rounded-lg font-semibold hover:bg-muted transition"
              >
                {t('clearFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
