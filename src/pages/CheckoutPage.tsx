import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Loader2, MapPin, Clock, Phone, ChevronRight, Store, ArrowLeft } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getLocalizedProductName } from '../lib/localize';
import { decrementStock } from '../lib/inventory';
import { getDepositAmount } from '../lib/noshow';
import branches from '../data/branches.json';

type Step = 'branch' | 'timeslot' | 'payment' | 'pending' | 'success';

const PICKUP_TIMES = [
  '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00',
  '11:00 - 12:00', '12:00 - 13:00', '13:00 - 14:00',
  '14:00 - 15:00', '15:00 - 16:00', '16:00 - 17:00',
  '17:00 - 18:00', '18:00 - 19:00', '19:00 - 20:00',
];

const DEPOSIT_AMOUNT = 500;

export default function CheckoutPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { currentUser } = useAuth();

  const [step, setStep] = useState<Step>('branch');
  const [selectedBranch, setSelectedBranch] = useState<typeof branches[0] | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [momoPhone, setMomoPhone] = useState('078');
  const [momoProvider, setMomoProvider] = useState<'mtn' | 'airtel'>('mtn');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [depositAmount, setDepositAmount] = useState(500);

  useEffect(() => {
    if (!currentUser) navigate('/login');
  }, [currentUser, navigate]);

  // Load dynamic deposit based on no-show history
  useEffect(() => {
    if (currentUser) {
      getDepositAmount(currentUser.uid).then(setDepositAmount);
    }
  }, [currentUser]);

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
      const ref = await addDoc(collection(db, 'orders'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        branchId: selectedBranch.id,
        branchName: selectedBranch.name,
        pickupTime: selectedTime,
        momoPhone,
        momoProvider,
        depositAmount: depositAmount,
        totalAmount: getCartTotal(),
        status: 'pending',
        items: items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setOrderId(ref.id.slice(0, 8).toUpperCase());
      // Decrement stock at selected branch
      decrementStock(selectedBranch.id, items.map(i => ({ id: i.id, quantity: i.quantity })));
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

  // Step: Success
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
              <p className="text-xs text-gray-500 dark:text-gray-400">Pick-up Branch</p>
              <p className="font-bold dark:text-white">{selectedBranch?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-[#F47A3E] shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Pick-up Time</p>
              <p className="font-bold dark:text-white">{selectedTime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-[#F47A3E] shrink-0" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Order ID</p>
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

  // Step: Pending (MoMo processing)
  if (step === 'pending') {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-foreground max-w-md">
        <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Phone className="w-12 h-12 text-[#F47A3E]" />
        </div>
        <h2 className="text-2xl font-bold mb-2 dark:text-white">Check your phone</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          A MoMo prompt for <strong className="text-[#F47A3E]">{DEPOSIT_AMOUNT.toLocaleString()} RWF</strong> deposit has been sent to
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

  return (
    <div className="bg-gray-50 dark: min-h-screen py-8 text-foreground">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {['Select Branch', 'Pick-up Time', 'Payment'].map((label, i) => (
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

            {/* STEP 1: Branch Selection */}
            {step === 'branch' && (
              <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-1 dark:text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-[#F47A3E]" /> Select Pick-up Branch
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">Choose the Simba branch you'll pick up from</p>
                <div className="space-y-3">
                  {branches.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => setSelectedBranch(branch)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedBranch?.id === branch.id ? 'border-[#F47A3E] bg-orange-50 dark:bg-orange-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedBranch?.id === branch.id ? 'border-[#F47A3E]' : 'border-gray-300'}`}>
                            {selectedBranch?.id === branch.id && <div className="w-2 h-2 rounded-full bg-[#F47A3E]" />}
                          </div>
                          <div>
                            <p className="font-bold dark:text-white">{branch.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {branch.locationNote}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation();
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                pos => window.open(`https://www.google.com/maps/dir/${pos.coords.latitude},${pos.coords.longitude}/${branch.latitude},${branch.longitude}`, '_blank'),
                                () => window.open(branch.mapUrl, '_blank'),
                                { timeout: 5000 }
                              );
                            } else window.open(branch.mapUrl, '_blank');
                          }}
                          className="text-xs text-[#F47A3E] hover:underline font-bold"
                        >
                          Directions
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
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 2: Time Slot */}
            {step === 'timeslot' && (
              <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
                <button onClick={() => setStep('branch')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#F47A3E] mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="text-xl font-bold mb-1 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#F47A3E]" /> Choose Pick-up Time
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                  At <strong className="text-[#F47A3E]">{selectedBranch?.name}</strong> — when will you arrive?
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {PICKUP_TIMES.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${selectedTime === time ? 'border-[#F47A3E] bg-orange-50 dark:bg-orange-950/30 text-[#F47A3E]' : 'border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:text-white'}`}
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
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* STEP 3: MoMo Deposit Payment */}
            {step === 'payment' && (
              <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
                <button onClick={() => setStep('timeslot')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#F47A3E] mb-4 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <h2 className="text-xl font-bold mb-1 dark:text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#F47A3E]" /> MoMo Deposit
                </h2>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-5">
                  <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                    ⚠️ A <strong>{DEPOSIT_AMOUNT.toLocaleString()} RWF</strong> non-refundable deposit is required to confirm your pick-up order. This ensures your order is prepared on time.
                  </p>
                </div>

                {/* Provider */}
                <div className="flex gap-3 mb-5">
                  {(['mtn', 'airtel'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setMomoProvider(p)}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${momoProvider === p ? 'border-[#F47A3E] bg-orange-50 dark:bg-orange-950/30 text-[#F47A3E]' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400'}`}
                    >
                      {p === 'mtn' ? '🟡 MTN MoMo' : '🔴 Airtel Money'}
                    </button>
                  ))}
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-bold mb-1 dark:text-gray-200">{t('momoPhone')}</label>
                  <input
                    type="tel"
                    value={momoPhone}
                    onChange={(e) => setMomoPhone(e.target.value)}
                    placeholder={momoProvider === 'mtn' ? '078 XXX XXXX' : '073 XXX XXXX'}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl p-3 font-mono text-lg bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F47A3E]"
                  />
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
                  {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay ${DEPOSIT_AMOUNT.toLocaleString()} RWF Deposit & Confirm`}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-5 shadow-sm h-fit sticky top-24">
            <h3 className="font-bold text-lg mb-4 border-b dark:border-border pb-3 dark:text-white">{t('orderSummary')}</h3>
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <img src={item.image} alt={getLocalizedProductName(item)} className="w-10 h-10 object-contain rounded-lg bg-gray-50 dark:bg-gray-700 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium dark:text-white line-clamp-1">{getLocalizedProductName(item)}</p>
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold text-[#F47A3E] shrink-0">{(item.price * item.quantity).toLocaleString()} RWF</p>
                </div>
              ))}
            </div>
            <div className="border-t dark:border-border pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Subtotal</span><span>{getCartTotal().toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between text-gray-500 dark:text-gray-400">
                <span>Deposit</span><span className="text-amber-600">{DEPOSIT_AMOUNT.toLocaleString()} RWF</span>
              </div>
              <div className="flex justify-between font-bold text-base dark:text-white border-t dark:border-border pt-2">
                <span>{t('total')}</span>
                <span className="text-[#F47A3E]">{getCartTotal().toLocaleString()} RWF</span>
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
  );
}

