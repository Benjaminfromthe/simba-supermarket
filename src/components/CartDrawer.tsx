import { useTranslation } from 'react-i18next';
import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { t } = useTranslation();
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white dark:bg-card shadow-xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-4 border-b dark:border-border text-foreground">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            <h2 className="text-lg font-bold">{t('myCart')}</h2>
            <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-bold">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-foreground">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
              <ShoppingCart className="w-16 h-16 opacity-20" />
              <p className="font-medium text-lg">{t('emptyCart')}</p>
              <button 
                onClick={() => { onClose(); navigate('/shop'); }}
                className="mt-4 bg-primary text-white px-6 py-2 rounded-full font-bold shadow hover:bg-primary/90 transition-colors"
              >
                {t('shop')}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 border dark:border-border p-3 rounded-xl bg-card">
                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg border dark:border-border" />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm leading-tight text-foreground line-clamp-2">{item.name}</h3>
                    <p className="text-primary font-bold mt-1 text-sm">{t('priceRwf', { price: item.price.toLocaleString() })}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border dark:border-border rounded-lg bg-muted/50 overflow-hidden">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1 px-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 px-2 hover:bg-muted text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-muted-foreground hover:text-destructive p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t dark:border-border bg-muted/20 text-foreground">
            <div className="flex items-center justify-between mb-4 font-bold text-lg">
              <span>{t('total')}</span>
              <span className="text-primary text-xl tracking-tight">{t('priceRwf', { price: getCartTotal().toLocaleString() })}</span>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              {t('checkout')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
