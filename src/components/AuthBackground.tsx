import { useEffect, useRef, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

// Floating food items with emoji — each has a fixed position, size, and parallax depth
const FLOATERS = [
  { emoji: '🥑', x: 8,  y: 12, size: 2.8, depth: 0.04 },
  { emoji: '🍎', x: 88, y: 8,  size: 2.2, depth: 0.07 },
  { emoji: '🥛', x: 15, y: 72, size: 2.5, depth: 0.05 },
  { emoji: '🍊', x: 82, y: 65, size: 3.0, depth: 0.03 },
  { emoji: '🥦', x: 50, y: 6,  size: 2.0, depth: 0.08 },
  { emoji: '🍞', x: 92, y: 38, size: 2.4, depth: 0.06 },
  { emoji: '🧴', x: 5,  y: 45, size: 2.1, depth: 0.05 },
  { emoji: '🍋', x: 70, y: 88, size: 2.6, depth: 0.04 },
  { emoji: '🥚', x: 28, y: 88, size: 2.0, depth: 0.07 },
  { emoji: '🫙', x: 60, y: 18, size: 1.8, depth: 0.06 },
  { emoji: '🍇', x: 38, y: 78, size: 2.3, depth: 0.05 },
  { emoji: '🧃', x: 78, y: 22, size: 2.0, depth: 0.08 },
];

// Particles — pure CSS floating dots
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 3,
  duration: 6 + Math.random() * 10,
  delay: Math.random() * 8,
  opacity: 0.15 + Math.random() * 0.25,
}));

interface Props {
  children: ReactNode;
}

export default function AuthBackground({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Raw mouse position as motion values
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smooth spring — makes movement feel fluid not jittery
  const mouseX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const mouseY = useSpring(rawY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      // Normalize to -1 → +1 range from center
      rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
      rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [rawX, rawY]);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-12"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1040, #24243e)' }}
    >
      {/* ── ANIMATED GRADIENT WAVE LAYER ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(244,122,62,0.18) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 80% 70%, rgba(244,122,62,0.18) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 50% 20%, rgba(244,122,62,0.15) 0%, transparent 70%)',
              'radial-gradient(ellipse 80% 60% at 20% 30%, rgba(244,122,62,0.18) 0%, transparent 70%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(ellipse 60% 50% at 70% 20%, rgba(139,92,246,0.12) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 50% at 30% 80%, rgba(139,92,246,0.12) 0%, transparent 60%)',
              'radial-gradient(ellipse 60% 50% at 70% 20%, rgba(139,92,246,0.12) 0%, transparent 60%)',
            ],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── GRID MESH PATTERN ── */}
      <div
        className="absolute inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(244,122,62,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(244,122,62,0.8) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── PARTICLES ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: p.opacity,
            }}
            animate={{
              y: [0, -24, 0],
              opacity: [p.opacity, p.opacity * 0.4, p.opacity],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* ── PARALLAX FLOATING FOOD ITEMS ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {FLOATERS.map((f, i) => {
          // Each floater moves at its own depth multiplier
          const offsetX = useTransform(mouseX, v => v * 80 * f.depth);
          const offsetY = useTransform(mouseY, v => v * 80 * f.depth);
          return (
            <motion.div
              key={i}
              className="absolute select-none"
              style={{
                left: `${f.x}%`,
                top: `${f.y}%`,
                fontSize: `${f.size}rem`,
                x: offsetX,
                y: offsetY,
                filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))',
              }}
              animate={{
                rotate: [0, 8, -8, 0],
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 5 + i * 0.7,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            >
              {f.emoji}
            </motion.div>
          );
        })}
      </div>

      {/* ── HOLOGRAPHIC NEON RING (behind the card) ── */}
      <motion.div
        className="absolute z-0 rounded-full pointer-events-none"
        style={{
          width: 520,
          height: 520,
          background: 'conic-gradient(from 0deg, #F47A3E22, #8B5CF622, #F47A3E22, #10B98122, #F47A3E22)',
          filter: 'blur(60px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* ── GLASSMORPHISM CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '24px',
          boxShadow: '0 8px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Neon top border accent */}
        <div
          className="absolute top-0 left-8 right-8 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #F47A3E, transparent)' }}
        />
        <div className="p-8">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
