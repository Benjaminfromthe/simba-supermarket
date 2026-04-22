import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import { Product, useCartStore } from '../store/useCartStore';
import { getLocalizedProductName, getLocalizedProductCategory } from '../lib/localize';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { t } = useTranslation();
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);

  // Generate mock old price (10-20% higher) to show discounts
  const oldPrice = Math.floor(product.price * 1.15);

  const localizedName = getLocalizedProductName(product);

  const handleAddToCart = () => {
    addItem(product, quantity);
    // Optional: Reset quantity to 1 after adding? Usually better to keep it if they want to add more, 
    // but the user wants to "get their attention".
  };

  return (
    <div className="group bg-white dark:bg-card border dark:border-border rounded-lg overflow-hidden hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full hover:border-primary/30 relative">
      <Link to={`/product/${product.id}`} className="relative bg-white dark:bg-card aspect-square overflow-hidden block p-4">
        <img 
          src={product.image} 
          alt={localizedName} 
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" 
        />
        {/* Sale Badge */}
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm z-10">
          {t('sale')}
        </div>
      </Link>
      
      <div className="p-4 pt-4 flex flex-col flex-1 border-t border-gray-100 dark:border-gray-800">
        <div className="text-sm md:text-base text-gray-700 dark:text-gray-300 uppercase font-bold tracking-wider mb-1.5 opacity-90 line-clamp-1">
          {getLocalizedProductCategory(product)}
        </div>
        <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-bold text-base md:text-lg text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors min-h-[48px]">
            {localizedName}
          </h3>
        </Link>
        
        {/* Star Rating Placeholder */}
        <div className="flex items-center gap-0.5 mb-3">
            {[1, 2, 3, 4, 5].map(star => (
              <Star key={star} className="w-4 h-4 text-amber-500 fill-amber-500" />
            ))}
            <span className="text-sm text-gray-700 dark:text-gray-300 ml-1 font-bold">(12)</span>
        </div>

        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-end gap-2 flex-wrap">
            <span className="text-xl font-black text-primary tracking-tight leading-none">
              {t('priceRwf', { price: product.price.toLocaleString() })}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300 line-through mb-0.5 font-bold">
              {t('priceRwf', { price: oldPrice.toLocaleString() })}
            </span>
          </div>
          
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center border dark:border-border rounded-lg bg-gray-50 dark:bg-muted/50 overflow-hidden h-9">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="flex-1 text-center font-bold text-sm bg-transparent">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-muted transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full py-2.5 rounded text-sm bg-gray-100 text-gray-800 dark:bg-muted dark:text-foreground group-hover:bg-primary group-hover:text-white flex items-center justify-center gap-2 font-bold transition-all duration-300 active:scale-95 border dark:border-border"
            >
              <ShoppingCart className="w-4 h-4" />
              {t('addToCart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;