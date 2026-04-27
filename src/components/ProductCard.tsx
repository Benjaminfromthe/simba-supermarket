import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Plus, Minus, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { Product, useCartStore } from '../store/useCartStore';
import { getLocalizedProductCategory } from '../lib/localize';
import { getCachedProductName } from './Navbar';

export function ProductCardSkeleton() {
  return (
    <div className="rounded-[20px] overflow-hidden border border-gray-100 dark:border-gray-800">
      <div className="skeleton h-44 w-full" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-3 w-1/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-8 w-full rounded-xl mt-3" />
      </div>
    </div>
  );
}

const ProductCard: React.FC<{ product: Product; compact?: boolean }> = ({ product, compact = false }) => {
  const { t, i18n } = useTranslation();
  const addItem = useCartStore(s => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [cartAnimating, setCartAnimating] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [, forceUpdate] = useState(0);

  // Re-render when Groq translations arrive
  useEffect(() => {
    const handler = () => forceUpdate(n => n + 1);
    window.addEventListener('simba-translated', handler);
    return () => window.removeEventListener('simba-translated', handler);
  }, []);

  const localizedName = getCachedProductName((product.name || '').trim(), i18n.language);
  const oldPrice = Math.floor(product.price * 1.15);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    addItem(product, quantity);
    setCartAnimating(true);
    setTimeout(() => setCartAnimating(false), 400);
    toast.success(`${localizedName} ${t('addedToCartToast')}`, {
      icon: '🛒',
      style: { borderRadius: '14px', background: '#1A1A1A', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '13px' },
      duration: 2000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="product-card glass-card group"
    >
      {/* Image area */}
      <Link to={`/product/${product.id}`} className={`block relative overflow-hidden rounded-t-[20px] bg-white dark:bg-gray-800 ${compact ? 'aspect-[4/3]' : 'aspect-square'}`}>
        {imgError || !product.image ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50 dark:bg-gray-800 gap-2">
            <span className="text-4xl">🛒</span>
            <span className="text-[10px] font-bold text-[#F47A3E] uppercase tracking-wide">Simba</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={localizedName}
            loading="lazy"
            className={`product-img w-full h-full object-contain p-4 transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}
        {/* Sale badge */}
        <span className="absolute top-3 left-3 bg-[#F47A3E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide z-10">
          {t('sale')}
        </span>
        {/* Quick Add — slides up on hover */}
        <div className="quick-add px-3 pb-3">
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#F47A3E] hover:bg-[#D46A2E] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg"
          >
            <Zap className="w-3.5 h-3.5" />
            {t('quickAdd', 'Quick Add')}
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className={compact ? 'p-2.5' : 'p-4'}>
        <p className="text-[#F47A3E] text-[10px] font-bold uppercase tracking-widest mb-1 line-clamp-1">
          {getLocalizedProductCategory(product)}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className={`font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug hover:text-[#F47A3E] transition-colors ${compact ? 'text-xs mb-1.5 min-h-[2rem]' : 'text-sm mb-3 min-h-[2.5rem]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
            {localizedName}
          </h3>
        </Link>

        <div className={`flex items-center gap-2 ${compact ? 'mb-2' : 'mb-3'}`}>
          <span className={`font-black text-[#F47A3E] ${compact ? 'text-sm' : 'text-lg'}`}>{product.price.toLocaleString()} RWF</span>
          <span className="text-xs text-gray-400 line-through">{oldPrice.toLocaleString()}</span>
        </div>

        {/* Compact mode — quantity selector + Add to Cart */}
        {compact ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden h-8 bg-gray-50 dark:bg-gray-800 shrink-0">
              <button
                onClick={e => { e.preventDefault(); setQuantity(Math.max(1, quantity - 1)); }}
                className="w-8 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold text-base"
              >
                −
              </button>
              <span className="w-6 text-center text-xs font-bold text-gray-800 dark:text-white">{quantity}</span>
              <button
                onClick={e => { e.preventDefault(); setQuantity(quantity + 1); }}
                className="w-8 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-bold text-base"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex-1 h-8 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${cartAnimating ? 'cart-pop bg-green-500 text-white' : 'bg-[#F47A3E] hover:bg-[#D46A2E] text-white'}`}
            >
              <ShoppingCart className="w-3 h-3" />
              {t('addToCart')}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden h-9 bg-gray-50 dark:bg-gray-800">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-7 text-center text-sm font-bold text-gray-800 dark:text-white">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              className={`flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${cartAnimating ? 'cart-pop bg-green-500 text-white' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-[#F47A3E] dark:hover:bg-[#F47A3E] dark:hover:text-white'}`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {t('addToCart')}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
