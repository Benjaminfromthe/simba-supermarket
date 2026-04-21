import i18n from '../i18n/config';

export function getLocalizedField(item: any, field: string): string {
    if (!item) return '';
    const lang = i18n.language;
    if (lang === 'fr' && item[`${field}_fr`]) return item[`${field}_fr`];
    if (lang === 'rw' && item[`${field}_rw`]) return item[`${field}_rw`];
    return item[field] || '';
}

export function getLocalizedProductName(product: any): string {
    return getLocalizedField(product, 'name');
}

export function getLocalizedProductCategory(product: any): string {
    return getLocalizedField(product, 'category');
}
