import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  count: number;
  imageUrl: string;
  href: string;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ name, count, imageUrl, href }) => {
  return (
    <Link 
      to={href} 
      className="group relative block bg-[#F3F4F6] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 aspect-[4/3] sm:aspect-square lg:aspect-[4/3]"
    >
      {/* Product Image - Centered and Floating */}
      <div className="absolute inset-0 flex items-center justify-center p-8 transition-transform duration-500 group-hover:scale-110">
        <img 
          src={imageUrl} 
          alt={name} 
          className="max-w-full max-h-full object-contain mix-blend-multiply" 
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Dark Gradient Overlay & Text Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
        <h3 className="text-white font-bold text-lg sm:text-xl leading-tight">
          {name}
        </h3>
        <p className="text-[#F47A3E] font-medium text-sm mt-1">
          {count} items
        </p>
      </div>

      {/* Orange Action Button */}
      <div className="absolute bottom-5 right-5 w-10 h-10 bg-[#F47A3E] rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:bg-[#D46A2E]">
        <ArrowRight className="w-5 h-5" />
      </div>
    </Link>
  );
};

const CATEGORY_DATA = [
  {
    name: "Alcoholic Drinks",
    count: 251,
    imageUrl: "https://res.cloudinary.com/eskalate/image/upload/v1776507695/simba_contest/product_27001.jpg",
    href: "/?category=Alcoholic%20Drinks"
  },
  {
    name: "Cosmetics & Personal Care",
    count: 162,
    imageUrl: "https://res.cloudinary.com/eskalate/image/upload/v1776507699/simba_contest/product_29001.jpg",
    href: "/?category=Cosmetics%20&%20Personal%20Care"
  },
  {
    name: "General",
    count: 159,
    imageUrl: "https://res.cloudinary.com/eskalate/image/upload/v1776507694/simba_contest/product_19001.jpg",
    href: "/?category=General"
  },
  {
    name: "Food Products",
    count: 70,
    imageUrl: "https://res.cloudinary.com/eskalate/image/upload/v1776507705/simba_contest/product_62001.jpg",
    href: "/?category=Food%20Products"
  }
];

export const CategoryGrid: React.FC = () => {
  return (
    <section className="container mx-auto px-4 py-10">
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
