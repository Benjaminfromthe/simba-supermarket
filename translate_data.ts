import fs from 'fs';
import path from 'path';

const dataPath = path.resolve('src/data/simba_products.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

async function translateText(text, targetLang) {
    if (!text) return text;
    // Replace some characters that might cause issues
    const safeText = text.replace(/&/g, 'and');
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(safeText)}`;
    
    for (let i = 0; i < 3; i++) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            return json[0].map(item => item[0]).join('');
        } catch (e) {
            console.error(`Attempt ${i + 1} failed for "${text}": ${e.message}`);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return text;
}

async function run() {
    console.log(`Loaded ${data.products.length} products.`);

    // 1. Gather unique categories and subcategories
    const categories = new Set();
    for (const p of data.products) {
        if (p.category) categories.add(p.category);
    }
    
    // 2. Translate categories
    console.log('Translating categories...');
    const catTranslations = {};
    for (const cat of categories) {
        catTranslations[cat] = {
            fr: await translateText(cat, 'fr'),
            rw: await translateText(cat, 'rw') // rw is Kinyarwanda language code
        };
        console.log(`Cat: ${cat} -> FR: ${catTranslations[cat].fr}, RW: ${catTranslations[cat].rw}`);
    }

    // 3. Translate products sequentially
    console.log('Translating products (this may take a minute or two)...');
    let count = 0;
    
    // use small batches to speed up
    const batchSize = 10;
    for (let i = 0; i < data.products.length; i += batchSize) {
        const batch = data.products.slice(i, i + batchSize);
        await Promise.all(batch.map(async (p) => {
            p.name_fr = await translateText(p.name, 'fr');
            p.name_rw = await translateText(p.name, 'rw');
            
            if (p.category && catTranslations[p.category]) {
                p.category_fr = catTranslations[p.category].fr;
                p.category_rw = catTranslations[p.category].rw;
            } else {
                p.category_fr = p.category;
                p.category_rw = p.category;
            }
        }));
        
        count += batch.length;
        if (count % 50 === 0 || count === data.products.length) {
            console.log(`Translated ${count}/${data.products.length} products...`);
        }
        await new Promise(r => setTimeout(r, 200)); // Sleep to avoid rate limits
    }

    // 4. Save file
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('Done! Saved translated products to simba_products.json.');
}

run().catch(console.error);
