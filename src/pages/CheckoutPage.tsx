import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, ChevronRight, Lock, Loader2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();

  const [momoPhone, setMomoPhone] = useState('078');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState<'idle' | 'pending' | 'success'>('idle');

  if (items.length === 0 && orderStatus !== 'success') {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-foreground">
        <h2 className="text-2xl font-bold mb-4">{t('emptyCart')}</h2>
        <button onClick={() => navigate('/shop')} className="bg-primary text-white px-6 py-2 rounded-lg">
          {t('shop')}
        </button>
      </div>
    );
  }

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!momoPhone || !address) return;
    
    setIsProcessing(true);
    setOrderStatus('pending');

    // Simulate MoMo Webhook delay
    setTimeout(() => {
      setIsProcessing(false);
      setOrderStatus('success');
      clearCart();
    }, 4000);
  };

  if (orderStatus === 'success') {
    return (
      <div className="container mx-auto px-4 py-32 text-center text-foreground flex flex-col items-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
           <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold font-serif mb-4">{t('orderSuccess')}</h1>
        <p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
          Thank you for exploring Simba 2.0. In a real scenario, your order would be on its way to your address!
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-primary text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-primary/90 transition"
        >
          {t('home')}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-muted/20 dark:bg-background min-h-screen py-12 text-foreground">
      <div className="container mx-auto px-4 max-w-4xl">
        
        <h1 className="text-3xl font-bold mb-8">{t('checkout')}</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {/* Shipping Address */}
            <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Delivery Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-muted-foreground">Full Name</label>
                  <input type="text" className="w-full border dark:border-border rounded-xl p-3 bg-transparent" placeholder="John Doe" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-muted-foreground">Delivery Address (Kigali)</label>
                  <input 
                    type="text" 
                    className="w-full border dark:border-border rounded-xl p-3 bg-transparent" 
                    placeholder="e.g. KG 11 Ave, Nyarutarama" 
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                Payment Method 
                <Lock className="w-4 h-4 text-muted-foreground" />
              </h2>
              
              <div className="border-2 border-primary bg-primary/5 rounded-xl p-4 flex gap-4 relative">
                <input type="radio" checked readOnly className="mt-1" />
                <div>
                  <h3 className="font-bold">MTN Mobile Money (MoMo)</h3>
                  <p className="text-sm text-muted-foreground mt-1">Pay quickly using your MoMo account.</p>
                </div>
                {/* Mock momo badge */}
                <div className="absolute top-4 right-4 bg-yellow-400 text-blue-900 font-bold text-xs px-2 py-1 rounded">MoMo</div>
              </div>

              <form onSubmit={handleCheckout} className="mt-6">
                <label className="block text-sm font-semibold mb-1 text-muted-foreground">{t('momoPhone')}</label>
                <input 
                  type="text" 
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                  className="w-full border dark:border-border rounded-xl p-3 font-mono text-lg bg-transparent" 
                  required
                  placeholder="078 XXXXXXX"
                />
                
                {orderStatus === 'pending' && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl flex items-center justify-center gap-3 font-medium border border-blue-100 dark:border-blue-800">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('paymentPending')}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isProcessing}
                  className="mt-6 w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : t('payWithMomo')} 
                  {!isProcessing && <ChevronRight className="w-5 h-5" />}
                </button>
              </form>
            </div>
            
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm sticky top-28">
              <h2 className="text-xl font-bold mb-4 border-b dark:border-border pb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-muted rounded border dark:border-border shrink-0 flex items-center justify-center relative">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                      <span className="absolute -top-2 -right-2 bg-muted-foreground text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="line-clamp-2 font-medium leading-tight">{item.name}</p>
                      <p className="text-muted-foreground mt-1">{t('priceRwf', { price: (item.price * item.quantity).toLocaleString() })}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-3 text-sm border-t dark:border-border pt-4 text-muted-foreground">
                 <div className="flex justify-between">
                   <span>Subtotal</span>
                   <span>{t('priceRwf', { price: getCartTotal().toLocaleString() })}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Delivery</span>
                   <span>Free</span>
                 </div>
                 <div className="flex justify-between text-lg font-bold text-foreground border-t dark:border-border pt-4">
                   <span>{t('total')}</span>
                   <span className="text-primary">{t('priceRwf', { price: getCartTotal().toLocaleString() })}</span>
                 </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
