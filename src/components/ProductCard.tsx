import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Plus, Minus, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Product, useCartStore } from '../store/useCartStore';
import { getLocalizedProductName, getLocalizedProductCategory } from '../lib/localize';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { t } = useTranslation();
  const addItem = useCartStore(s => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const localizedName = getLocalizedProductName(product);
  const oldPrice = Math.floor(product.price * 1.15);

  const handleAdd = (e?: React.MouseEvent) => {
    e?.preventDefault();
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    toast.success(`${localizedName} ${t('addedToCartToast')}`, {
      icon: '🛒',
      style: { borderRadius: '14px', background: '#1A1A1A', color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: '13px' },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="product-card glass-card flex flex-col h-full"
    >
      {/* Image area */}
      <Link to={`/product/${product.id}`} className="relative overflow-hidden rounded-t-[20px] bg-white dark:bg-gray-800 aspect-square block">
        <img
          src={product.image}
          alt={localizedName}
          className="product-img w-full h-full object-contain p-4"
          onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Simba'; }}
        />
        {/* Sale badge */}
        <div className="absolute top-3 left-3 bg-[#F47A3E] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
          {t('sale')}
        </div>
        {/* Quick Add overlay */}
        <div className="quick-add px-3 pb-3">
          <button
            onClick={handleAdd}
            className="w-full bg-[#F47A3E] hover:bg-[#D46A2E] text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-lg"
          >
            <Zap className="w-3.5 h-3.5" />
            Quick Add
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] font-semibold text-[#F47A3E] uppercase tracking-widest mb-1 hyphens-auto">
          {getLocalizedProductCategory(product)}
        </p>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug mb-2 hover:text-[#F47A3E] transition-colors" style={{ fontFamily: 'Inter, sans-serif', minHeight: '2.5rem' }}>
            {localizedName}
          </h3>
        </Link>

        <div className="mt-auto">
          <div className="flex items-end gap-2 mb-3">
            <span className="text-lg font-black text-[#F47A3E]">{product.price.toLocaleString()} RWF</span>
            <span className="text-xs text-gray-400 line-through mb-0.5">{oldPrice.toLocaleString()}</span>
          </div>

          {/* Qty + Add */}
          <div className="flex gap-2">
            <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-7 text-center text-sm font-bold text-gray-800 dark:text-white">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.92 }}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl text-xs font-bold transition-all ${added ? 'bg-green-500 text-white' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-[#F47A3E] dark:hover:bg-[#F47A3E] dark:hover:text-white'}`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {added ? '✓ Added' : t('addToCart')}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
