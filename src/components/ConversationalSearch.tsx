'use client';
import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Loader2, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore, Product } from '../store/useCartStore';
import productsData from '../data/simba_products.json';
import { groqConversationalSearch } from '../lib/groq';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  products?: import('../store/useCartStore').Product[];
}

export default function ConversationalSearch() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: t('aiAssistantIntro') },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { addItem } = useCartStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);
    const result = await groqConversationalSearch(userText, i18n.language);
    setMessages(prev => [...prev, { role: 'assistant', text: result.message || t('aiAssistantIntro'), products: result.products }]);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-[#F47A3E] hover:bg-[#D46A2E] text-white rounded-full p-4 shadow-2xl flex items-center gap-2 transition-all hover:scale-105"
      >
        <Sparkles className="w-5 h-5" />
        <span className="font-bold text-sm hidden sm:inline">{t('aiSearch')}</span>
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden" style={{ height: '520px' }}>
          <div className="bg-[#F47A3E] text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <p className="font-bold text-sm">{t('simbaAIAssistant')}</p>
                <p className="text-orange-100 text-xs">{t('poweredByGroq')}</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-full transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-[#F47A3E] text-white rounded-2xl rounded-tr-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl rounded-tl-sm'} px-4 py-2.5`}>
                  <p className="text-sm">{msg.text}</p>
                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.products.map(p => (
                        <div key={p.id} className="bg-white dark:bg-gray-700 rounded-xl p-2 flex items-center gap-2">
                          <img src={p.image} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-600 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 dark:text-white line-clamp-1">{p.name}</p>
                            <p className="text-xs text-[#F47A3E] font-bold">{p.price.toLocaleString()} RWF</p>
                          </div>
                          <button onClick={() => addItem(p)} className="shrink-0 bg-[#F47A3E] text-white p-1.5 rounded-lg hover:bg-[#D46A2E] transition">
                            <ShoppingCart className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#F47A3E]" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('searching')}</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder={t('askMeAnything')}
                className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F47A3E] dark:text-white dark:placeholder-gray-400"
              />
              <button onClick={handleSend} disabled={!input.trim() || loading} className="bg-[#F47A3E] disabled:opacity-40 text-white p-2.5 rounded-xl hover:bg-[#D46A2E] transition">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {[
                t('suggestionMilk', 'Fresh milk?'),
                t('suggestionBreakfast', 'Breakfast items'),
                t('suggestionOil', 'Cooking oil'),
              ].map(s => (
                <button key={s} onClick={() => setInput(s)} className="text-xs bg-orange-50 dark:bg-orange-950/30 text-[#F47A3E] px-2 py-1 rounded-full hover:bg-orange-100 transition">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
