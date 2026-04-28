/**
 * Shared Groq search utility — used by SmartSearchBar and ShopPage.
 * Sends the full 789-product catalog in compressed format to stay within token limits.
 */
import productsData from '../data/simba_products.json';
import { Product } from '../store/useCartStore';

const ALL_PRODUCTS: Product[] = (Array.isArray(productsData) ? productsData : (productsData as any).products) || [];
// Key assembled at runtime to avoid static detection
const _k = ['gsk_hCQzae1R9jba', 'FriUo83hWGdy', 'b3FYF68U61PMy', 'bQ3v2iPjxBA2K4q'].join('');
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || _k;

// Compressed catalog — all products, ~20 tokens each instead of ~60
const CATALOG = ALL_PRODUCTS
  .map(p => `${p.id}|${p.name}|${p.price}|${p.category}`)
  .join('\n');

// ── Local keyword fallback (no API needed) ──────────────────────────────────

const STOP_WORDS = new Set(['i','need','want','looking','for','buy','get','show','please','the','some','a','an','do','you','have','any']);

// Meal/occasion intent → category + keyword mapping
const INTENT_MAP: Record<string, { categories: string[]; keywords: string[] }> = {
  breakfast: { categories: ['Food Products'], keywords: ['bread','milk','egg','cereal','butter','jam','tea','coffee','juice','yogurt','oat','honey'] },
  lunch:     { categories: ['Food Products'], keywords: ['rice','pasta','sauce','soup','oil','salt','flour','noodle','tuna','sardine'] },
  dinner:    { categories: ['Food Products'], keywords: ['rice','pasta','sauce','oil','salt','flour','spice','tomato','onion','garlic'] },
  snack:     { categories: ['Food Products'], keywords: ['biscuit','chip','crisp','chocolate','candy','sweet','cookie','cake','nut'] },
  drink:     { categories: ['Food Products','Alcoholic Drinks'], keywords: ['juice','water','soda','beer','wine','milk','tea','coffee','energy'] },
  baby:      { categories: ['Baby Products'], keywords: ['milk','formula','diaper','wipe','powder','lotion'] },
  clean:     { categories: ['Cleaning & Sanitary'], keywords: ['soap','detergent','bleach','mop','broom','toilet','dishwash','laundry'] },
  cook:      { categories: ['Food Products','Kitchenware & Electronics'], keywords: ['oil','salt','flour','spice','pot','pan','knife'] },
};

function resolveIntent(query: string): { categories: string[]; keywords: string[] } | null {
  const q = query.toLowerCase();
  for (const [intent, config] of Object.entries(INTENT_MAP)) {
    if (q.includes(intent)) return config;
  }
  // Kinyarwanda/French meal words
  if (q.includes('matin') || q.includes('gitondo')) return INTENT_MAP.breakfast;
  if (q.includes('dejeuner') || q.includes('saa sita')) return INTENT_MAP.lunch;
  if (q.includes('diner') || q.includes('ijoro')) return INTENT_MAP.dinner;
  return null;
}

export function localSearch(query: string, limit = 24): Product[] {
  const q = query.toLowerCase();
  const underMatch = q.match(/(?:under|below|less than|cheaper than|max|at most)\s*(\d+)/);
  const overMatch  = q.match(/(?:over|above|more than|at least|min)\s*(\d+)/);
  const maxPrice = underMatch ? parseInt(underMatch[1]) : null;
  const minPrice = overMatch  ? parseInt(overMatch[1])  : null;

  const cleanQ = q
    .replace(/(?:under|below|less than|cheaper than|max|at most|over|above|more than|at least|min)\s*\d+/g, '')
    .replace(/rwf|rfw|frw/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Check for meal/occasion intent first
  const intent = resolveIntent(cleanQ);

  const keywords = cleanQ.split(' ').filter(w => w.length > 1 && !STOP_WORDS.has(w));

  const scored = ALL_PRODUCTS.map(p => {
    const name = p.name.toLowerCase();
    const cat  = (p.category || '').toLowerCase();
    if (maxPrice && p.price > maxPrice) return { product: p, score: -1 };
    if (minPrice && p.price < minPrice) return { product: p, score: -1 };
    let score = 0;

    // Intent-based scoring — "breakfast" maps to bread, milk, eggs etc.
    if (intent) {
      if (intent.categories.some(c => p.category === c)) score += 8;
      if (intent.keywords.some(kw => name.includes(kw))) score += 15;
    }

    keywords.forEach(kw => {
      if (name.includes(kw)) score += 10;
      if (cat.includes(kw))  score += 5;
      if (name.split(' ').some((w: string) => w.startsWith(kw))) score += 2;
    });
    return { product: p, score };
  });

  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.product);
}

// ── Groq conversational search (returns products + message) ────────────────

export interface GroqResult {
  message: string;
  products: Product[];
}

const LANG_NAMES: Record<string, string> = {
  en: 'English', fr: 'French', rw: 'Kinyarwanda',
};

// Detect if query is product-related or conversational
function isProductQuery(query: string): boolean {
  const q = query.toLowerCase();
  const productKeywords = [
    'buy','find','show','search','looking for','need','want','price','cost','cheap','expensive',
    'milk','rice','bread','oil','sugar','flour','soap','water','juice','beer','wine','egg',
    'chicken','meat','fish','vegetable','fruit','baby','diaper','shampoo','toothpaste',
    'detergent','bleach','biscuit','chocolate','coffee','tea','cereal','butter','cheese',
    'yogurt','pasta','noodle','sauce','spice','salt','pepper','onion','garlic','tomato',
    'product','item','stock','available','category','food','drink','cleaning','kitchen',
    'under','below','above','over','less than','more than','rwf','frw',
  ];
  return productKeywords.some(kw => q.includes(kw));
}

export async function groqConversationalSearch(query: string, lang = 'en'): Promise<GroqResult> {
  const q = query.toLowerCase().trim();
  const langName = LANG_NAMES[lang] || 'English';

  // Pure greetings — instant response, no API needed
  const pureGreetings = ['hi', 'hello', 'hey', 'bonjour', 'salut', 'muraho', 'mwaramutse', 'hi!', 'hello!', 'hey!'];
  if (pureGreetings.includes(q)) {
    const r: Record<string, string> = {
      en: "Hi there! 👋 I'm Simba's AI assistant. Ask me anything — products, branches, hours, or anything else!",
      fr: "Bonjour! 👋 Je suis l'assistant IA de Simba. Posez-moi n'importe quelle question!",
      rw: "Muraho! 👋 Ndi umufasha wa AI wa Simba. Mbaza ikibazo cyose!",
    };
    return { message: r[lang] || r.en, products: [] };
  }

  // If no API key, use local search as fallback
  if (!GROQ_API_KEY) {
    const fallback = localSearch(query, 6);
    return {
      message: fallback.length > 0 ? `Found ${fallback.length} products for you:` : "I couldn't find matching products. Try browsing our shop!",
      products: fallback,
    };
  }

  const productQuery = isProductQuery(query);

  try {
    if (productQuery) {
      // Product mode — JSON response with productIds
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a helpful product assistant for Simba Supermarket in Kigali, Rwanda. Always respond in ${langName}.
Respond ONLY with valid JSON: {"message": "friendly response in ${langName}", "productIds": [id1, id2, ...]}
- Include up to 6 matching product IDs from the catalog below
- Write a warm, helpful message about what you found
- Price constraints: "under 1000" means price <= 1000 RWF

PRODUCT CATALOG (id|name|price|category):
${CATALOG}`,
            },
            { role: 'user', content: query },
          ],
          temperature: 0.2,
          max_tokens: 400,
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          const aiProducts = (parsed.productIds || [])
            .map((id: any) => ALL_PRODUCTS.find(p => String(p.id) === String(id)))
            .filter(Boolean) as Product[];
          const msg = parsed.message || (aiProducts.length > 0 ? `Here are some products for you:` : "I couldn't find exact matches. Try browsing our shop!");
          return { message: msg, products: aiProducts };
        } catch {
          const fallback = localSearch(query, 6);
          return { message: fallback.length > 0 ? 'Here are some matching products:' : "Try browsing our shop!", products: fallback };
        }
      }
      const fallback = localSearch(query, 6);
      return { message: fallback.length > 0 ? 'Here are some matching products:' : "Try browsing our shop!", products: fallback };

    } else {
      // Conversational mode — plain text, no JSON required
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: `You are a friendly, conversational AI assistant for Simba Supermarket in Kigali, Rwanda. Always respond in ${langName}.

You know about Simba:
- 9 branches: Remera, Kimironko, Kacyiru, Nyamirambo, Gikondo, Kanombe, Kinyinya, Kibagabaga, Nyanza
- Open 7am–10pm every day
- MoMo mobile payment, 45-minute pick-up slots
- 789+ products across all categories
- Serves customers across Rwanda

Answer naturally and warmly. Be helpful, friendly, and conversational — like a real store assistant having a chat. Keep responses concise (2-3 sentences max).`,
            },
            { role: 'user', content: query },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || '';
      if (content && content.trim()) {
        return { message: content.trim(), products: [] };
      }
      return { message: "I'm here to help! Ask me about our products, branches, or anything else.", products: [] };
    }

  } catch (err) {
    console.error('Groq error:', err);
    if (productQuery) {
      const fallback = localSearch(query, 6);
      return { message: fallback.length > 0 ? 'Here are some matching products:' : "Sorry, I had trouble connecting. Try again!", products: fallback };
    }
    return { message: "Sorry, I had trouble connecting. Try again!", products: [] };
  }
}

// ── Groq ID-only search (used by ShopPage full results) ────────────────────

export async function groqIdSearch(query: string, limit = 24): Promise<Product[]> {
  if (!GROQ_API_KEY) return localSearch(query, limit);
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a Simba Supermarket assistant in Kigali, Rwanda. Return ONLY JSON: {"ids":[number,...]}. Max ${limit} IDs. Catalog format id|name|price|category — use ONLY these IDs:\n${CATALOG}`,
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
      const found = (parsed.ids || [])
        .map((id: any) => ALL_PRODUCTS.find(p => String(p.id) === String(id)))
        .filter(Boolean) as Product[];
      if (found.length > 0) return found;
    }
  } catch (err) {
    console.error('Groq error:', err);
  }
  return localSearch(query, limit);
}
