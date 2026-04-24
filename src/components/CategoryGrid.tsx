import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import productsData from '../data/simba_products.json';
import { getLocalizedCategoryName } from '../lib/localize';

const productsList = Array.isArray(productsData) ? productsData : ((productsData as any).products || []);

interface CategoryCardProps {
  name: string;
  imageUrl: string;
  href: string;
  count: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ name, imageUrl, href, count }) => {
  const { t } = useTranslation();
  
  return (
    <Link 
      to={href} 
      className="group block bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="aspect-square flex items-center justify-center p-4 bg-gray-50 dark:bg-muted/30 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500" 
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="p-4 text-center">
        <h3 className="font-bold text-sm md:text-base text-foreground group-hover:text-[#FF8A00] transition-colors line-clamp-1 hyphens-auto">
          {getLocalizedCategoryName(name)}
        </h3>
        <p className="text-gray-500 text-xs mt-1">
          {count} {t('items')}
        </p>
      </div>
    </Link>
  );
};

export const CategoryGrid: React.FC = () => {
  const { t } = useTranslation();

  const categories = useMemo(() => {
    const catMap = new Map<string, { image: string, count: number }>();
    
    productsList.forEach((p: any) => {
      if (!p.category) return;
      if (!catMap.has(p.category)) {
        catMap.set(p.category, { image: p.image, count: 1 });
      } else {
        catMap.get(p.category)!.count++;
      }
    });

    return Array.from(catMap.entries()).map(([name, data]) => ({
      name,
      imageUrl: data.image,
      count: data.count,
      href: `/?category=${encodeURIComponent(name)}`
    })).slice(0, 12);
  }, []);

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">
          {t('categories')}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <CategoryCard 
            key={category.name}
            {...category}
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryGrid;
