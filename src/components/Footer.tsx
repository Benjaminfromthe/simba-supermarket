import { Link } from 'react-router-dom';
import simbaLogo from '../assets/simba-logo-v2.jpg';
import { useTranslation } from 'react-i18next';
import { Facebook, Instagram, Twitter, Linkedin, MessageCircle, Phone, Mail, Navigation } from 'lucide-react';
import branchesData from '../data/branches.json';

function openDirections(branch: typeof branchesData[0]) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps/dir/${latitude},${longitude}/${branch.latitude},${branch.longitude}`;
        window.open(url, '_blank');
      },
      () => {
        window.open(branch.mapUrl, '_blank');
      },
      { timeout: 5000 }
    );
  } else {
    window.open(branch.mapUrl, '_blank');
  }
}

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-950 text-white mt-8">
      <div className="h-0.5 bg-gradient-to-r from-[#F47A3E] via-orange-400 to-[#F47A3E]" />

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden shrink-0">
              <img src={simbaLogo} alt="Simba" className="w-9 h-9 object-contain" />
            </div>
            <div>
              <p className="font-black text-white text-base leading-none">Simba Supermarket</p>
              <p className="text-[#F47A3E] text-xs italic mt-0.5">{t('slogan')}</p>
            </div>
          </div>
          <p className="text-gray-400 text-xs leading-relaxed">{t('footerDescMobile')}</p>
          <a
            href="https://wa.me/250788316316"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5c] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> {t('chatWithSimba')}
          </a>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-800">{t('quickLinks')}</h4>
          <ul className="space-y-1.5">
            {[
              { to: '/', label: t('home') },
              { to: '/shop', label: t('shop') },
              { to: '/orders', label: t('myOrders') },
              { to: '/about', label: t('about') },
              { to: '/contact', label: t('contactUs') },
              { to: '/reviews', label: t('reviewsNav') },
            ].map(link => (
              <li key={link.to}>
                <Link to={link.to} className="text-gray-400 hover:text-[#F47A3E] text-xs font-medium transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-800">{t('ourBranches')}</h4>
          <ul className="space-y-1.5">
            {branchesData.map(branch => (
              <li key={branch.id}>
                <button
                  onClick={() => openDirections(branch)}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-[#F47A3E] text-xs font-medium transition-colors group w-full text-left"
                >
                  <Navigation className="w-3 h-3 text-[#F47A3E] shrink-0" />
                  {branch.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-3 pb-1.5 border-b border-gray-800">{t('getInTouch')}</h4>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                <Phone className="w-3 h-3 text-[#F47A3E]" />
              </div>
              <div>
                <p className="text-white text-xs font-bold">+250 788 316 316</p>
                <p className="text-gray-500 text-[10px]">{t('customerSupport')}</p>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-800 rounded-lg flex items-center justify-center shrink-0">
                <Mail className="w-3 h-3 text-[#F47A3E]" />
              </div>
              <div>
                <p className="text-white text-xs font-bold">orders@simba.rw</p>
                <p className="text-gray-500 text-[10px]">{t('onlineShopSupport')}</p>
              </div>
            </li>
          </ul>
          <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-2">{t('followSimba')}</p>
          <div className="flex gap-2">
            {[
              { href: 'https://www.facebook.com/simbasupermarket', icon: <Facebook className="w-4 h-4" />, color: 'hover:bg-[#1877F2]' },
              { href: 'https://www.instagram.com/simba_supermarket/', icon: <Instagram className="w-4 h-4" />, color: 'hover:bg-[#E4405F]' },
              { href: 'https://x.com/SimbaRwanda', icon: <Twitter className="w-4 h-4" />, color: 'hover:bg-gray-700' },
              { href: 'https://www.linkedin.com/company/simba-supermarket-ltd-rwanda/', icon: <Linkedin className="w-4 h-4" />, color: 'hover:bg-[#0077B5]' },
            ].map((social, index) => (
              <a
                key={index}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-8 h-8 bg-gray-800 ${social.color} rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-all`}
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-gray-500">
          <p>© {new Date().getFullYear()} {t('allRightsReserved')}</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">{t('privacyPolicy')}</Link>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">{t('termsOfService')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
