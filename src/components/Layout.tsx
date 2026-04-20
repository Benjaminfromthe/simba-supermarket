import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import { useState } from 'react';

export default function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onOpenCart={() => setIsCartOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
