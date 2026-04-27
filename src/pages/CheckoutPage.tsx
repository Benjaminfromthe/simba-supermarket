import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, MapPin, Clock, Phone, ChevronRight, Store, ArrowLeft, Star } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getLocalizedProductName } from '../lib/localize';
import { decrementStock } from '../lib/inventory';
import { getDepositAmount } from '../lib/noshow';
import branches from '../data/branches.json';
import PageTransition from '../components/PageTransition';
import { useCurrencyStore, formatPrice } from '../store/useCurrencyStore';

type Step = 'branch' | 'timeslot' | 'payment' | 'pending' | 'success';

const PICKUP_TIMES = [
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
  '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00',
  '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00',
  '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00',
];

// Generate next 3 days for the day picker
function getPickupDays() {
  const days = [];
  const now = new Date();
  const labels = ['Today', 'Tomorrow', ''];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    days.push({
      value: d.toISOString().split('T')[0],
      label: labels[i] || weekday,
      sub: i < 2 ? dateStr : `${weekday} ${dateStr}`,
    });
  }
  return days;
}
const PICKUP_DAYS = getPickupDays();

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { currentUser } = useAuth();
  const { currency } = useCurrencyStore();

  const [step, setStep] = useState<Step>('branch');
  const [selectedBranch, setSelectedBranch] = useState<typeof branches[0] | null>(null);
  const [selectedDay, setSelectedDay] = useState(PICKUP_DAYS[0].value);
  const [selectedTime, setSelectedTime] = useState('');
  const [momoPhone, setMomoPhone] = useState('');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [depositAmount, setDepositAmount] = useState(500);
  const [branchRatings, setBranchRatings] = useState<Record<string, { avg: number; count: number }>>({});

  // Scroll to top of page whenever step changes so user sees the new step title
  useEffect(() => {
    const header = document.querySelector('header');
    const headerH = header ? header.getBoundingClientRect().height : 80;
    window.scrollTo({ top: headerH, behavior: 'smooth' });
  }, [step]);

  useEffect(() => {
    if (!currentUser) navigate('/login', { state: { from: '/checkout' } });
  }, [currentUser, navigate]);

  useEffect(() => {
    if (currentUser) {
      getDepositAmount(currentUser.uid).then(setDepositAmount);
    }
  }, [currentUser]);

  // Fetch average ratings for all branches once
  useEffect(() => {
    async function fetchRatings() {
      try {
        const snap = await getDocs(collection(db, 'branchReviews'));
        const map: Record<string, number[]> = {};
        snap.docs.forEach(d => {
          const { branchId, rating } = d.data();
          if (!map[branchId]) map[branchId] = [];
          map[branchId].push(rating);
        });
        const result: Record<string, { avg: number; count: number }> = {};
        for (const [id, ratings] of Object.entries(map)) {
          result[id] = {
            avg: ratings.reduce((a, b) => a + b, 0) / ratings.length,
            count: ratings.length,
          };
        }
        setBranchRatings(result);
      } catch { /* silent — ratings are optional */ }
    }
    fetchRatings();
  }, []);

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-foreground">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4">{t('emptyCart')}</h2>
        <button onClick={() => navigate('/shop')} className="bg-[#F47A3E] text-white px-6 py-3 rounded-xl font-bold">
          {t('shopNow')}
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!selectedBranch || !selectedTime || !momoPhone || !currentUser) return;
    setIsProcessing(true);
    setStep('pending');
    try {
      // Create order in Firestore first
      const ref = await addDoc(collection(db, 'orders'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,
        pickupTime: selectedTime,
        momoPhone,
        momoProvider,
        depositAmount,
        totalAmount: getCartTotal() + depositAmount,
        status: 'pending',
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      const orderId = ref.id.slice(0, 8).toUpperCase();
      setOrderId(orderId);
      decrementStock(selectedBranch.id, items.map(i => ({ id: i.id, quantity: i.quantity })));

      // Trigger real MoMo USSD push (falls back to mock if API keys not set)
      try {
        const momoRes = await fetch('/api/momo-pay', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: momoPhone,
            amount: depositAmount,
            orderId: ref.id,
          }),
        });
        const momoData = await momoRes.json();

        if (momoData.success && !momoData.mock) {
          // Real USSD sent — poll for status
          let attempts = 0;
          const poll = setInterval(async () => {
            attempts++;
            try {
              const statusRes = await fetch(`/api/momo-status?referenceId=${momoData.referenceId}`);
              const statusData = await statusRes.json();
              if (statusData.status === 'SUCCESSFUL' || attempts >= 12) {
                clearInterval(poll);
                setIsProcessing(false);
                setStep('success');
                clearCart();
              } else if (statusData.status === 'FAILED') {
                clearInterval(poll);
                setIsProcessing(false);
                setStep('payment');
              }
            } catch { /* keep polling */ }
          }, 5000); // poll every 5s for up to 60s
          return;
        }
      } catch { /* API not available — use mock timing */ }

      // Mock flow (3s delay)
      setTimeout(() => {
        setIsProcessing(false);
        setStep('success');
        clearCart();
      }, 3000);

    } catch (err) {
      console.error(err);
      setIsProcessing(false);
      setStep('payment');
    }
  };

  if (step === 'success') {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-foreground max-w-lg">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-3xl font-black mb-2">{t('orderSuccess')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{t('thankYouShopping')}</p>
        <div className="bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-2xl p-5 text-left space-y-3 mb-8">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-[#F47A3E] shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('pickupBranch')}</p>
              <p className="font-bold dark:text-white">{selectedBranch?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#F47A3E] shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('pickupTime')}</p>
              <p className="font-bold dark:text-white">{selectedTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-[#F47A3E] shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('orderId')}</p>
              <p className="font-bold dark:text-white">#{orderId}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/orders')} className="flex-1 border-2 border-[#F47A3E] text-[#F47A3E] font-bold py-3 rounded-xl hover:bg-orange-50 transition">
            {t('myOrders')}
          </button>
          <button onClick={() => navigate('/')} className="flex-1 bg-[#F47A3E] text-white font-bold py-3 rounded-xl hover:opacity-90 transition">
            {t('continueShopping')}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'pending') {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-foreground max-w-md">
        <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Phone className="w-12 h-12 text-[#F47A3E]" />
        </div>
        <h2 className="text-2xl font-bold mb-2 dark:text-white">{t('checkYourPhoneTitle')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          {t('momoPromptSent', { amount: formatPrice(depositAmount, currency) })}
        </p>
        <p className="text-xl font-bold text-[#F47A3E] mb-6">{momoPhone}</p>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">{t('paymentPending')}</span>
        </div>
      </div>
    );
  }

  const stepIndex = ['branch', 'timeslot', 'payment'].indexOf(step);
  const progressLabels = [t('selectBranchStep'), t('pickupTime'), t('payment')];

  return (
    <PageTransition
      title={t('checkout')}
      subtitle={`${items.length} ${t('items', 'items')} · ${formatPrice(getCartTotal(), currency)}`}
      icon={<Store className="w-5 h-5" />}
    >
    <div className="bg-gray-50 min-h-screen py-8 text-foreground">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-2 mb-8">
          {progressLabels.map((label, i) => (
            <React.Fragment key={label}>
              <div className={`flex items-center gap-2 ${i <= stepIndex ? 'text-[#F47A3E]' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${i < stepIndex ? 'bg-[#F47A3E] border-[#F47A3E] text-white' : i === stepIndex ? 'border-[#F47A3E] text-[#F47A3E]' : 'border-gray-300 text-gray-400'}`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className="text-sm font-bold hidden sm:inline">{label}</span>
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 ${i < stepIndex ? 'bg-[#F47A3E]' : 'bg-gray-200 dark:bg-gray-700'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {step === 'branch' && (
              <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-1 dark:text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#F47A3E]" /> {t('selectBranch')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{t('choosePickupBranchHelp')}</p>
                <div className="space-y-3">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedBranch(branch)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedBranch?.id === branch.id ? 'border-[#F47A3E] bg-orange-50 dark:bg-orange-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedBranch?.id === branch.id ? 'border-[#F47A3E]' : 'border-gray-300'}`}>
                            {selectedBranch?.id === branch.id && <div className="w-2 h-2 rounded-full bg-[#F47A3E]" />}
                          </div>
                          <div>
                            <p className="font-bold dark:text-white">{branch.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {branch.locationNote}
                            </p>
                            {branchRatings[branch.id] && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-[#F47A3E] text-[#F47A3E]" />
                                <span className="text-xs font-bold text-[#F47A3E]">
                                  {branchRatings[branch.id].avg.toFixed(1)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  ({branchRatings[branch.id].count})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                pos => window.open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${branch.latitude},${branch.longitude}`, '_blank'),
                                () => window.open(branch.mapUrl, '_blank'),
                                { timeout: 5000 }
                              );
                            } else {
                              window.open(branch.mapUrl, '_blank');
                            }
                          }}
                          className="text-xs text-[#F47A3E] hover:underline font-bold"
                        >
                          {t('directions')}
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep('timeslot')}
                  disabled={!selectedBranch}
                  className="mt-6 w-full bg-[#F47A3E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  {t('continue')} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 'timeslot' && (
              <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
                <button onClick={() => setStep('branch')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#F47A3E] mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t('back')}
                </button>
                <h2 className="text-xl font-bold mb-1 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#F47A3E]" /> {t('pickupTime')}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {t('choosePickupTimeHelp')} <strong className="text-[#F47A3E]">{selectedBranch?.name}</strong>. {t('whenWillYouArrive')}
                </p>

                {/* Day selector */}
                <div className="flex gap-2 mb-5">
                  {PICKUP_DAYS.map(day => (
                    <button
                      key={day.value}
                      onClick={() => { setSelectedDay(day.value); setSelectedTime(''); }}
                      className={`flex-1 py-2.5 rounded-xl border-2 text-center transition-all ${selectedDay === day.value ? 'border-[#F47A3E] bg-orange-50 dark:bg-orange-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}`}
                    >
                      <p className={`text-sm font-black ${selectedDay === day.value ? 'text-[#F47A3E]' : 'dark:text-white'}`}>{day.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{day.sub}</p>
                    </button>
                  ))}
                </div>

                {/* Time grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PICKUP_TIMES.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(`${PICKUP_DAYS.find(d => d.value === selectedDay)?.label} ${time}`)}
                      className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${selectedTime === `${PICKUP_DAYS.find(d => d.value === selectedDay)?.label} ${time}` ? 'border-[#F47A3E] bg-orange-50 dark:bg-orange-950/30 text-[#F47A3E]' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:text-white'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setStep('payment')}
                  disabled={!selectedTime}
                  className="mt-6 w-full bg-[#F47A3E] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition"
                >
                  {t('continue')} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
                <button onClick={() => setStep('timeslot')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#F47A3E] mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> {t('back')}
                </button>
                <h2 className="text-xl font-bold mb-1 dark:text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#F47A3E]" /> {t('momoDeposit')}
                </h2>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                    {t('depositRequired')} {t('depositEnsuresPreparation')}
                    {depositAmount > 500 && <span className="block mt-1 text-red-600 dark:text-red-400 font-bold">{t('higherDepositWarning')}</span>}
                  </p>
                </div>

                <div className="flex gap-3 mb-5">
                  {(['mtn', 'airtel'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setMomoProvider(p)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${momoProvider === p ? 'border-[#F47A3E] bg-orange-50 dark:bg-orange-950/30 text-[#F47A3E]' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
                    >
                      {p === 'mtn' ? 'MTN MoMo' : 'Airtel Money'}
                    </button>
                  ))}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-bold mb-1 dark:text-gray-200">{t('momoPhone')}</label>
                  <input
                    type="tel"
                    value={momoPhone}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\s/g, '');
                      if (val.startsWith('078078') || val.startsWith('073073')) {
                        val = val.slice(3);
                      }
                      setMomoPhone(val);
                    }}
                    placeholder={momoProvider === 'mtn' ? '0781234567' : '0731234567'}
                    maxLength={10}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl p-3 font-mono text-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F47A3E]"
                  />
                  <p className="text-xs text-gray-400 mt-1">{t('enterTenDigitPhone')}</p>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || momoPhone.length < 9}
                  className="btn-glow btn-shimmer w-full disabled:opacity-40 disabled:cursor-not-allowed py-4 rounded-xl flex items-center justify-center gap-2 text-lg"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty('--x', `${e.clientX - rect.left}px`);
                    e.currentTarget.style.setProperty('--y', `${e.clientY - rect.top}px`);
                  }}
                >
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `${t('payDepositConfirm', { amount: formatPrice(depositAmount, currency) })}`}
                </button>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-5 shadow-sm h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4 border-b dark:border-border pb-3 dark:text-white">{t('orderSummary')}</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.image} alt={getLocalizedProductName(item)} className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium dark:text-white line-clamp-1">{getLocalizedProductName(item)}</p>
                    <p className="text-xs text-gray-400">x{item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-[#F47A3E] shrink-0">{formatPrice(item.price * item.quantity, currency)}</p>
                </div>
              ))}
            </div>
            <div className="border-t dark:border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>{t('subtotal')}</span><span>{formatPrice(getCartTotal(), currency)}</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>{t('depositLabel')}</span><span className="text-amber-600">+{formatPrice(depositAmount, currency)}</span>
              </div>
              <div className="flex justify-between font-bold text-base dark:text-white border-t dark:border-border pt-2">
                <span>{t('total')}</span>
                <span className="text-[#F47A3E]">{formatPrice(getCartTotal() + depositAmount, currency)}</span>
              </div>
            </div>
            {selectedBranch && (
              <div className="mt-3 pt-3 border-t dark:border-border text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p className="flex items-center gap-1"><Store className="w-3 h-3" /> {selectedBranch.name}</p>
                {selectedTime && <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selectedTime}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
}