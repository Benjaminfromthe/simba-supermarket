/**
 * Shared Groq search utility — used by SmartSearchBar and ShopPage.
 * Sends the full 789-product catalog in compressed format to stay within token limits.
 */
import productsData from '../data/simba_products.json';
import { Product } from '../store/useCartStore';

const ALL_PRODUCTS: Product[] = (Array.isArray(productsData) ? productsData : (productsData as any).products) || [];
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

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

export async function groqConversationalSearch(query: string, lang = 'en'): Promise<GroqResult> {
  const q = query.toLowerCase().trim();

  // Handle greetings — respond naturally without showing products
  const greetings = ['hi', 'hello', 'hey', 'bonjour', 'salut', 'muraho', 'mwaramutse', 'good morning', 'good afternoon', 'good evening', 'how are you', 'what can you do', 'help', 'thanks', 'thank you', 'merci', 'urakoze'];
  if (greetings.some(g => q === g || q === g + '!' || q === g + '?')) {
    const greetingResponses: Record<string, string> = {
      en: "Hi there! I'm Simba's AI assistant 🛒 Ask me anything like \"Do you have fresh milk?\" or \"I need something for breakfast\" and I'll find the best products for you!",
      fr: "Bonjour! Je suis l'assistant IA de Simba 🛒 Demandez-moi par exemple \"Avez-vous du lait frais?\" ou \"J'ai besoin de quelque chose pour le petit-déjeuner\"!",
      rw: "Muraho! Ndi umufasha wa AI wa Simba 🛒 Mbaza nk'ati \"Mufite amata mashya?\" cyangwa \"Ndashaka ikintu cyo mu gitondo\"!",
    };
    return { message: greetingResponses[lang] || greetingResponses.en, products: [] };
  }

  const fallback = localSearch(query, 8);
  // Always return fallback if intent found — never show 0
  const intentFallback = fallback.length > 0 ? fallback : localSearch(query.split(' ').slice(-1)[0], 8);
  const isSimple = query.length < 15 && !query.includes(' ');
  if (isSimple && fallback.length > 0) return { message: '', products: fallback };

  if (!GROQ_API_KEY) {
    return {
      message: fallback.length > 0 ? `Found ${fallback.length} products for you:` : "I couldn't find matching products.",
      products: intentFallback,
    };
  }

  const langName = LANG_NAMES[lang] || 'English';

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a smart shopping assistant for Simba Supermarket in Kigali, Rwanda. Prices are in RWF.
IMPORTANT: Respond in ${langName}. Your "message" field must be in ${langName}.
Catalog format per line: id|name|price|category
Rules:
- Understand natural language and price constraints ("milk under 1000" = price <= 1000)
- Respond ONLY with valid JSON: {"message":"friendly 1-sentence response in ${langName}","productIds":[id1,id2,...]}
- Max 6 IDs. Only use IDs from the catalog. If nothing matches: {"message":"apology in ${langName}","productIds":[]}
CATALOG (${ALL_PRODUCTS.length} products):
${CATALOG}`,
          },
          { role: 'user', content: query },
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const aiProducts = (parsed.productIds || [])
        .map((id: any) => ALL_PRODUCTS.find(p => p.id === id || p.id === String(id)))
        .filter(Boolean) as Product[];
      // Always fall back to local results if AI returns nothing
      const final = aiProducts.length > 0 ? aiProducts : intentFallback;
      return { message: parsed.message || '', products: final };
    }
  } catch (err) {
    console.error('Groq error:', err);
  }
  return { message: '', products: intentFallback };
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
