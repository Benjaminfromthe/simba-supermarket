import { useEffect, useRef, useState, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// ── Weather scene config ────────────────────────────────────────────────────
type WeatherScene = 'sunny' | 'rainy' | 'cold' | 'night' | 'default';

function getWeatherScene(weather: string | null, hour: number): WeatherScene {
  if (hour >= 20 || hour < 6) return 'night';
  if (!weather) return 'default';
  const w = weather.toLowerCase();
  if (w.includes('rain') || w.includes('drizzle') || w.includes('thunder')) return 'rainy';
  if (w.includes('snow') || w.includes('cold') || w.includes('freez')) return 'cold';
  if (w.includes('clear') || w.includes('sun')) return 'sunny';
  return 'default';
}

const SCENE_CONFIG: Record<WeatherScene, {
  bg: string; accent: string; floaters: string[]; tip: string; tipEmoji: string;
}> = {
  sunny: {
    bg: 'linear-gradient(135deg, #1a0a00, #2d1200, #1a0a00)',
    accent: 'rgba(255,180,0,0.2)',
    floaters: ['🍦','🧃','🍉','🥤','🍋','🫐','🍓','🥭','🍑','🍒','🌽','🥝'],
    tip: "Hot day? We have cold drinks & ice cream!",
    tipEmoji: '☀️',
  },
  rainy: {
    bg: 'linear-gradient(135deg, #0a0f1a, #0d1a2d, #0a0f1a)',
    accent: 'rgba(100,160,255,0.18)',
    floaters: ['🍜','🫖','🍵','🥣','🍲','🧅','🥕','🧄','🫚','🍞','🧀','🥚'],
    tip: "Rainy day? Perfect for soup & warm drinks!",
    tipEmoji: '🌧️',
  },
  cold: {
    bg: 'linear-gradient(135deg, #050d1a, #0a1628, #050d1a)',
    accent: 'rgba(150,220,255,0.15)',
    floaters: ['☕','🍫','🧣','🫖','🍵','🥐','🧇','🥞','🍯','🫙','🥛','🍞'],
    tip: "Cold outside? Stock up on warm essentials!",
    tipEmoji: '❄️',
  },
  night: {
    bg: 'linear-gradient(135deg, #050510, #0a0a20, #050510)',
    accent: 'rgba(180,100,255,0.15)',
    floaters: ['🌙','⭐','🍕','🍿','🧁','🍰','🍫','🥂','🍷','🫙','🧃','🍪'],
    tip: "Late night craving? We deliver fast!",
    tipEmoji: '🌙',
  },
  default: {
    bg: 'linear-gradient(135deg, #0f0c29, #1a1040, #24243e)',
    accent: 'rgba(244,122,62,0.18)',
    floaters: ['🥑','🍎','🥛','🍊','🥦','🍞','🧴','🍋','🥚','🫙','🍇','🧃'],
    tip: "Rwanda's #1 Supermarket — Order & Pick up fast!",
    tipEmoji: '🛒',
  },
};

// Particles
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1.5 + Math.random() * 2.5,
  duration: 7 + Math.random() * 10,
  delay: Math.random() * 8,
  opacity: 0.12 + Math.random() * 0.2,
}));

// Floater sub-component — hooks must be at top level, never inside .map()
function Floater({ emoji, index, mouseX, mouseY }: {
  emoji: string; index: number;
  mouseX: import('framer-motion').MotionValue<number>;
  mouseY: import('framer-motion').MotionValue<number>;
}) {
  const offsetX = useTransform(mouseX, v => v * 80 * DEPTHS[index]);
  const offsetY = useTransform(mouseY, v => v * 80 * DEPTHS[index]);
  return (
    <motion.div className="absolute select-none"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1, rotate: [0, 8, -8, 0] }}
      transition={{ duration: 0.6, delay: index * 0.05, rotate: { duration: 5 + index * 0.7, repeat: Infinity, ease: 'easeInOut' } }}
      style={{
        left: `${POSITIONS[index].x}%`, top: `${POSITIONS[index].y}%`,
        fontSize: `${SIZES[index]}rem`, x: offsetX, y: offsetY,
        filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))',
      }}
    >
      {emoji}
    </motion.div>
  );
}

interface Props {
  children: ReactNode;
  isTypingPassword?: boolean;
}

export default function AuthBackground({ children, isTypingPassword = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<WeatherScene>('default');
  const [weatherTip, setWeatherTip] = useState('');
  const [weatherEmoji, setWeatherEmoji] = useState('🛒');

  // ── Detect weather via Open-Meteo (free, no API key) ──────────────────────
  useEffect(() => {
    const hour = new Date().getHours();
    const nightScene = getWeatherScene(null, hour);
    if (nightScene === 'night') {
      setScene('night');
      setWeatherTip(SCENE_CONFIG.night.tip);
      setWeatherEmoji(SCENE_CONFIG.night.tipEmoji);
      return;
    }
    navigator.geolocation?.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
          );
          const data = await res.json();
          const code = data?.current_weather?.weathercode ?? 0;
          // WMO weather codes: 0=clear, 1-3=cloudy, 51-67=rain, 71-77=snow, 80-99=storm
          let weatherStr = 'clear';
          if (code >= 51 && code <= 99) weatherStr = 'rain';
          else if (code >= 71 && code <= 77) weatherStr = 'snow';
          const s = getWeatherScene(weatherStr, hour);
          setScene(s);
          setWeatherTip(SCENE_CONFIG[s].tip);
          setWeatherEmoji(SCENE_CONFIG[s].tipEmoji);
        } catch {
          setScene('default');
          setWeatherTip(SCENE_CONFIG.default.tip);
          setWeatherEmoji(SCENE_CONFIG.default.tipEmoji);
        }
      },
      () => {
        setScene('default');
        setWeatherTip(SCENE_CONFIG.default.tip);
        setWeatherEmoji(SCENE_CONFIG.default.tipEmoji);
      },
      { timeout: 4000 }
    );
  }, []);

  const cfg = SCENE_CONFIG[scene];

  // ── Parallax mouse tracking ───────────────────────────────────────────────
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const mouseX = useSpring(rawX, { stiffness: 60, damping: 20 });
  const mouseY = useSpring(rawY, { stiffness: 60, damping: 20 });

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      rawX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
      rawY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [rawX, rawY]);

  const DEPTHS = [0.04, 0.07, 0.05, 0.03, 0.08, 0.06, 0.05, 0.04, 0.07, 0.06, 0.05, 0.08];
  const POSITIONS = [
    { x: 8, y: 12 }, { x: 88, y: 8 }, { x: 15, y: 72 }, { x: 82, y: 65 },
    { x: 50, y: 6 },  { x: 92, y: 38 }, { x: 5, y: 45 }, { x: 70, y: 88 },
    { x: 28, y: 88 }, { x: 60, y: 18 }, { x: 38, y: 78 }, { x: 78, y: 22 },
  ];
  const SIZES = [2.8, 2.2, 2.5, 3.0, 2.0, 2.4, 2.1, 2.6, 2.0, 1.8, 2.3, 2.0];

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen overflow-hidden flex items-center justify-center px-4 py-12"
      style={{ background: cfg.bg, transition: 'background 1.5s ease' }}
    >
      {/* ── ANIMATED GRADIENT WAVES ── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div className="absolute inset-0"
          animate={{
            background: [
              `radial-gradient(ellipse 80% 60% at 20% 30%, ${cfg.accent} 0%, transparent 70%)`,
              `radial-gradient(ellipse 80% 60% at 80% 70%, ${cfg.accent} 0%, transparent 70%)`,
              `radial-gradient(ellipse 80% 60% at 50% 20%, ${cfg.accent} 0%, transparent 70%)`,
              `radial-gradient(ellipse 80% 60% at 20% 30%, ${cfg.accent} 0%, transparent 70%)`,
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ── GRID MESH ── */}
      <div className="absolute inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(244,122,62,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(244,122,62,0.8) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      {/* ── PARTICLES ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {PARTICLES.map(p => (
          <motion.div key={p.id} className="absolute rounded-full bg-white"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
            animate={{ y: [0, -20, 0], opacity: [p.opacity, p.opacity * 0.3, p.opacity] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* ── PARALLAX FOOD FLOATERS (weather-aware) ── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {cfg.floaters.map((emoji, i) => (
          <Floater key={`${scene}-${i}`} emoji={emoji} index={i} mouseX={mouseX} mouseY={mouseY} />
        ))}
      </div>

      {/* ── HOLOGRAPHIC RING ── */}
      <motion.div className="absolute z-0 rounded-full pointer-events-none"
        style={{
          width: 520, height: 520,
          background: 'conic-gradient(from 0deg, #F47A3E22, #8B5CF622, #F47A3E22, #10B98122, #F47A3E22)',
          filter: 'blur(60px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />

      {/* ── WEATHER TIP BANNER ── */}
      <AnimatePresence>
        {weatherTip && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-white"
            style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', whiteSpace: 'nowrap' }}
          >
            <span>{weatherEmoji}</span>
            <span>{weatherTip}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MASCOT (milk carton that reacts to password typing) ── */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none">
        <motion.div
          animate={isTypingPassword
            ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 0.9, 0.9, 0.9, 0.9, 1] }
            : { rotate: 0, scale: 1 }
          }
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="text-5xl"
          title="Simba mascot"
        >
          {isTypingPassword ? '🙈' : '🥛'}
        </motion.div>
        {isTypingPassword && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-[10px] text-white/50 mt-1 font-medium"
          >
            I'm not looking! 👀
          </motion.div>
        )}
      </div>

      {/* ── GLASSMORPHISM CARD ── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 w-full max-w-md mt-12"
        style={{
          background: 'rgba(255,255,255,0.07)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '24px',
          boxShadow: '0 8px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        <div className="absolute top-0 left-8 right-8 h-px rounded-full"
          style={{ background: 'linear-gradient(90deg, transparent, #F47A3E, transparent)' }}
        />
        <div className="p-8">{children}</div>
      </motion.div>
    </div>
  );
}
