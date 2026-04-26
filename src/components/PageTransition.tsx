import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
}

const variants = {
  initial: { opacity: 0, y: -24 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: 12 },
};

export default function PageTransition({ children, title, subtitle, icon }: PageTransitionProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {title && (
        <div className="bg-white dark:bg-[#0F172A] border-b border-gray-100 dark:border-gray-800">
          <div className="container mx-auto px-4 py-5 max-w-7xl">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-9 h-9 rounded-xl bg-[#F47A3E]/10 flex items-center justify-center text-[#F47A3E] shrink-0">
                  {icon}
                </div>
              )}
              <div>
                <h1 className="text-xl font-black text-gray-900 dark:text-white leading-none">{title}</h1>
                {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
      {children}
    </motion.div>
  );
}
