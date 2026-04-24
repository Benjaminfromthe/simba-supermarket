import type React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
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
    toast.success(`${localizedName} ${t('addedToCartToast')}`, {
      icon: '🛒',
      style: { borderRadius: '10px', background: '#333', color: '#fff' },
    });
  };

  return (
    <div className="group card-premium flex flex-col h-full overflow-hidden">
      <Link to={`/product/${product.id}`} className="relative bg-white dark:bg-card aspect-square overflow-hidden block p-6">
        <img 
          src={product.image} 
          alt={localizedName} 
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Simba'; }}
        />
        <div className="absolute top-3 left-3 bg-red-600 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm z-10">
          {t('sale')}
        </div>
      </Link>
      
      <div className="p-4 pt-5 flex flex-col flex-1 border-t border-gray-100 dark:border-border/50">
        <div className="text-xs text-[#F47A3E] uppercase font-black tracking-widest mb-1.5 line-clamp-1 hyphens-auto">
          {getLocalizedProductCategory(product)}
        </div>
        <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">
          <h3 className="font-bold text-sm md:text-base text-foreground line-clamp-2 leading-snug mb-2 group-hover:text-primary transition-colors min-h-[40px] hyphens-auto">
            {localizedName}
          </h3>
        </Link>
        
        <div className="mt-auto flex flex-col gap-3">
          <div className="flex items-end gap-2 flex-wrap">
            <span className="text-2xl font-black text-[#F47A3E] tracking-tighter leading-none">
              {t('priceRwf', { price: product.price.toLocaleString() })}
            </span>
            <span className="text-sm text-foreground opacity-80 line-through mb-0.5 font-bold">
              {t('priceRwf', { price: oldPrice.toLocaleString() })}
            </span>
          </div>
          
          <div className="flex flex-col gap-2 pt-3">
            <div className="flex items-center border border-gray-300 dark:border-border rounded-lg bg-gray-50 dark:bg-muted/50 overflow-hidden h-10">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-full flex items-center justify-center text-foreground hover:bg-gray-200 dark:hover:bg-muted transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-bold text-sm bg-transparent text-foreground">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-full flex items-center justify-center text-foreground hover:bg-gray-200 dark:hover:bg-muted transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <button 
              onClick={handleAddToCart}
              className="w-full py-3 rounded-lg text-sm bg-[#F47A3E] text-white hover:bg-[#D46A2E] flex items-center justify-center gap-2 font-black transition-all duration-300 active:scale-95 shadow-sm"
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