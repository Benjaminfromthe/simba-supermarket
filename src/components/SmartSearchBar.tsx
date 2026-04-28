'use client';
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Search, Sparkles, Loader2, X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore, Product } from '../store/useCartStore';
import toast from 'react-hot-toast';
import { groqConversationalSearch, type GroqResult } from '../lib/groq';

export default function SmartSearchBar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<GroqResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const runSearch = (val: string) => {
    setLoading(true);
    setOpen(true);
    groqConversationalSearch(val, i18n.language).then(res => {
      setResult(res);
      setLoading(false);
    });
  };

  const handleInput = (val: string) => {
    setQuery(val);
    if (!val.trim()) { setResult(null); setOpen(false); return; }
    setOpen(true);
    clearTimeout(debounceRef.current);
    // Auto-trigger after 600ms of no typing
    debounceRef.current = setTimeout(() => runSearch(val), 600);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    clearTimeout(debounceRef.current);
    // Conversational answer already showing — keep it open
    if (result && result.products.length === 0 && result.message) {
      setOpen(true);
      return;
    }
    // Products found — navigate to shop for full results
    if (result && result.products.length > 0) {
      navigate(`/shop?q=${encodeURIComponent(query)}`);
      setOpen(false);
      return;
    }
    // No result yet — run search now
    runSearch(query);
  };

  const handleAdd = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.name} ${t('addedToCartToast')}`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#1A1A1A', color: '#fff' },
    });
  };

  const suggestions = [
    { key: 'suggestionMilk',      fallback: 'I want milk under 1000' },
    { key: 'suggestionOil',       fallback: 'Cooking oil' },
    { key: 'suggestionBaby',      fallback: 'Baby products' },
    { key: 'suggestionBreakfast', fallback: 'Something for breakfast' },
  ];

  return (
    <div ref={ref} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex rounded-full border border-gray-200 dark:border-[#334155] overflow-hidden shadow-sm bg-white dark:bg-[#1E293B]">
        <div className="flex items-center pl-4 text-gray-400">
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#F47A3E]" /> : <Search className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder={t('search')}
          className="flex-1 px-3 py-2.5 text-sm font-medium outline-none bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setResult(null); setOpen(false); }} className="px-2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
        <button type="submit" className="bg-[#F47A3E] hover:bg-[#D46A2E] text-white px-5 flex items-center gap-1.5 text-sm font-bold transition-colors">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('aiSearch')}</span>
        </button>
      </form>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">

          {/* Loading state */}
          {loading && (
            <div className="px-4 py-6 flex items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-[#F47A3E]" />
              <span className="text-sm font-medium">{t('searchingWithAI')}</span>
            </div>
          )}

          {/* Conversational AI answer */}
          {!loading && result && result.products.length === 0 && result.message && (
            <div className="px-4 py-4">
              <div className="flex items-start gap-2 mb-3">
                <div className="w-7 h-7 rounded-full bg-[#F47A3E] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-[#F47A3E] mb-1">{t('simbaAIAssistant', 'Simba AI')}</p>
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{result.message}</p>
                </div>
              </div>
              <button onClick={() => { navigate('/shop'); setOpen(false); }} className="text-xs text-[#F47A3E] font-bold hover:underline">
                {t('browseAllProducts')} →
              </button>
            </div>
          )}

          {/* No products found */}
          {!loading && result && result.products.length === 0 && !result.message && (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">{t('noProductsFound')}</p>
              <button onClick={() => { navigate('/shop'); setOpen(false); }} className="text-[#F47A3E] text-sm font-bold hover:underline">
                {t('browseAllProducts')} →
              </button>
            </div>
          )}

          {/* Product results */}
          {!loading && result && result.products.length > 0 && (
            <>
              {result.message && (
                <div className="px-4 py-3 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/30 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#F47A3E] shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.message}</p>
                </div>
              )}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                {result.products.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <img src={p.image} alt={p.name} className="w-12 h-12 object-contain rounded-xl bg-gray-50 dark:bg-gray-700 shrink-0 p-1"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48'; }} />
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { navigate(`/product/${p.id}`); setOpen(false); }}>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{p.category}</p>
                      <p className="text-sm font-bold text-[#F47A3E] mt-0.5">{p.price.toLocaleString()} RWF</p>
                    </div>
                    <button onClick={() => handleAdd(p)} className="shrink-0 bg-[#F47A3E] hover:bg-[#D46A2E] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      <span className="hidden sm:inline">{t('add')}</span>
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => { navigate(`/shop?q=${encodeURIComponent(query)}`); setOpen(false); }}
                className="w-full py-3 text-center text-sm text-[#F47A3E] font-bold hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors border-t border-gray-50 dark:border-gray-800">
                {t('seeAllResults', { query })} →
              </button>
            </>
          )}

          {/* Suggestions when no query result yet */}
          {!loading && !result && (
            <div className="p-3">
              <p className="text-xs text-gray-400 font-medium px-2 mb-2">{t('tryAsking')}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button key={s.key} onClick={() => handleInput(t(s.key, s.fallback))}
                    className="text-xs bg-orange-50 dark:bg-orange-950/20 text-[#F47A3E] px-3 py-1.5 rounded-full font-medium hover:bg-orange-100 transition-colors">
                    {t(s.key, s.fallback)}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
