'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Loader2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore, Product } from '../store/useCartStore';
import productsData from '../data/simba_products.json';
import toast from 'react-hot-toast';

const productsList: Product[] = (Array.isArray(productsData) ? productsData : (productsData as any).products) || [];
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

interface AIResult { message: string; products: Product[]; }

async function smartSearch(query: string): Promise<AIResult> {
  // First try fast keyword match
  const q = query.toLowerCase();
  const keyword = productsList.filter(p =>
    p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
  ).slice(0, 8);

  // If good keyword results, return immediately (no API call needed)
  if (keyword.length >= 3 && query.length < 20) {
    return { message: '', products: keyword };
  }

  // For conversational queries, use Groq
  if (!GROQ_API_KEY) return { message: '', products: keyword };

  try {
    const catalog = productsList.slice(0, 300).map(p => `${p.id}|${p.name}|${p.category}|${p.price}`).join('\n');
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `You are a shopping assistant for Simba Supermarket Rwanda. Find relevant products from this catalog and return JSON: {"message":"short friendly response","productIds":[id1,id2,...]}. Max 8 products. Catalog:\n${catalog}` },
          { role: 'user', content: query }
        ],
        temperature: 0.2, max_tokens: 300,
      }),
    });
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const match = content.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      const found = (parsed.productIds || []).map((id: number) => productsList.find(p => p.id === id)).filter(Boolean) as Product[];
      return { message: parsed.message || '', products: found.length > 0 ? found : keyword };
    }
  } catch {}
  return { message: '', products: keyword };
}

export default function SmartSearchBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (!val.trim()) { setResults(null); setOpen(false); return; }
    setOpen(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await smartSearch(val);
      setResults(res);
      setLoading(false);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query)}`);
      setOpen(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.name} ${t('addedToCartToast')}`, {
      icon: '🛒', style: { borderRadius: '10px', background: '#333', color: '#fff' },
    });
  };

  return (
    <div ref={ref} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex rounded-full border border-gray-200 dark:border-border overflow-hidden shadow-sm bg-gray-50 dark:bg-card">
        <div className="flex items-center pl-4 text-gray-400">
          {loading ? <Loader2 className="w-4 h-4 animate-spin text-[#F47A3E]" /> : <Search className="w-4 h-4" />}
        </div>
        <input
          type="text"
          value={query}
          onChange={e => handleInput(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder={t('search')}
          className="flex-1 px-3 py-2.5 text-sm font-medium outline-none bg-transparent text-foreground placeholder:text-foreground/50"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setResults(null); setOpen(false); }} className="px-2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        )}
        <button type="submit" className="bg-[#F47A3E] text-white px-5 hover:bg-[#D46A2E] transition-colors flex items-center gap-1.5 text-sm font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI</span>
        </button>
      </form>

      {/* Dropdown results */}
      {open && results && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
          {results.message && (
            <div className="px-4 py-2.5 bg-orange-50 dark:bg-orange-950/30 border-b border-orange-100 dark:border-orange-900 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#F47A3E] shrink-0" />
              <p className="text-xs text-[#F47A3E] font-medium">{results.message}</p>
            </div>
          )}
          {results.products.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-400">{t('noProductsFound')}</div>
          ) : (
            <>
              {results.products.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-50 dark:border-gray-800 last:border-0">
                  <img src={p.image} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { navigate(`/product/${p.id}`); setOpen(false); }}>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white line-clamp-1">{p.name}</p>
                    <p className="text-xs text-[#F47A3E] font-bold">{p.price.toLocaleString()} RWF</p>
                  </div>
                  <button onClick={() => handleAddToCart(p)} className="shrink-0 bg-[#F47A3E] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#D46A2E] transition">
                    + {t('addToCart').split(' ')[0]}
                  </button>
                </div>
              ))}
              <button onClick={() => { navigate(`/shop?q=${encodeURIComponent(query)}`); setOpen(false); }} className="w-full py-3 text-center text-sm text-[#F47A3E] font-bold hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors">
                {t('viewAll')} "{query}" →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
