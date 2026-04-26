cat /home/claude/simba-google-ai/src/pages/ShopPage.tsx
Output

import { useState, useMemo, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import productsData from '../data/simba_products.json';
import ProductCard, { ProductCardSkeleton } from '../components/ProductCard';
import { SlidersHorizontal, X, Sparkles, Loader2 } from 'lucide-react';
import { Product } from '../store/useCartStore';
import { getLocalizedProductName, getLocalizedProductCategory, getLocalizedCategoryName } from '../lib/localize';

const productsList = Array.isArray(productsData) ? productsData : ((productsData as any).products || []);
const CATEGORIES = ["All", ...Array.from(new Set(productsList.map((p: any) => p.category))).filter(Boolean)] as string[];
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

// Smart keyword extractor — strips filler words and extracts meaningful terms
function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    'i','need','want','looking','for','do','you','have','any','some','a','an','the',
    'please','can','could','show','me','find','get','buy','something','items','products',
    'good','best','nice','cheap','affordable','fresh','new','what','is','are','give',
  ]);
  return query.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 1 && !stopWords.has(w));
}

// Category keyword map for intent detection
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food Products': ['food','breakfast','cereal','bread','rice','flour','sugar','salt','sauce','jam','honey','tea','coffee','milk','dairy','juice','snack','biscuit','cookie','cake','pasta','noodle','soup','oil','vinegar','spice','condiment','spread'],
  'Beverages': ['drink','water','soda','juice','beer','wine','whiskey','vodka','gin','rum','spirit','alcohol','beverage','cola','fanta','sprite','energy'],
  'Alcoholic Drinks': ['beer','wine','whiskey','vodka','gin','rum','spirit','alcohol','champagne','brandy','liquor'],
  'Cosmetics & Personal Care': ['soap','shampoo','lotion','cream','moisturizer','deodorant','perfume','makeup','lipstick','beauty','skin','hair','body','face','toothpaste','toothbrush','razor','cotton','sanitary','feminine'],
  'Cleaning & Sanitary': ['clean','detergent','bleach','disinfectant','mop','broom','toilet','bathroom','washing','laundry','dishwash','scrub','sponge','trash','garbage','bag'],
  'Baby Products': ['baby','infant','diaper','nappy','formula','milk','wipe','powder','toy','pacifier','bottle','feeding'],
  'Kitchenware & Electronics': ['pot','pan','plate','cup','glass','bowl','knife','fork','spoon','blender','kettle','cookware','kitchen','appliance','electronic'],
  'Kitchen Storage': ['container','box','bag','wrap','foil','jar','bottle','storage','ziplock','tupperware'],
  'Sports & Wellness': ['sport','fitness','gym','supplement','vitamin','protein','health','medicine','first aid','bandage','exercise'],
  'Pet Care': ['pet','dog','cat','fish','bird','animal','feed','collar','leash'],
  'General': ['general','other','misc'],
};

function smartLocalSearch(query: string): Product[] {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return productsList.slice(0, 20) as Product[];

  // Detect category from keywords
  let detectedCategory: string | null = null;
  for (const [cat, catKeywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(k => catKeywords.some(ck => ck.includes(k) || k.includes(ck)))) {
      detectedCategory = cat;
      break;
    }
  }

  const scored = (productsList as Product[]).map(p => {
    const name = p.name.toLowerCase();
    const cat = (p.category || '').toLowerCase();
    let score = 0;

    // Category match bonus
    if (detectedCategory && p.category === detectedCategory) score += 10;

    // Keyword matches
    for (const kw of keywords) {
      if (name.includes(kw)) score += 5;
      if (cat.includes(kw)) score += 3;
      // Partial match
      if (name.split(' ').some((w: string) => w.startsWith(kw) || kw.startsWith(w))) score += 2;
    }

    return { product: p, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 24)
    .map(s => s.product);
}

async function groqSearch(query: string): Promise<Product[]> {
  if (!GROQ_API_KEY) return smartLocalSearch(query);

  try {
    const catalog = (productsList as Product[]).slice(0, 200)
      .map(p => `${p.id}|${p.name}|${p.category}|${p.price}RWF`)
      .join('\n');

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
            content: `You are a shopping assistant for Simba Supermarket in Kigali, Rwanda.
Find products from the catalog that match the user's request. Understand natural language like "breakfast items", "something to drink", "baby care", "cooking ingredients", etc.
Return ONLY valid JSON: { "productIds": [id1, id2, ...] }
Max 24 product IDs. Only use IDs that exist in the catalog.

CATALOG (id|name|category|price):
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
      const ids: any[] = parsed.productIds || [];
      const found = ids
        .map((id: any) => (productsList as Product[]).find(p => String(p.id) === String(id)))
        .filter(Boolean) as Product[];
      if (found.length > 0) return found;
    }
  } catch (err) {
    console.error('Groq search error:', err);
  }

  return smartLocalSearch(query);
}

export default function ShopPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || 'All';
  const queryParam = searchParams.get('q') || '';

  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('featured');
  const [aiProducts, setAiProducts] = useState<Product[] | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const lastQuery = useRef('');

  // When query param changes, run AI/smart search
  useEffect(() => {
    if (!queryParam || queryParam === lastQuery.current) return;
    lastQuery.current = queryParam;

    setAiLoading(true);
    setAiProducts(null);
    setAiMessage('');

    groqSearch(queryParam).then(results => {
      setAiProducts(results);
      setAiMessage(
        results.length > 0
          ? `✨ ${results.length} ${t('productsFoundText', 'products found')} — "${queryParam}"`
          : t('noProductsFound', 'No products found')
      );
      setAiLoading(false);
    });
  }, [queryParam, t]);

  // Regular filter for category browsing (no query)
  const regularProducts = useMemo(() => {
    let filtered = [...productsList] as Product[];
    if (activeCategory && activeCategory !== 'All') {
      filtered = filtered.filter(p => p.category === activeCategory);
    }
    if (sortBy === 'price-low') filtered.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') filtered.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [activeCategory, sortBy]);

  const displayProducts = queryParam ? (aiProducts || []) : regularProducts;
  const isAIMode = !!queryParam;

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const newParams = new URLSearchParams();
    if (cat !== 'All') newParams.set('category', cat);
    setSearchParams(newParams);
    setAiProducts(null);
  };

  const clearSearch = () => {
    setSearchParams({});
    setAiProducts(null);
    setAiMessage('');
    lastQuery.current = '';
  };

  return (
    <div className="container mx-auto px-4 py-6 text-foreground">

      {/* Page header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{t('shop')}</h1>
          {aiLoading ? (
            <p className="text-sm text-[#F47A3E] flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> {t('searchingWithAI', 'Searching with AI...')}
            </p>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isAIMode && aiMessage ? aiMessage : `${displayProducts.length} ${t('productsFoundText', 'products found')}`}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isAIMode && (
            <>
              <SlidersHorizontal className="w-4 h-4 text-gray-500 dark:text-gray-300" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-sm font-bold border border-gray-200 dark:border-[#334155] rounded-xl px-3 py-2 bg-white dark:bg-[#1E293B] text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F47A3E]"
              >
                <option value="featured">{t('featured')}</option>
                <option value="price-low">{t('priceLowHigh')}</option>
                <option value="price-high">{t('priceHighLow')}</option>
                <option value="name">{t('nameAZ', 'Name: A-Z')}</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* AI search banner */}
      {isAIMode && (
        <div className="mb-4 flex items-center gap-3 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-3">
          <Sparkles className="w-4 h-4 text-[#F47A3E] shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300 flex-1">
            <span className="font-bold text-[#F47A3E]">{t('aiSearch')}: </span>
            "{queryParam}"
          </p>
          <button
            onClick={clearSearch}
            className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" /> {t('clearFilters')}
          </button>
        </div>
      )}

      {/* Category pills — hide during AI search */}
      {!isAIMode && (
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
            <button
              onClick={() => handleCategoryChange('All')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <X className="w-3 h-3" /> {t('clearFilters')}
            </button>
          )}
        </div>
      )}

      {/* Product grid */}
      {aiLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-16 text-center shadow-sm">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-xl font-bold mb-2 dark:text-white">{t('noProductsFound')}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{t('tryAdjustingFilters')}</p>
          <button
            onClick={clearSearch}
            className="bg-[#F47A3E] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#D46A2E] transition"
          >
            {t('clearFilters')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayProducts.map(product => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      )}
    </div>
  );
}
Done
File 2: src/components/Layout.tsx — just add 2 lines:


Show Layout content
Show Layout content
Good. Now open VS Code in your project folder and do the following:

Step 1 — Open src/pages/ShopPage.tsx, press Ctrl+A to select all, delete, then paste the entire content shown above.

Step 2 — Open src/components/Layout.tsx, it should already have ConversationalSearch — if not, add these 2 lines:

Top: import ConversationalSearch from './ConversationalSearch';
Before </div>: <ConversationalSearch />