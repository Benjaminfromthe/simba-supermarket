'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

const PRIZES = [
  { label: '5% OFF', color: '#F47A3E', discount: 5 },
  { label: 'Free Delivery', color: '#10B981', discount: 0, freeDelivery: true },
  { label: '10% OFF', color: '#8B5CF6', discount: 10 },
  { label: '500 RWF OFF', color: '#F59E0B', discount: 0, flat: 500 },
  { label: '15% OFF', color: '#EF4444', discount: 15 },
  { label: 'Try Again', color: '#6B7280', discount: 0 },
  { label: '8% OFF', color: '#3B82F6', discount: 8 },
  { label: '1000 RWF OFF', color: '#EC4899', discount: 0, flat: 1000 },
];

const SEGMENT_ANGLE = 360 / PRIZES.length;

export default function SpinWheel() {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<typeof PRIZES[0] | null>(null);
  const [claimed, setClaimed] = useState(false);

  useEffect(() => {
    // Show only for first-time visitors
    const seen = localStorage.getItem('simba-wheel-seen');
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    const extraSpins = 5 * 360;
    const randomAngle = Math.floor(Math.random() * 360);
    const totalRotation = rotation + extraSpins + randomAngle;
    setRotation(totalRotation);

    setTimeout(() => {
      const normalizedAngle = (360 - (totalRotation % 360)) % 360;
      const index = Math.floor(normalizedAngle / SEGMENT_ANGLE) % PRIZES.length;
      setResult(PRIZES[index]);
      setSpinning(false);
    }, 4000);
  };

  const handleClaim = () => {
    if (result && result.label !== 'Try Again') {
      localStorage.setItem('simba-wheel-prize', JSON.stringify(result));
    }
    localStorage.setItem('simba-wheel-seen', 'true');
    setClaimed(true);
    setTimeout(() => setOpen(false), 1500);
  };

  const handleClose = () => {
    localStorage.setItem('simba-wheel-seen', 'true');
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl p-6 w-full max-w-sm relative border border-gray-100 dark:border-gray-700">
              <button onClick={handleClose} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-4 h-4 text-gray-500 dark:text-white" />
              </button>

              {claimed ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center py-8">
                  <div className="text-5xl mb-3">🎉</div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1">
                    {result?.label === 'Try Again' ? 'Better luck next time!' : `You won ${result?.label}!`}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Applied to your next order</p>
                </motion.div>
              ) : (
                <>
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Gift className="w-5 h-5 text-[#F47A3E]" />
                      <h3 className="text-lg font-black text-gray-900 dark:text-white">Welcome to Simba!</h3>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">Spin the wheel for an exclusive discount</p>
                  </div>

                  {/* Wheel */}
                  <div className="relative flex items-center justify-center mb-4">
                    {/* Pointer */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
                      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[16px] border-l-transparent border-r-transparent border-t-[#F47A3E]" />
                    </div>

                    <motion.div
                      animate={{ rotate: rotation }}
                      transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
                      className="w-52 h-52 rounded-full relative overflow-hidden border-4 border-white dark:border-gray-600 shadow-xl"
                      style={{ background: 'conic-gradient(' + PRIZES.map((p, i) => `${p.color} ${i * SEGMENT_ANGLE}deg ${(i + 1) * SEGMENT_ANGLE}deg`).join(', ') + ')' }}
                    >
                      {PRIZES.map((prize, i) => {
                        const angle = i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
                        return (
                          <div
                            key={i}
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ transform: `rotate(${angle}deg)` }}
                          >
                            <span className="text-white text-[9px] font-black translate-x-14 whitespace-nowrap drop-shadow-sm">
                              {prize.label}
                            </span>
                          </div>
                        );
                      })}
                    </motion.div>

                    {/* Center */}
                    <div className="absolute w-10 h-10 bg-white dark:bg-gray-800 rounded-full border-4 border-[#F47A3E] flex items-center justify-center shadow-lg z-10">
                      <Sparkles className="w-4 h-4 text-[#F47A3E]" />
                    </div>
                  </div>

                  {result ? (
                    <div className="text-center mb-4">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                        <p className="text-2xl font-black" style={{ color: result.color }}>
                          {result.label === 'Try Again' ? '😅 Try Again!' : `🎉 ${result.label}!`}
                        </p>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="h-10 mb-4" />
                  )}

                  {!result ? (
                    <button
                      onClick={spin}
                      disabled={spinning}
                      className="w-full bg-[#F47A3E] hover:bg-[#D46A2E] disabled:opacity-60 text-white font-black py-3 rounded-2xl transition-all text-sm shadow-lg hover:shadow-orange-200 dark:hover:shadow-orange-900"
                    >
                      {spinning ? '🎰 Spinning...' : '🎯 SPIN TO WIN!'}
                    </button>
                  ) : (
                    <button
                      onClick={handleClaim}
                      className="w-full font-black py-3 rounded-2xl transition-all text-sm shadow-lg text-white"
                      style={{ background: result.color }}
                    >
                      {result.label === 'Try Again' ? 'Continue Shopping' : `Claim ${result.label}!`}
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
