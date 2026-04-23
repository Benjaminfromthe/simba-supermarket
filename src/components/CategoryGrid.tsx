import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

import { useTranslation } from 'react-i18next';
import { getLocalizedProductCategory } from '../lib/localize';

interface CategoryCardProps {
  name: string;
  name_fr: string;
  name_rw: string;
  count: number;
  imageUrl: string;
  href: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ name, name_fr, name_rw, count, imageUrl, href }) => {
  const { t, i18n } = useTranslation();
  
  const getLocalizedName = () => {
    if (i18n.language === 'fr') return name_fr;
    if (i18n.language === 'rw') return name_rw;
    return name;
  };

  return (
    <Link 
      to={href} 
      className="group relative block bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary/50"
    >
      {/* Product Image */}
      <div className="aspect-[4/3] flex items-center justify-center p-6 bg-gray-50 dark:bg-muted/30 border-b border-gray-100 dark:border-border/50 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-105 transition-transform duration-500" 
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="p-5 flex flex-col justify-end text-foreground">
        <h3 className="font-black text-xl leading-tight tracking-tight uppercase group-hover:text-primary transition-colors">
          {getLocalizedName()}
        </h3>
        <p className="text-[#F47A3E] font-bold text-sm mt-1.5 uppercase tracking-wide">
          {count} {t('items')}
        </p>
      </div>
    </Link>
  );
};

const CATEGORY_DATA = [
  {
    name: "Alcoholic Drinks",
    name_fr: "Boissons Alcoolisées",
    name_rw: "Ibinyobwa Bisindisha",
    count: 251,
    imageUrl: "https://images.unsplash.com/photo-1597290282695-edc4310e7129?auto=format&fit=crop&q=80&w=800",
    href: "/?category=Alcoholic%20Drinks"
  },
  {
    name: "Cosmetics & Personal Care",
    name_fr: "Cosmétiques & Soins Personnels",
    name_rw: "Ibikoresho by'Isuku n'Amavuta",
    count: 162,
    imageUrl: "https://images.unsplash.com/photo-1596462502278-27bfdc4033c8?auto=format&fit=crop&q=80&w=800",
    href: "/?category=Cosmetics%20&%20Personal%20Care"
  },
  {
    name: "General",
    name_fr: "Produits Divers",
    name_rw: "Ibikoresho binyuranye",
    count: 159,
    imageUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800",
    href: "/?category=General"
  },
  {
    name: "Food Products",
    name_fr: "Produits Alimentaires",
    name_rw: "Ibiribwa & Ibinyobwa",
    count: 70,
    imageUrl: "https://images.unsplash.com/photo-1506484334402-40ff22e0d3b6?auto=format&fit=crop&q=80&w=800",
    href: "/?category=Food%20Products"
  }
];

export const CategoryGrid: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-8 bg-[#F47A3E] rounded-full"></div>
        <h2 className="text-3xl font-extrabold text-foreground uppercase tracking-tight">
          {t('categories')}
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {CATEGORY_DATA.map((category) => (
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
