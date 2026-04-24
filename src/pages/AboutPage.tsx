import type React from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingBag, Users, Heart, Award, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="bg-white dark: min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary/95 mix-blend-multiply z-10" />
        <img 
          src="https://images.unsplash.com/photo-1578916171728-46683e7452d1?auto=format&fit=crop&q=80&w=2000" 
          alt="Simba Supermarket Store" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
        <div className="relative z-20 container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter uppercase italic">
            Simba <span className="text-white/80">Supermarket</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold tracking-wide italic mb-8">
            {t('slogan', '"Unlimited Shopping At One Stop!"')}
          </p>
          <div className="h-1.5 w-32 bg-white/30 mx-auto rounded-full" />
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-block px-4 py-1.5 bg-[#F47A3E]/10 text-[#F47A3E] text-sm font-black uppercase tracking-widest rounded-full">
                {t('ourStory', 'Our Story')}
              </div>
              <h2 className="text-4xl font-black text-foreground leading-tight">
                {t('over50Years', 'Over 50 Years of Serving the Rwandan Market')}
              </h2>
              <p className="text-foreground leading-relaxed text-lg font-normal opacity-90">
                {t('storyPara1', 'Established as one of the oldest and most trusted supermarket chains in Rwanda, Simba Supermarket has been a cornerstone of the Kigali community for decades. Our journey began with a simple vision: to provide high-quality groceries and household items at affordable prices.')}
              </p>
              <p className="text-foreground leading-relaxed text-lg font-normal border-l-4 border-[#F47A3E] pl-4 opacity-90">
                {t('storyPara2', 'Today, with over 10 branches across Kigali and an expanding online platform, we continue to innovate while staying true to our core value: exceptional customer service.')}
              </p>
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200 dark:border-border">
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#F47A3E] mb-1">50+</p>
                  <p className="text-sm font-bold text-foreground uppercase tracking-widest">{t('yearsExperience', 'Years Experience')}</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#F47A3E] mb-1">10+</p>
                  <p className="text-sm font-bold text-foreground uppercase tracking-widest">{t('branchesCount', 'Branches')}</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-[#F47A3E] mb-1">1k+</p>
                  <p className="text-sm font-bold text-foreground uppercase tracking-widest">{t('dailyProducts', 'Daily Products')}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" alt="Fresh Veggies" className="rounded-2xl shadow-sm mt-8 object-cover" />
              <img src="https://images.unsplash.com/photo-1543168256-418811576931?auto=format&fit=crop&q=80&w=1200" alt="Store Aisle" className="rounded-2xl shadow-sm object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-gray-50 dark:bg-card border-t border-b border-gray-100 dark:border-border">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t('ourCoreValues', 'Our Core Values')}</h2>
            <p className="text-foreground opacity-90 font-normal">{t('whatMakesSimba', 'What makes Simba the king of the market.')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-muted/50 p-10 rounded-3xl shadow-sm border border-gray-200 dark:border-border hover:shadow-lg hover:border-[#F47A3E]/30 transition-all">
              <Award className="w-12 h-12 text-[#F47A3E] mb-6" />
              <h3 className="text-xl font-bold mb-4 text-foreground">{t('qualityFirst', 'Quality First')}</h3>
              <p className="text-foreground opacity-90 font-normal leading-relaxed">{t('qualityFirstDesc', 'We source only the freshest produce and highest quality household essentials for our customers.')}</p>
            </div>
            <div className="bg-white dark:bg-muted/50 p-10 rounded-3xl shadow-sm border border-gray-200 dark:border-border hover:shadow-lg hover:border-[#F47A3E]/30 transition-all">
              <Zap className="w-12 h-12 text-[#F47A3E] mb-6" />
              <h3 className="text-xl font-bold mb-4 text-foreground">{t('efficiency', 'Efficiency')}</h3>
              <p className="text-foreground opacity-90 font-normal leading-relaxed">{t('efficiencyDesc', 'With our online platform and fast delivery, we respect your time and provide a seamless shopping experience.')}</p>
            </div>
            <div className="bg-white dark:bg-muted/50 p-10 rounded-3xl shadow-sm border border-gray-200 dark:border-border hover:shadow-lg hover:border-[#F47A3E]/30 transition-all">
              <Heart className="w-12 h-12 text-[#F47A3E] mb-6" />
              <h3 className="text-xl font-bold mb-4 text-foreground">{t('community', 'Community')}</h3>
              <p className="text-foreground opacity-90 font-normal leading-relaxed">{t('communityDesc', 'Beyond being a store, we are part of the Kigali community, supporting local farmers and businesses.')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-black text-foreground mb-8 tracking-tighter">{t('readyToShop', 'READY TO START SHOPPING?')}</h2>
          <Link 
            to="/shop" 
            className="inline-flex items-center gap-3 bg-[#F47A3E] text-white px-10 py-5 rounded-full font-black text-lg shadow-xl shadow-[#F47A3E]/20 hover:scale-105 hover:bg-[#D46A2E] transition-transform active:scale-95 uppercase tracking-widest"
          >
            <ShoppingBag className="w-6 h-6" />
            {t('goToShop', 'Go to Shop')}
          </Link>
        </div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      </section>
    </div>
  );
}

