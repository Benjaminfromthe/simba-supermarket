import type React from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MapPin, MessageCircle, Clock, Globe, Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation();

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6 text-primary" />,
      title: "Call Us",
      details: ["+250 788 316 316"],
      description: "Customer support available during store hours."
    },
    {
      icon: <MessageCircle className="w-6 h-6 text-primary" />,
      title: "WhatsApp",
      details: ["+250 788 316 316"],
      description: "Fastest way to get in touch for order updates.",
      link: "https://wa.me/250788316316"
    },
    {
      icon: <Mail className="w-6 h-6 text-primary" />,
      title: "Email Support",
      details: ["orders@simba.rw"],
      description: "For online shopping inquiries and feedback."
    },
    {
      icon: <Globe className="w-6 h-6 text-primary" />,
      title: "Official Website",
      details: ["www.simbaonlineshopping.com"],
      link: "https://www.simbaonlineshopping.com/"
    }
  ];

  return (
    <div className="bg-gray-50 dark:bg-background min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            {t('getInTouch')}
          </h1>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto font-medium">
            {t('contactPreamble', "Have questions about your order or our services? We're here to help you experience unlimited shopping at one stop.")}
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactInfo.map((info, idx) => (
            <div key={idx} className="bg-white dark:bg-card p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-border text-center flex flex-col items-center group hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-4 rounded-full mb-6 group-hover:scale-110 transition-transform">
                {info.icon}
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-900 dark:text-white">{t(info.title, info.title)}</h3>
              {info.details.map((detail, dIdx) => (
                <p key={dIdx} className="text-gray-900 dark:text-gray-200 font-bold mb-1">{detail}</p>
              ))}
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{t(info.description, info.description)}</p>
              {info.link && (
                <a href={info.link} target="_blank" rel="noopener noreferrer" className="mt-4 text-primary font-bold text-sm hover:underline">
                  {t('visitNow', 'Visit Now')}
                </a>
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form */}
          <div className="bg-white dark:bg-card p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-border">
            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t('sendMessage', 'Send us a Message')}</h2>
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('fullName')}</label>
                  <input type="text" className="w-full px-5 py-3 rounded-xl border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('emailAddress')}</label>
                  <input type="email" className="w-full px-5 py-3 rounded-xl border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition" placeholder="john@example.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('subject', 'Subject')}</label>
                <input type="text" className="w-full px-5 py-3 rounded-xl border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition" placeholder={t('subjectPlaceholder', 'How can we help?')} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">{t('message', 'Message')}</label>
                <textarea rows={5} className="w-full px-5 py-3 rounded-xl border-2 border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800 text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition" placeholder={t('messagePlaceholder', 'Your message here...')}></textarea>
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95">
                {t('sendMessageButton', 'Send Message')}
              </button>
            </form>
          </div>

          {/* Social & Location */}
          <div className="space-y-12">
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">{t('ourSocialMedia', 'Our Social Media')}</h2>
              <div className="grid grid-cols-2 gap-4">
                <a href="https://www.facebook.com/simbasupermarket" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-border hover:border-primary/50 transition-colors group">
                  <div className="bg-[#1877F2]/10 p-3 rounded-xl text-[#1877F2]">
                    <Facebook className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">Facebook</span>
                </a>
                <a href="https://www.instagram.com/simba_supermarket/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-border hover:border-primary/50 transition-colors group">
                  <div className="bg-[#E4405F]/10 p-3 rounded-xl text-[#E4405F]">
                    <Instagram className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">Instagram</span>
                </a>
                <a href="https://x.com/SimbaRwanda" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-border hover:border-primary/50 transition-colors group">
                  <div className="bg-black/10 dark:bg-white/10 p-3 rounded-xl text-black dark:text-white">
                    <Twitter className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">Twitter (X)</span>
                </a>
                <a href="https://www.linkedin.com/company/simba-supermarket-ltd-rwanda/posts/?feedView=all" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 bg-white dark:bg-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-border hover:border-primary/50 transition-colors group">
                  <div className="bg-[#0077B5]/10 p-3 rounded-xl text-[#0077B5]">
                    <Linkedin className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-gray-700 dark:text-gray-300">LinkedIn</span>
                </a>
              </div>
            </div>

            <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
              <div className="flex items-start gap-4 mb-6">
                <MapPin className="w-8 h-8 text-primary shrink-0" />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{t('mainBranch', 'Main Branch (UTC)')}</h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                    KN 4 Ave, Union Trade Center<br />
                    Kigali, Rwanda
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Clock className="w-6 h-6 text-primary" />
                <p className="font-bold text-gray-700 dark:text-gray-300">{t('openDaily', 'Open Daily: 7:00 AM - 10:00 PM')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
