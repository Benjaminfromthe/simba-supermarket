import i18n from '../i18n/config';

// Category translations — natural, professional terms
const categoryTranslations: Record<string, { fr: string; rw: string }> = {
  'Cosmetics & Personal Care': {
    fr: 'Cosmétiques & Soins Personnels',
    rw: 'Ibisukura & Kwita ku Mubiri',
  },
  'Sports & Wellness': {
    fr: 'Sports & Bien-être',
    rw: 'Siporo & Ubuzima',
  },
  'Baby Products': {
    fr: 'Produits Bébé',
    rw: 'Ibicuruzwa by\'Uruhinja',
  },
  'Kitchenware & Electronics': {
    fr: 'Ustensiles & Électronique',
    rw: 'Ibikoresho bya Kuchefurira & Ikoranabuhanga',
  },
  'Food Products': {
    fr: 'Produits Alimentaires',
    rw: 'Ibiribwa',
  },
  'Alcoholic Drinks': {
    fr: 'Boissons Alcoolisées',
    rw: 'Inzoga',
  },
  'General': {
    fr: 'Général',
    rw: 'Ibindi Bicuruzwa',
  },
  'Cleaning & Sanitary': {
    fr: 'Nettoyage & Hygiène',
    rw: 'Isukura & Ubuzima Rusange',
  },
  'Kitchen Storage': {
    fr: 'Rangement Cuisine',
    rw: 'Ibigega bya Kuchefurira',
  },
  'Pet Care': {
    fr: 'Soins Animaux',
    rw: 'Kwita ku Matungo',
  },
};

export function getLocalizedProductCategory(product: any): string {
  if (!product?.category) return '';
  const lang = i18n.language;
  if (lang === 'fr') return categoryTranslations[product.category]?.fr || product.category;
  if (lang === 'rw') return categoryTranslations[product.category]?.rw || product.category;
  return product.category;
}

export function getLocalizedProductName(product: any): string {
  if (!product) return '';
  const lang = i18n.language;
  // Products don't have translated names in the dataset, return English name
  // but trim any extra whitespace
  return (product.name || '').trim();
}

export function getLocalizedCategoryName(category: string): string {
  const lang = i18n.language;
  if (lang === 'fr') return categoryTranslations[category]?.fr || category;
  if (lang === 'rw') return categoryTranslations[category]?.rw || category;
  return category;
}
