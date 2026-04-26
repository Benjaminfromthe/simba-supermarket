import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ShoppingCart, CheckCircle2, ShieldCheck, Truck, MapPin, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import productsData from '../data/simba_products.json';
import { useCartStore, Product } from '../store/useCartStore';
import { getLocalizedProductName, getLocalizedProductCategory } from '../lib/localize';
import { useBranchStock } from '../hooks/useBranchStock';
import branches from '../data/branches.json';
import PageTransition from '../components/PageTransition';

const productsList = Array.isArray(productsData) ? productsData : ((productsData as any).products || []);

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const addItem = useCartStore(state => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const product = productsList.find((p: any) => String(p.id) === id) as Product | undefined;
  const { stock, loading: stockLoading, outOfStock } = useBranchStock(selectedBranchId, product?.id ?? null);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">{t('productNotFound', 'Product Not Found')}</h2>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline flex items-center justify-center gap-2 mx-auto">
          <ArrowLeft className="w-4 h-4" /> {t('goBack', 'Go Back')}
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${localizedName} ${t('addedToCartToast', 'added to cart!')}`, {
      icon: '🛒',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };

  const localizedName = getLocalizedProductName(product);
  const localizedCategory = getLocalizedProductCategory(product);

  return (
    <PageTransition
      title={localizedName}
      subtitle={localizedCategory}
      icon={<ShoppingCart className="w-5 h-5" />}
    >
    <div className=" min-h-screen py-8 text-foreground">
      <div className="container mx-auto px-4">
        
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground flex items-center gap-2 mb-6 font-medium transition-colors">
          <ArrowLeft className="w-5 h-5" /> {t('backToShop', 'Back to Shop')}
        </button>

        <div className="bg-white dark:bg-card border dark:border-border rounded-3xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-1/2 p-4 md:p-8 bg-white dark:bg-card border-r dark:border-border hidden md:flex items-center justify-center">
            <img 
              src={product.image} 
              alt={localizedName} 
              className="w-full aspect-square object-cover rounded-xl"
            />
          </div>
          <div className="md:hidden p-4 bg-white dark:bg-card">
              <img 
                src={product.image} 
                alt={localizedName} 
                className="w-full aspect-square object-cover rounded-2xl"
              />
          </div>

          {/* Product Details */}
          <div className="md:w-1/2 p-6 md:p-12 flex flex-col">
            <div className="text-sm font-bold tracking-widest text-primary uppercase mb-2 bg-primary/10 w-max px-3 py-1 rounded-full">
              {localizedCategory}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold font-serif mb-4 leading-tight text-foreground">
              {localizedName}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
              {product.brand && (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
                  <span className="font-medium">{t('brand')}: <span className="text-foreground">{product.brand}</span></span>
                </>
              )}
              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30"></span>
              <span className="flex items-center gap-1 text-green-600 dark:text-green-500 font-bold">
                <CheckCircle2 className="w-4 h-4" /> {product.inStock === false ? t('outOfStock') : t('inStock')} {product.stock ? `(${product.stock})` : ''}
              </span>
            </div>

            <div className="text-4xl font-bold tracking-tight text-primary mb-6 border-y dark:border-border py-4 my-2">
              {t('priceRwf', { price: product.price.toLocaleString() })} {product.unit ? `/ ${product.unit}` : ''}
            </div>

            {product.description && (
              <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                {product.description}
              </p>
            )}

            <div className="mt-auto space-y-4">

               {/* Branch stock checker */}
               <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                 <label className="block text-xs font-bold text-gray-600 dark:text-white mb-2 flex items-center gap-1.5">
                   <MapPin className="w-3.5 h-3.5 text-[#F47A3E]" />
                   {t('checkStockAtBranch', 'Check stock at branch')}
                 </label>
                 <select
                   value={selectedBranchId || ''}
                   onChange={e => setSelectedBranchId(e.target.value || null)}
                   className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F47A3E]"
                 >
                   <option value="">{t('selectBranchToCheck', 'Select a branch...')}</option>
                   {branches.map(b => (
                     <option key={b.id} value={b.id}>{b.name}</option>
                   ))}
                 </select>

                 {/* Stock status */}
                 {selectedBranchId && (
                   <div className={`mt-2 flex items-center gap-2 text-sm font-bold ${outOfStock ? 'text-red-500' : 'text-green-600'}`}>
                     {stockLoading ? (
                       <span className="text-gray-400 text-xs">{t('checking', 'Checking...')}</span>
                     ) : outOfStock ? (
                       <>
                         <AlertCircle className="w-4 h-4" />
                         {t('outOfStockAtBranch', 'Out of stock at this branch')}
                       </>
                     ) : (
                       <>
                         <CheckCircle2 className="w-4 h-4" />
                         {stock !== null && stock < 50
                           ? `${stock} ${t('itemsLeft', 'items left')}`
                           : t('inStock')}
                       </>
                     )}
                   </div>
                 )}
               </div>

               <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-border dark:border-border rounded-xl bg-white dark:bg-muted overflow-hidden h-14 w-32">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-muted dark:hover: transition"
                    >
                      -
                    </button>
                    <span className="flex-1 font-bold text-center text-lg bg-transparent">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-full flex items-center justify-center text-muted-foreground hover:bg-muted dark:hover: transition"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 h-14 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-transform active:scale-95 text-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {t('addToCart')}
                  </button>
               </div>
               
               <div className="grid grid-cols-2 gap-4 pt-6 border-t dark:border-border text-sm text-muted-foreground font-medium">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" /> {t('deliveryInKigali')}
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" /> {t('freshnessGuarantee')}
                  </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

