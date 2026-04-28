/**
 * Pre-generates product name translations for rw and fr
 * Run: node translate_products.cjs
 * Output: src/data/product_translations.json
 */
const fs = require('fs');

const GROQ_KEY = process.env.GROQ_KEY || '';
const data = JSON.parse(fs.readFileSync('src/data/simba_products.json', 'utf8'));
const products = Array.isArray(data) ? data : data.products || [];
const names = [...new Set(products.map(p => p.name).filter(Boolean))];

const RW_VOCAB = `CRITICAL: Use TRUE Kinyarwanda, NOT Swahili. These are completely different languages.
Key Kinyarwanda vocabulary for supermarket products:
- milk = amata (NEVER maziwa - that is Swahili)
- water = amazi (NEVER maji)
- bread = umugati
- rice = umuceri
- oil = amavuta
- sugar = isukari
- flour = ufu
- meat = inyama
- chicken = inkoko
- fish = ifi
- egg = irigi (plural: amagi)
- butter = amavuta
- juice = umutobe
- beer = inzoga
- soap = isabune
- baby = uruhinja
- cooking = guteka
- fresh = nshya
- whole = yose
- low fat = ya mafuta make
- powder = ubunga
- salt = umunyu
- pepper = urusenda
- tomato = inyanya
- onion = igitunguru
- spice = urubilizi
- coffee = ikawa
- tea = icyayi
- corn = ibigori
- wheat = ingano
- sunflower = izuba
- coconut = nazi
- avocado = avoka
- small = ntoya
- large = nini
- pure = isukuye
- refined = isukuye
- extra = yongeye
- dog = imbwa
- hair = umusatsi
- body = umubiri
- hand = intoki
- toothpaste = pasiti y'amenyo
- sport = siporo
- remote control = igikoresho cya kure
- building blocks = ibikoresho byo kubaka
- jump rope = umugozi wo gusimbuka
- drawing board = ikirahuri
Keep brand names unchanged: Simba, Inyange, Mukamira, Azam, Jambo, Crystal, Zesta, Herman, Nestle, Campari, Flora, Zima, ABK6, Basso, Kevian, Kenzy, Mila, DOLO, Sutai, River Dog, American Garden, Blue Band, Belle France, Boni, Greens, Kenton, Minimex, Toha, Sabroso, RS, Rinsun, Sinar, Smart, Clovers, Everyday, Golden Valley, Super Chef, Lentz, Azania, Baba Noor, Inyange, Mukamira.
Keep model codes, sizes, and numbers unchanged.
Return ONLY valid JSON object: {"original name": "kinyarwanda translation"}`;

const FR_VOCAB = `Translate supermarket product names to French.
Keep brand names unchanged: Simba, Inyange, Mukamira, Azam, Jambo, Crystal, Zesta, Herman, Nestle, Campari, Flora, Zima, ABK6, Basso, Kevian, Kenzy, Mila, DOLO, Sutai, River Dog, American Garden, Blue Band, Belle France, Boni, Greens, Kenton, Minimex, Toha, Sabroso, RS, Rinsun, Sinar, Smart, Clovers, Everyday, Golden Valley, Super Chef, Lentz, Azania, Baba Noor.
Keep model codes, sizes, and numbers unchanged. Only translate descriptive words.
Return ONLY valid JSON object: {"original name": "french translation"}`;

async function translateBatch(batch, lang) {
  const vocab = lang === 'rw' ? RW_VOCAB : FR_VOCAB;
  const langLabel = lang === 'rw' ? 'Kinyarwanda (NOT Swahili)' : 'French';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: `Translate these supermarket product names into ${langLabel}.\n${vocab}` },
        { role: 'user', content: JSON.stringify(batch) },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  });
  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try { return JSON.parse(match[0]); } catch { return {}; }
}

async function main() {
  const outFile = 'src/data/product_translations.json';
  let existing = {};
  if (fs.existsSync(outFile)) {
    existing = JSON.parse(fs.readFileSync(outFile, 'utf8'));
  }

  const result = { ...existing };
  const BATCH = 25;

  for (const lang of ['rw', 'fr']) {
    console.log(`\nTranslating to ${lang}...`);
    if (!result[lang]) result[lang] = {};

    const todo = names.filter(n => !result[lang][n]);
    console.log(`  ${todo.length} names to translate`);

    for (let i = 0; i < todo.length; i += BATCH) {
      const batch = todo.slice(i, i + BATCH);
      process.stdout.write(`  Batch ${Math.floor(i/BATCH)+1}/${Math.ceil(todo.length/BATCH)}... `);
      try {
        const translated = await translateBatch(batch, lang);
        let count = 0;
        for (const [orig, trans] of Object.entries(translated)) {
          if (trans && typeof trans === 'string' && trans.trim()) {
            result[lang][orig] = trans.trim();
            count++;
          }
        }
        console.log(`got ${count} translations`);
        // Save after each batch
        fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
      } catch (e) {
        console.log(`ERROR: ${e.message}`);
      }
      if (i + BATCH < todo.length) await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\nDone! Saved to', outFile);
  const rwCount = Object.keys(result.rw || {}).length;
  const frCount = Object.keys(result.fr || {}).length;
  console.log(`RW: ${rwCount} translations, FR: ${frCount} translations`);
}

main().catch(console.error);
