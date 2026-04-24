import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, MessageCircle, Globe, Facebook, Instagram, Twitter, Linkedin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const contacts = [
    {
      icon: <Phone className="w-5 h-5" />,
      title: t('callUs'),
      value: '+250 788 316 316',
      sub: t('callUsDesc'),
      href: 'tel:+250788316316',
    },
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: 'WhatsApp',
      value: '+250 788 316 316',
      sub: t('whatsappDesc'),
      href: 'https://wa.me/250788316316',
    },
    {
      icon: <Mail className="w-5 h-5" />,
      title: t('emailSupport'),
      value: 'orders@simba.rw',
      sub: t('emailSupportDesc'),
      href: 'mailto:orders@simba.rw',
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: t('officialWebsiteContact'),
      value: 'simbaonlineshopping.com',
      sub: t('visitNow'),
      href: 'https://www.simbaonlineshopping.com/',
    },
  ];

  const socials = [
    { icon: <Facebook className="w-5 h-5" />, href: 'https://www.facebook.com/simbasupermarket', label: 'Facebook', color: 'hover:bg-[#1877F2] hover:text-white' },
    { icon: <Instagram className="w-5 h-5" />, href: 'https://www.instagram.com/simba_supermarket/', label: 'Instagram', color: 'hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white' },
    { icon: <Twitter className="w-5 h-5" />, href: 'https://x.com/SimbaRwanda', label: 'Twitter (X)', color: 'hover:bg-black hover:text-white' },
    { icon: <Linkedin className="w-5 h-5" />, href: 'https://www.linkedin.com/company/simba-supermarket-ltd-rwanda/', label: 'LinkedIn', color: 'hover:bg-[#0077B5] hover:text-white' },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-3">{t('getInTouch')}</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
            {t('contactPreamble')}
          </p>
        </div>

        {/* Contact cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {contacts.map((c, i) => (
            <a key={i} href={c.href} target="_blank" rel="noopener noreferrer"
              className="card-premium p-6 flex flex-col items-center text-center gap-3 no-underline">
              <div className="icon-circle">
                {c.icon}
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900 dark:text-white">{c.title}</p>
                <p className="text-[#F47A3E] font-semibold text-sm mt-0.5">{c.value}</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-relaxed">{c.sub}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Message form + Social */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <div className="md:col-span-2 card-premium p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('sendMessage')}</h2>
            {sent ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">Message sent!</h3>
                <p className="text-gray-500 text-sm">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="mt-4 text-[#F47A3E] text-sm font-semibold hover:underline">Send another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Your name"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F47A3E] transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('emailAddress')}</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="your@email.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F47A3E] transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('subject')}</label>
                  <input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder={t('subjectPlaceholder')}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F47A3E] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">{t('message')}</label>
                  <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} required placeholder={t('messagePlaceholder')} rows={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#F47A3E] transition-all resize-none" />
                </div>
                <button type="submit" className="w-full bg-[#F47A3E] hover:bg-[#D46A2E] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> {t('sendMessageButton')}
                </button>
              </form>
            )}
          </div>

          {/* Social */}
          <div className="card-premium p-8 flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('ourSocialMedia')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{t('followSimba')}</p>
            <div className="space-y-3">
              {socials.map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 transition-all ${s.color} group`}>
                  <div className="icon-circle w-9 h-9 group-hover:bg-transparent transition-colors">
                    {s.icon}
                  </div>
                  <span className="font-semibold text-sm text-gray-800 dark:text-white">{s.label}</span>
                </a>
              ))}
            </div>
            <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">{t('mainBranch')}</p>
              <p className="text-sm font-semibold text-gray-800 dark:text-white mt-1">KN 4 Ave, Union Trade Center</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{t('openDaily')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
