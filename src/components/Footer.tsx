import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Twitter, Linkedin, MessageCircle, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  const { t } = useTranslation();
  
  const branches = [
    t('simbaUTC', 'Simba UTC (Town)'),
    t('simbaGishushu', 'Simba Gishushu'),
    t('simbaKisimenti', 'Simba Kisimenti'),
    t('simbaGacuriro', 'Simba Gacuriro'),
    t('simbaKigaliHeights', 'Simba Kigali Heights'),
    t('simbaKimironko', 'Simba Kimironko'),
    t('simbaCentenaryHouse', 'Simba Centenary House'),
    t('simbaKanombe', 'Simba Kanombe'),
    t('simbaChic', 'Simba CHIC City Market')
  ];

  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t-4 border-[#F47A3E]">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        
        {/* About Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-1.5 w-12 h-12 flex items-center justify-center shadow-lg overflow-hidden">
              <img 
                src="/simba-logo.jpg" 
                alt="Simba Logo" 
                className="w-10 h-10 object-contain" 
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-black tracking-tighter text-white">
                SIMBA <span className="text-[#F47A3E]">SUPERMARKET</span>
              </h2>
              <p className="text-[10px] font-bold italic text-[#F47A3E] tracking-tight">
                {t('slogan', '"Unlimited Shopping At One Stop!"')}
              </p>
            </div>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
            {t('footerDescMobile', 'Serving Rwanda with quality and care for over 50 years. Simba Supermarket is your premier destination for groceries and household essentials.')}
          </p>
          <p className="text-gray-300 text-sm font-medium uppercase tracking-widest mt-2 border-l-2 border-[#F47A3E] pl-3">
            {t('officialWebsite', 'Official Website:')}<br/>
            <a href="https://simbaonlineshopping.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors lowercase">simbaonlineshopping.com</a>
          </p>
          <div className="flex flex-col gap-3">
            <a 
              href="https://wa.me/250788316316" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5c] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95 w-max text-sm"
            >
              <MessageCircle className="w-5 h-5" />
              {t('chatWithSimba', 'Chat with Simba')}
            </a>
          </div>
        </div>
        
        {/* Quick Links */}
        <div>
          <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
            {t('quickLinks', 'Quick Links')}
          </h3>
          <ul className="space-y-3">
            <li><Link to="/" className="text-gray-400 hover:text-[#F47A3E] transition-colors text-sm flex items-center gap-2 group"><ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" /> {t('home')}</Link></li>
            <li><Link to="/shop" className="text-gray-400 hover:text-[#F47A3E] transition-colors text-sm flex items-center gap-2 group"><ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" /> {t('shop')}</Link></li>
            <li><Link to="/orders" className="text-gray-400 hover:text-[#F47A3E] transition-colors text-sm flex items-center gap-2 group"><ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" /> {t('myOrders', 'My Orders')}</Link></li>
            <li><Link to="/about" className="text-gray-400 hover:text-[#F47A3E] transition-colors text-sm flex items-center gap-2 group"><ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" /> {t('about', 'About us')}</Link></li>
            <li><Link to="/contact" className="text-gray-400 hover:text-[#F47A3E] transition-colors text-sm flex items-center gap-2 group"><ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100" /> {t('contactUs', 'Contact us')}</Link></li>
          </ul>
        </div>

        {/* Our Branches */}
        <div>
          <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
            {t('ourBranches', 'Our Branches')}
          </h3>
          <ul className="space-y-2">
            {branches.map((branch) => (
              <li key={branch}>
                <div className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-3 group cursor-default">
                  <MapPin className="w-3.5 h-3.5 text-[#F47A3E] group-hover:animate-bounce" />
                  {branch}
                </div>
              </li>
            ))}
            <li className="pt-2">
              <Link to="/" className="text-[#F47A3E] font-bold text-sm hover:underline flex items-center gap-1 uppercase tracking-wider">
                {t('findOnMap', 'Find on Map')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact & Follow Us */}
        <div>
          <h3 className="font-extrabold text-lg mb-6 flex items-center gap-2 border-b border-gray-800 pb-2">
            {t('getInTouch', 'Get In Touch')}
          </h3>
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-[#F47A3E] shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-gray-200">+250 788 316 316</p>
                <p className="text-sm text-gray-300">{t('customerSupport', 'Customer Support')}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-[#F47A3E] shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-gray-200">orders@simba.rw</p>
                <p className="text-sm text-gray-300">{t('onlineShopSupport', 'Online Shop Support')}</p>
              </div>
            </li>
          </ul>

          <h4 className="font-bold text-sm uppercase tracking-[0.2em] text-gray-300 mb-4">{t('followSimba', 'Follow Simba')}</h4>
          <div className="flex items-center gap-4">
            <a href="https://www.facebook.com/simbasupermarket" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-[#1877F2] transition-all group shadow-lg">
              <Facebook className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </a>
            <a href="https://www.instagram.com/simbasupermarketrw" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-[#E4405F] transition-all group shadow-lg">
              <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </a>
            <a href="https://twitter.com/SimbaSupermarke" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-black transition-all group shadow-lg">
              <Twitter className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </a>
            <a href="https://www.linkedin.com/company/simba-supermarket/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-lg hover:bg-[#0077B5] transition-all group shadow-lg">
              <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white" />
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-16 pt-8 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-gray-300 uppercase tracking-widest">
          <p>&copy; {new Date().getFullYear()} {t('allRightsReserved', 'Simba Supermarket Ltd. All rights reserved.')}</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">{t('privacyPolicy', 'Privacy Policy')}</Link>
            <Link to="/terms" className="hover:text-white transition-colors">{t('termsOfService', 'Terms of Service')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
