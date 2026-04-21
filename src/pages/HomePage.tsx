import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import productsData from '../data/simba_products.json';
import ProductCard from '../components/ProductCard';
import { ChevronRight, Percent, Truck, ShieldCheck, Clock } from 'lucide-react';
import { getLocalizedProductCategory } from '../lib/localize';

const productsList = Array.isArray(productsData) ? productsData : ((productsData as any).products || []);

const CATEGORIES = Array.from(new Set(productsList.map((p: any) => p.category))).filter(Boolean).slice(0, 10) as string[];

// Helper to get localized category string based on the English category key
const getLocalizedCat = (catName: string) => {
  const p = productsList.find((p: any) => p.category === catName);
  return p ? getLocalizedProductCategory(p) : catName;
}

export default function HomePage() {
  const { t } = useTranslation();
  const [popularProducts, setPopularProducts] = useState(productsList.slice(0, 8));
  
  return (
    <div className="flex flex-col gap-8 pb-12 text-foreground bg-gray-50 dark:bg-background">
      
      {/* Main Hero with Sidebar Layout */}
      <section className="container mx-auto px-4 mt-8">
        <div className="flex gap-8 items-stretch h-[450px]">
           {/* Sidebar Categories (Desktop) */}
           <div className="hidden lg:flex w-64 shrink-0 flex-col bg-white dark:bg-card border dark:border-border rounded-lg shadow-sm overflow-hidden">
             <div className="bg-primary text-white p-4 font-bold uppercase text-sm flex items-center">
                {t('allCategories')}
             </div>
             <div className="flex flex-col py-2 overflow-y-auto">
               {CATEGORIES.map(cat => (
                 <Link 
                   key={cat} 
                   to={`/shop?category=${encodeURIComponent(cat)}`}
                   className="px-5 py-3 hover:bg-muted text-sm font-medium border-b border-gray-50 dark:border-gray-800 flex justify-between items-center group text-gray-700 dark:text-gray-300"
                 >
                   <span className="group-hover:text-primary transition-colors">{getLocalizedCat(cat)}</span>
                   <ChevronRight className="w-4 h-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                 </Link>
               ))}
               <Link to="/shop" className="px-5 py-3 text-sm font-bold text-primary hover:opacity-80">{t('allCategories')}</Link>
             </div>
           </div>

           {/* Hero Banner Slider */}
           <div className="flex-1 relative bg-muted rounded-lg overflow-hidden flex items-center shadow-sm">
             <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-10" />
             <img 
               src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=2000" 
               alt="Supermarket" 
               className="absolute inset-0 w-full h-full object-cover" 
             />
             <div className="relative z-20 text-white p-8 md:p-14 max-w-lg">
               <span className="inline-block py-1 px-3 bg-secondary text-white text-xs font-bold uppercase tracking-wider mb-4 rounded shadow-sm">
                 {t('exclusiveOffer')}
               </span>
               <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-4 drop-shadow-md">
                 {t('freshGroceries')} <br/> 
                 <span className="text-yellow-400">{t('deliveredFast')}</span>
               </h1>
               <p className="text-base md:text-lg text-white/90 mb-8 font-medium drop-shadow max-w-sm">
                 {t('heroDescription')}
               </p>
               <Link 
                 to="/shop" 
                 className="inline-flex bg-primary hover:opacity-90 text-white px-8 py-3 rounded uppercase font-bold text-sm tracking-wide shadow-lg transition-transform active:scale-95"
               >
                 {t('shopNow')}
               </Link>
             </div>
           </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4 mt-2">
        <div className="bg-white dark:bg-card border dark:border-border rounded-lg shadow-sm p-6 grid grid-cols-2 md:grid-cols-4 gap-4 divide-x dark:divide-border divide-gray-100">
           <div className="flex items-center gap-4 px-4 justify-center">
              <Truck className="w-10 h-10 text-primary" />
              <div>
                 <h4 className="font-bold text-sm">{t('freeDelivery')}</h4>
                 <p className="text-xs text-gray-500">{t('freeDeliveryDesc')}</p>
              </div>
           </div>
           <div className="flex items-center gap-4 px-4 justify-center">
              <Percent className="w-10 h-10 text-primary" />
              <div>
                 <h4 className="font-bold text-sm">{t('dailyOffers')}</h4>
                 <p className="text-xs text-gray-500">{t('dailyOffersDesc')}</p>
              </div>
           </div>
           <div className="flex items-center gap-4 px-4 justify-center">
              <ShieldCheck className="w-10 h-10 text-primary" />
              <div>
                 <h4 className="font-bold text-sm">{t('securePayment')}</h4>
                 <p className="text-xs text-gray-500">{t('securePaymentDesc')}</p>
              </div>
           </div>
           <div className="flex items-center gap-4 px-4 justify-center">
              <Clock className="w-10 h-10 text-primary" />
              <div>
                 <h4 className="font-bold text-sm">{t('support247')}</h4>
                 <p className="text-xs text-gray-500">{t('supportDesc')}</p>
              </div>
           </div>
        </div>
      </section>

      {/* Promotional Banners */}
      <section className="container mx-auto px-4 mt-4">
        <div className="grid md:grid-cols-2 gap-6">
           <div className="bg-accent/30 rounded-lg p-8 flex items-center border border-accent overflow-hidden relative min-h-[200px]">
              <div className="z-10 relative left-0 shadow-sm p-4 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-lg">
                 <h3 className="text-2xl font-bold flex items-center text-foreground mb-2">{t('freshFruits')}</h3>
                 <p className="mb-4 font-medium text-foreground">{t('get10Off')}</p>
                 <Link to="/shop?category=Fresh Produce" className="text-sm font-bold text-primary hover:underline border-b-2 border-primary pb-1">{t('shopNow')}</Link>
              </div>
              <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=300&q=80" alt="Fruits" className="absolute right-0 top-0 bottom-0 h-full object-cover w-1/2 rounded-l-full shadow-xl opacity-80" />
           </div>
           <div className="bg-secondary/40 rounded-lg p-8 flex items-center border border-secondary overflow-hidden relative min-h-[200px]">
              <div className="z-10 relative left-0 shadow-sm p-4 bg-white/70 dark:bg-black/50 backdrop-blur-sm rounded-lg">
                 <h3 className="text-2xl font-bold text-foreground mb-2">{t('organicVeg')}</h3>
                 <p className="text-foreground mb-4 font-medium">{t('freshFromFarm')}</p>
                 <Link to="/shop?category=Fresh Produce" className="text-sm font-bold text-secondary-foreground hover:underline border-b-2 border-secondary-foreground pb-1">{t('shopNow')}</Link>
              </div>
              <img src="https://images.unsplash.com/photo-1598090842581-c94b8e1e4bfb?auto=format&fit=crop&w=300&q=80" alt="Veg" className="absolute right-0 top-0 bottom-0 h-full object-cover w-1/2 rounded-l-full shadow-xl opacity-80" />
           </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="container mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-extrabold flex items-center gap-3 text-foreground uppercase border-l-4 border-primary pl-4">
            {t('dealsOfDay')}
          </h2>
          <Link to="/shop" className="text-primary font-bold hover:underline shrink-0 text-sm flex items-center gap-1">
            {t('viewAll')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {popularProducts.map(currentProduct => (
            <ProductCard key={currentProduct.id} product={currentProduct as any} />
          ))}
        </div>
      </section>
      
    </div>
  );
}
