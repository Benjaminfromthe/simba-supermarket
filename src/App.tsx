/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import './i18n/config';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import SpinWheel from './components/SpinWheel';
import { Loader2 } from 'lucide-react';

// Lazy-load all pages — each becomes its own chunk, drastically reducing initial bundle
const HomePage         = lazy(() => import('./pages/HomePage'));
const ShopPage         = lazy(() => import('./pages/ShopPage'));
const ProductPage      = lazy(() => import('./pages/ProductPage'));
const CheckoutPage     = lazy(() => import('./pages/CheckoutPage'));
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const SignupPage       = lazy(() => import('./pages/SignupPage'));
const OrdersPage       = lazy(() => import('./pages/OrdersPage'));
const AdminOrdersPage  = lazy(() => import('./pages/AdminOrdersPage'));
const AboutPage        = lazy(() => import('./pages/AboutPage'));
const ContactPage      = lazy(() => import('./pages/ContactPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const BranchDashboard  = lazy(() => import('./pages/BranchDashboard'));
const BranchReviewsPage = lazy(() => import('./pages/BranchReviewsPage'));

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#F47A3E]" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-right" />
      <SpinWheel />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="shop" element={<ShopPage />} />
            <Route path="product/:id" element={<ProductPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="admin/orders" element={<AdminOrdersPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/branch-dashboard" element={<BranchDashboard />} />
          <Route path="/reviews" element={<BranchReviewsPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
