'use client';
import { useState, useRef, useEffect } from 'react';
import { Search, Sparkles, Loader2, X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCartStore, Product } from '../store/useCartStore';
import productsData from '../data/simba_products.json';
import toast from 'react-hot-toast';

const ALL_PRODUCTS: Product[] = (Array.isArray(productsData) ? productsData : (productsData as any).products) || [];
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

interface AIResult {
  message: string;
  products: Product[];
}

// Smart local search with price filter support
function localSearch(query: string): Product[] {
  const q = query.toLowerCase();

  // Extract price constraint e.g. "under 1000", "less than 2000", "below 500"
  const underMatch = q.match(/(?:under|below|less than|cheaper than|max|at most)\s*(\d+)/);
  const overMatch = q.match(/(?:over|above|more than|at least|min)\s*(\d+)/);
  const maxPrice = underMatch ? parseInt(underMatch[1]) : null;
  const minPrice = overMatch ? parseInt(overMatch[1]) : null;

  // Remove price words from query for keyword matching
  const cleanQ = q
    .replace(/(?:under|below|less than|cheaper than|max|at most|over|above|more than|at least|min)\s*\d+/g, '')
    .replace(/rwf|rfw|frw/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  let results = ALL_PRODUCTS.filter(p => {
    const name = p.name.toLowerCase();
    const cat = p.category.toLowerCase();

    // Price filter
    if (maxPrice && p.price > maxPrice) return false;
    if (minPrice && p.price < minPrice) return false;

    // If no keyword left after removing price, return all price-filtered
    if (!cleanQ) return true;

    // Keyword match — split into words for better matching
    const words = cleanQ.split(' ').filter(w => w.length > 2);
    return words.some(w => name.includes(w) || cat.includes(w));
  });

  return results.slice(0, 8);
}

async function askGroqAI(query: string): Promise<AIResult> {
  // Always try local first
  const localResults = localSearch(query);

  // If good local results and query is simple keyword, return immediately
  const isSimple = query.length < 15 && !query.includes(' ');
  if (isSimple && localResults.length > 0) {
    return { message: '', products: localResults };
  }

  // Use Groq for all natural language queries
  if (!GROQ_API_KEY) {
    return {
      message: localResults.length > 0 ? `Found ${localResults.length} products for you:` : "I couldn't find matching products. Try browsing our shop!",
      products: localResults,
    };
  }

  try {
    // Build compact catalog — max 100 products, only essential fields
    const catalogSample = ALL_PRODUCTS.slice(0, 100);
    const catalog = catalogSample.map(p => `${p.id}|${p.name}|${p.price}RWF`).join('\n');

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a smart shopping assistant for Simba Supermarket in Kigali, Rwanda. All prices are in RWF (Rwandan Francs).

Your job: understand what the customer wants (including price constraints like "under 1000 RWF") and find the best matching products from the catalog.

Rules:
- Understand natural language: "I want milk under 1000" = find milk products with price <= 1000 RWF
- "something for breakfast" = find breakfast-related products
- "cheap cooking oil" = find low-priced cooking oil
- Always respond with JSON only: {"message": "friendly 1-sentence response", "productIds": [id1, id2, ...]}
- Max 6 product IDs. Only use IDs from the catalog.
- If nothing matches, return {"message": "friendly apology", "productIds": []}

PRODUCT CATALOG (id|name|category|price):
${catalog}`,
          },
          { role: 'user', content: query },
        ],
        temperature: 0.1,
        max_tokens: 400,
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const aiProducts = (parsed.productIds || [])
        .map((id: number) => ALL_PRODUCTS.find(p => p.id === id || p.id === String(id)))
        .filter(Boolean) as Product[];

      // If AI found products, use them; otherwise fall back to local
      const finalProducts = aiProducts.length > 0 ? aiProducts : localResults;
      return {
        message: parsed.message || (finalProducts.length > 0 ? `Here's what I found for you:` : "No products found."),
        products: finalProducts,
      };
    }
  } catch (err) {
    console.error('Groq error:', err);
  }

  // Fallback to local results
  return {
    message: localResults.length > 0 ? `Found ${localResults.length} products matching your request:` : "I couldn't find that. Try browsing our full shop!",
    products: localResults,
  };
}

export default function SmartSearchBar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<AIResult | null>(null);
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

  const handleInput = (val: string) => {
    setQuery(val);
    if (!val.trim()) { setResult(null); setOpen(false); return; }
    setOpen(true);
    clearTimeout(debounceRef.current);
    // Shorter debounce for better UX
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const res = await askGroqAI(val);
      setResult(res);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/shop?q=${encodeURIComponent(query)}`);
      setOpen(false);
    }
  };

  const handleAdd = (product: Product) => {
    addItem(product, 1);
    toast.success(`${product.name} ${t('addedToCartToast')}`, {
      icon: '🛒',
      style: { borderRadius: '12px', background: '#1A1A1A', color: '#fff', fontFamily: 'Poppins, sans-serif' },
    });
  };

  const suggestions = ['I want milk under 1000', 'Cooking oil', 'Baby products', 'Something for breakfast'];

  return (
    <div ref={ref} className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="flex rounded-full border border-gray-200 dark:border-[#334155] overflow-hidden shadow-sm bg-white dark:bg-[#1E293B]">
        <div className="flex items-center pl-4 text-gray-400">
          {loading
            ? <Loader2 className="w-4 h-4 animate-spin text-[#F47A3E]" />
            : <Search className="w-4 h-4" />
          }
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
          <span className="hidden sm:inline">AI</span>
        </button>
      </form>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-2xl z-50 overflow-hidden">

          {/* AI message */}
          {result?.message && (
            <div className="px-4 py-3 bg-orange-50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/30 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-[#F47A3E] shrink-0 mt-0.5" />
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{result.message}</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="px-4 py-6 flex items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-[#F47A3E]" />
              <span className="text-sm font-medium">Searching with AI...</span>
            </div>
          )}

          {/* Results */}
          {!loading && result && (
            result.products.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-3">{t('noProductsFound')}</p>
                <button onClick={() => { navigate('/shop'); setOpen(false); }}
                  className="text-[#F47A3E] text-sm font-bold hover:underline">
                  Browse all products →
                </button>
              </div>
            ) : (
              <>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-800">
                  {result.products.map(p => (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <img src={p.image} alt={p.name}
                        className="w-12 h-12 object-contain rounded-xl bg-gray-50 dark:bg-gray-700 shrink-0 p-1"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48'; }} />
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { navigate(`/product/${p.id}`); setOpen(false); }}>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{p.category}</p>
                        <p className="text-sm font-bold text-[#F47A3E] mt-0.5">{p.price.toLocaleString()} RWF</p>
                      </div>
                      <button onClick={() => handleAdd(p)}
                        className="shrink-0 bg-[#F47A3E] hover:bg-[#D46A2E] text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        <span className="hidden sm:inline">Add</span>
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => { navigate(`/shop?q=${encodeURIComponent(query)}`); setOpen(false); }}
                  className="w-full py-3 text-center text-sm text-[#F47A3E] font-bold hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors border-t border-gray-50 dark:border-gray-800">
                  See all results for "{query}" →
                </button>
              </>
            )
          )}

          {/* Suggestions when no query yet */}
          {!loading && !result && (
            <div className="p-3">
              <p className="text-xs text-gray-400 font-medium px-2 mb-2">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button key={s} onClick={() => handleInput(s)}
                    className="text-xs bg-orange-50 dark:bg-orange-950/20 text-[#F47A3E] px-3 py-1.5 rounded-full font-medium hover:bg-orange-100 transition-colors">
                    {s}
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
