import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot, Timestamp, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTranslation } from 'react-i18next';
import { Loader2, Package, Clock, CheckCircle2, XCircle, Bell, MapPin, Store, Star, MessageCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { useCurrencyStore, formatPrice } from '../store/useCurrencyStore';

interface OrderItem {
  id: string | number;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userId: string;
  branchId: string;
  branchName?: string;
  pickupTime?: string;
  totalAmount: number;
  depositAmount?: number;
  status: string;
  items: OrderItem[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

const STATUS_STYLE: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
  pending:   { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20',  icon: <Clock className="w-4 h-4" /> },
  accepted:  { color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20',     icon: <CheckCircle2 className="w-4 h-4" /> },
  preparing: { color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', icon: <Loader2 className="w-4 h-4 animate-spin" /> },
  ready:     { color: 'text-green-700',  bg: 'bg-green-50 dark:bg-green-900/20',   icon: <Bell className="w-4 h-4" /> },
  completed: { color: 'text-gray-600',   bg: 'bg-gray-50 dark:bg-gray-800',        icon: <CheckCircle2 className="w-4 h-4" /> },
  cancelled: { color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20',       icon: <XCircle className="w-4 h-4" /> },
};

export default function OrdersPage() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const { currency } = useCurrencyStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [readyOrders, setReadyOrders] = useState<Order[]>([]);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [messagingOrder, setMessagingOrder] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleCancel = async (orderId: string) => {
    setCancelling(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        updatedAt: serverTimestamp(),
      });
    } catch (e) { console.error(e); }
    setCancelling(null);
  };

  const handleSendMessage = async (orderId: string) => {
    if (!messageText.trim() || !currentUser) return;
    setSendingMessage(true);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        customerNote: messageText.trim(),
        customerNoteAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setMessageText('');
      setMessagingOrder(null);
    } catch (e) { console.error(e); }
    setSendingMessage(false);
  };

  // Real-time listener — updates instantly when branch marks order ready
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'orders'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(fetched);
      setReadyOrders(fetched.filter(o => o.status === 'ready'));
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });
    return unsub;
  }, [currentUser]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#F47A3E]" />
      </div>
    );
  }

  const getStatus = (status: string) => {
    const cfg = STATUS_STYLE[status] || STATUS_STYLE.pending;
    const labelKey: Record<string, string> = {
      pending:   'statusPending',
      accepted:  'statusAccepted',
      preparing: 'statusPreparing',
      ready:     'statusReady',
      completed: 'statusCompleted',
      cancelled: 'statusCancelled',
    };
    return (
      <div className={`flex items-center gap-1.5 ${cfg.color} ${cfg.bg} px-3 py-1 rounded-full text-sm font-bold`}>
        {cfg.icon} {status === 'ready' ? `🎉 ${t(labelKey[status] || status)}` : t(labelKey[status] || status)}
      </div>
    );
  };

  return (
    <PageTransition
      title={t('orderHistory')}
      subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''}`}
      icon={<Package className="w-5 h-5" />}
    >
    <div className="min-h-screen py-10 text-foreground">
      <div className="container mx-auto px-4 max-w-4xl">

        {/* READY FOR PICK-UP BANNER */}
        {readyOrders.length > 0 && (
          <div className="mb-6 space-y-3">
            {readyOrders.map(order => (
              <div key={order.id} className="bg-green-500 text-white rounded-2xl p-4 flex items-center gap-4 shadow-lg animate-pulse">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-lg">🎉 {t('statusReady')}</p>
                  <p className="text-green-100 text-sm">
                    {t('branch')}: <strong>{order.branchName || order.branchId}</strong>
                    {order.pickupTime && ` — ${t('pickupTime')}: ${order.pickupTime}`}
                  </p>
                  <p className="text-green-100 text-xs mt-0.5">{t('orderId')} #{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <MapPin className="w-6 h-6 shrink-0 opacity-70" />
              </div>
            ))}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm">
            <Package className="w-14 h-14 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-bold mb-2 dark:text-white">{t('noOrdersFound')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{t('noOrdersText')}</p>
            <Link to="/shop" className="bg-[#F47A3E] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#D46A2E] transition-colors inline-block">
              {t('startShopping')}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className={`bg-white dark:bg-[#1E293B] border rounded-2xl p-5 shadow-sm transition-all ${order.status === 'ready' ? 'border-green-400 dark:border-green-600 shadow-green-100 dark:shadow-green-900/20' : 'border-gray-100 dark:border-gray-700'}`}>
                {/* Order header */}
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('orderId')}</p>
                    <p className="font-mono text-sm font-bold dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  {order.branchName && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('branch')}</p>
                      <p className="text-sm font-bold dark:text-white flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-[#F47A3E]" /> {order.branchName}
                      </p>
                    </div>
                  )}
                  {order.pickupTime && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('pickupTime')}</p>
                      <p className="text-sm font-bold dark:text-white flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#F47A3E]" /> {order.pickupTime}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('status')}</p>
                    {getStatus(order.status)}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{t('total')}</p>
                    <p className="text-lg font-black text-[#F47A3E]">{formatPrice(order.totalAmount, currency)}</p>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 p-2.5 rounded-xl">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-contain bg-white dark:bg-gray-700 shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold dark:text-white line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-400">×{item.quantity} — {formatPrice(item.price, currency)} each</p>
                      </div>
                      <p className="text-sm font-bold text-[#F47A3E] shrink-0">{formatPrice(item.price * item.quantity, currency)}</p>
                    </div>
                  ))}
                </div>

                {/* Date + Actions */}
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <p className="text-xs text-gray-400">
                    {order.createdAt?.toDate?.()?.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) || ''}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {/* Cancel — only on pending orders */}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        disabled={cancelling === order.id}
                        className="flex items-center gap-1 text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {cancelling === order.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <XCircle className="w-3 h-3" />}
                        {t('cancelOrder', 'Cancel Order')}
                      </button>
                    )}
                    {/* Message branch — on active orders */}
                    {['pending','accepted','preparing'].includes(order.status) && (
                      <button
                        onClick={() => setMessagingOrder(messagingOrder === order.id ? null : order.id)}
                        className="flex items-center gap-1 text-xs font-bold text-blue-500 border border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <MessageCircle className="w-3 h-3" />
                        {t('messagesBranch', 'Message Branch')}
                      </button>
                    )}
                    {/* Review prompt — only on completed orders */}
                    {order.status === 'completed' && (
                      <Link
                        to="/reviews"
                        className="flex items-center gap-1 text-xs font-bold text-[#F47A3E] border border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Star className="w-3 h-3 fill-[#F47A3E]" />
                        {t('rateExperience', 'Rate your experience')}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Existing customer note */}
                {(order as any).customerNote && (
                  <div className="mt-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl px-3 py-2 flex items-start gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400">{t('yourNote', 'Your note to branch:')}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{(order as any).customerNote}</p>
                    </div>
                  </div>
                )}

                {/* Message input — shown when messaging */}
                {messagingOrder === order.id && (
                  <div className="mt-3 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-2">
                      💬 {t('sendNoteToStaff', 'Send a note to branch staff:')}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={e => setMessageText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage(order.id)}
                        placeholder={t('noteExamples', 'e.g. Please add 2 more breads, or cancel the shovel')}
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F47A3E]"
                      />
                      <button
                        onClick={() => handleSendMessage(order.id)}
                        disabled={!messageText.trim() || sendingMessage}
                        className="bg-[#F47A3E] disabled:opacity-40 text-white px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                      >
                        {sendingMessage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[
                        t('quickNote1', 'Please cancel the order'),
                        t('quickNote2', 'Add 2 more of the same'),
                        t('quickNote3', "I'll be 30 min late"),
                      ].map(q => (
                        <button key={q} onClick={() => setMessageText(q)}
                          className="text-[10px] bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full hover:border-[#F47A3E] hover:text-[#F47A3E] transition-colors">
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                    {/* Review prompt — only on completed orders */}
                    {order.status === 'completed' && (
                      <Link
                        to="/reviews"
                        className="flex items-center gap-1 text-xs font-bold text-[#F47A3E] border border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        <Star className="w-3 h-3 fill-[#F47A3E]" />
                        {t('rateExperience', 'Rate your experience')}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  );
}
