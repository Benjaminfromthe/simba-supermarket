import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-8 border-t-4 border-primary">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
               <span className="text-primary font-bold text-sm tracking-tighter">SIMBA</span>
             </div>
             <span className="font-bold text-lg">Simba Supermarket</span>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed mb-4">
            {t('footerDesc')}
          </p>
        </div>
        
        <div>
          <h3 className="font-bold text-lg mb-4 text-primary">{t('quickLinks')}</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/" className="hover:text-white transition-colors">{t('home')}</Link></li>
            <li><Link to="/shop" className="hover:text-white transition-colors">{t('shop')}</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors">{t('about')}</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">{t('contact')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4 text-primary">{t('categories')}</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link to="/shop?category=Fresh Produce" className="hover:text-white transition-colors">{t('freshProduce', 'Fresh Produce')}</Link></li>
            <li><Link to="/shop?category=Beverages" className="hover:text-white transition-colors">{t('beverages')}</Link></li>
            <li><Link to="/shop?category=Dairy & Eggs" className="hover:text-white transition-colors">{t('dairyEggs', 'Dairy & Eggs')}</Link></li>
            <li><Link to="/shop?category=Bakery" className="hover:text-white transition-colors">{t('bakery', 'Bakery')}</Link></li>
            <li><Link to="/shop" className="hover:text-white underline transition-colors w-max mt-2 block">{t('allCategories')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-4 text-primary">{t('contactUs')}</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>Kigali, Rwanda</li>
            <li>Email: info@simba.rw</li>
            <li>Phone: +250 788 000 000</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Simba Supermarket Ltd. All rights reserved.
      </div>
    </footer>
  );
}
