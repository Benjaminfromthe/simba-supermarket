/**
 * PreloadLink — drops in as a replacement for react-router <Link>.
 * On hover/focus it triggers the lazy import for the target route,
 * so the JS chunk is already downloaded by the time the user clicks.
 */
import { Link, LinkProps } from 'react-router-dom';
import { MouseEvent, FocusEvent } from 'react';

// Map routes to their lazy import functions
const PRELOAD_MAP: Record<string, () => Promise<any>> = {
  '/shop':             () => import('../pages/ShopPage'),
  '/checkout':         () => import('../pages/CheckoutPage'),
  '/orders':           () => import('../pages/OrdersPage'),
  '/about':            () => import('../pages/AboutPage'),
  '/contact':          () => import('../pages/ContactPage'),
  '/reviews':          () => import('../pages/BranchReviewsPage'),
  '/branch-dashboard': () => import('../pages/BranchDashboard'),
  '/login':            () => import('../pages/LoginPage'),
  '/signup':           () => import('../pages/SignupPage'),
};

export default function PreloadLink({ to, onMouseEnter, onFocus, ...props }: LinkProps) {
  const path = typeof to === 'string' ? to : (to as any).pathname || '';

  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    const loader = PRELOAD_MAP[path];
    if (loader) loader().catch(() => {}); // silent — just warms the cache
    onMouseEnter?.(e);
  };

  const handleFocus = (e: FocusEvent<HTMLAnchorElement>) => {
    const loader = PRELOAD_MAP[path];
    if (loader) loader().catch(() => {});
    onFocus?.(e);
  };

  return <Link to={to} onMouseEnter={handleMouseEnter} onFocus={handleFocus} {...props} />;
}
