import { useCartStore } from '../store/useCartStore';
import { motion } from 'motion/react';
import { Truck, Flame } from 'lucide-react';

const FREE_SHIPPING_THRESHOLD = 20000; // 20,000 RWF

export default function CartProgressBar() {
  const total = useCartStore(s => s.getCartTotal());
  const items = useCartStore(s => s.items);

  if (items.length === 0) return null;

  const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);
  const achieved = total >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className="bg-orange-50 dark:bg-orange-950/20 border-b border-orange-100 dark:border-orange-900/30 px-4 py-2">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <Truck className={`w-4 h-4 shrink-0 ${achieved ? 'text-green-500' : 'text-[#F47A3E]'}`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-gray-700 dark:text-white">
                {achieved
                  ? '🎉 You unlocked Free Delivery!'
                  : `Add ${remaining.toLocaleString()} RWF more for Free Delivery`}
              </p>
              <span className="text-xs font-bold text-[#F47A3E]">{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`h-full rounded-full ${achieved ? 'bg-green-500' : 'bg-gradient-to-r from-[#F47A3E] to-orange-400'}`}
              />
            </div>
          </div>
          {achieved && <Flame className="w-4 h-4 text-green-500 shrink-0" />}
        </div>
      </div>
    </div>
  );
}
