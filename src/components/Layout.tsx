import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import Footer from './Footer';
import CartProgressBar from './CartProgressBar';
import ConversationalSearch from './ConversationalSearch';

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-[#0F172A] text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar onOpenCart={() => setCartOpen(true)} />
      <CartProgressBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <ConversationalSearch />
    </div>
  );
}
