import type React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Star } from 'lucide-react';
import { Product, useCartStore } from '../store/useCartStore';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { t } = useTranslation();
  const addItem = useCartStore((state) => state.addItem);

  // Generate mock old price (10-20% higher) to show discounts
  const oldPrice = Math.floor(product.price * 1.15);

  return (
    <div className="group bg-white dark:bg-card border dark:border-border rounded-lg overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full hover:border-primary/30 relative">
      <Link to={`/product/${product.id}`} className="relative bg-white dark:bg-card aspect-square overflow-hidden block p-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
        />
        {/* Sale Badge */}
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm z-10">
          Sale
        </div>
      </Link>
      
      <div className="p-4 pt-1 flex flex-col flex-1 border-t border-gray-50 dark:border-border/50">
        <div className="text-[10px] text-gray-400 dark:text-muted-foreground uppercase font-bold tracking-wider mb-1.5 opacity-80">
          {product.category}
        </div>
        <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors min-h-[40px]">
            {product.name}
          </h3>
        </Link>
        
        {/* Star Rating Placeholder */}
        <div className="flex items-center gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            ))}
            <span className="text-xs text-gray-400 ml-1">(12)</span>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-end gap-2 flex-wrap">
            <span className="text-lg font-bold text-primary tracking-tight leading-none">
              {t('priceRwf', { price: product.price.toLocaleString() })}
            </span>
            <span className="text-xs text-gray-400 line-through mb-0.5 font-medium">
              {oldPrice.toLocaleString()} Rwf
            </span>
          </div>
          
          <button 
            onClick={() => addItem(product)}
            className="w-full py-2.5 rounded text-sm bg-gray-100 text-gray-800 dark:bg-muted dark:text-foreground group-hover:bg-primary group-hover:text-white flex items-center justify-center gap-2 font-bold transition-all duration-300 active:scale-95 border dark:border-border"
          >
            <ShoppingCart className="w-4 h-4" />
            {t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;