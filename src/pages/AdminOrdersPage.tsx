import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, orderBy, getDocs, onSnapshot, Timestamp, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTranslation } from 'react-i18next';
import { Loader2, Package, Clock, CheckCircle2, XCircle, ShieldCheck, Bell, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: OrderItem[];
  createdAt: Timestamp;
}

export default function AdminOrdersPage() {
  const { currentUser, isAdmin } = useAuth();
  const { t } = useTranslation();
  const { currency } = useCurrencyStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Pop-up notification state
  const [popups, setPopups] = useState<{ id: string; message: string; type: 'new_order' | 'status_change' }[]>([]);
  const prevOrderIds = useRef<Set<string>>(new Set());
  const prevStatuses = useRef<Record<string, string>>({});

  const addPopup = (message: string, type: 'new_order' | 'status_change') => {
    const id = Math.random().toString(36).slice(2);
    setPopups(p => [...p, { id, message, type }]);
    setTimeout(() => setPopups(p => p.filter(x => x.id !== id)), 5000);
  };

  useEffect(() => {
    if (!currentUser) return;
    if (!isAdmin) { navigate('/'); return; }

    // Real-time listener instead of one-time fetch
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const fetched: Order[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      setOrders(fetched);
      setLoading(false);

      // Detect new orders
      fetched.forEach(o => {
        if (!prevOrderIds.current.has(o.id) && prevOrderIds.current.size > 0) {
          addPopup(`🛎️ New order #${o.id.slice(0,8).toUpperCase()} — ${o.status}`, 'new_order');
        }
        // Detect status changes
        if (prevStatuses.current[o.id] && prevStatuses.current[o.id] !== o.status) {
          addPopup(`📦 Order #${o.id.slice(0,8).toUpperCase()} → ${o.status.toUpperCase()}`, 'status_change');
        }
      });
      prevOrderIds.current = new Set(fetched.map(o => o.id));
      prevStatuses.current = Object.fromEntries(fetched.map(o => [o.id, o.status]));
    }, (err) => {
      console.error('Admin orders listener error:', err);
      setLoading(false);
    });

    return () => unsub();
  }, [currentUser, isAdmin, navigate]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    setUpdating(orderId);
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      // Update local state smoothly
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Failed to update order status');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#F47A3E]" />
      </div>
    );
  }

  const getStatusDisplay = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-sm font-bold flex items-center gap-1 w-max"><Clock className="w-3 h-3" /> {t('statusPending', 'Pending')}</span>;
      case 'processing': return <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm font-bold flex items-center gap-1 w-max"><Loader2 className="w-3 h-3 animate-spin"/> {t('statusProcessing', 'Processing')}</span>;
      case 'completed': return <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-sm font-bold flex items-center gap-1 w-max"><CheckCircle2 className="w-3 h-3"/> {t('statusCompleted', 'Completed')}</span>;
      case 'cancelled': return <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-sm font-bold flex items-center gap-1 w-max"><XCircle className="w-3 h-3"/> {t('statusCancelled', 'Cancelled')}</span>;
      default: return null;
    }
  };

  return (
    <div className=" min-h-screen py-10 md:py-16 text-foreground">
      {/* Pop-up notifications — fixed top-right */}
      <div className="fixed top-20 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
        {popups.map(popup => (
          <div
            key={popup.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-bold animate-bounce-in max-w-xs ${
              popup.type === 'new_order' ? 'bg-green-600' : 'bg-blue-600'
            }`}
          >
            <Bell className="w-4 h-4 shrink-0" />
            <span className="flex-1">{popup.message}</span>
            <button
              onClick={() => setPopups(p => p.filter(x => x.id !== popup.id))}
              className="hover:opacity-70 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center gap-3 mb-8 bg-black dark:bg-card text-white p-6 rounded-2xl shadow-lg border border-gray-800">
          <ShieldCheck className="w-10 h-10 text-[#F47A3E]" />
          <div>
            <h1 className="text-2xl font-bold font-serif leading-tight">{t('adminDashboard', 'Admin Dashboard')}</h1>
            <p className="text-gray-700 dark:text-gray-300 text-sm">{t('manageOrders', 'Manage Master Orders')}</p>
          </div>
        </div>

        {orders.length === 0 ? (
           <div className="text-center py-20 bg-white dark:bg-card border dark:border-border rounded-2xl shadow-sm">
             <Package className="w-16 h-16 mx-auto text-muted-foreground opacity-20 mb-4" />
             <h2 className="text-xl font-bold mb-2">{t('noOrdersSystem', 'No orders in system')}</h2>
           </div>
        ) : (
          <div className="bg-white dark:bg-card border dark:border-border rounded-2xl shadow-sm overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 text-sm uppercase tracking-wider text-muted-foreground border-b dark:border-border font-bold">
                  <th className="p-4 rounded-tl-2xl">{t('orderId', 'Order ID')}</th>
                  <th className="p-4">{t('date', 'Date')}</th>
                  <th className="p-4">{t('branch', 'Branch')}</th>
                  <th className="p-4 text-right">{t('total', 'Total')}</th>
                  <th className="p-4">{t('currentStatus', 'Current Status')}</th>
                  <th className="p-4 rounded-tr-2xl text-right">{t('action', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-border text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-sm">{order.id}</td>
                    <td className="p-4 font-medium">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      }) : 'N/A'}
                    </td>
                    <td className="p-4 text-sm font-bold text-muted-foreground">{order.branchId}</td>
                    <td className="p-4 text-right font-bold text-primary">
                      {formatPrice(order.totalAmount, currency)}
                    </td>
                    <td className="p-4">{getStatusDisplay(order.status)}</td>
                    <td className="p-4 text-right">
                      {updating === order.id ? (
                        <span className="inline-block p-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></span>
                      ) : (
                        <select 
                          className="text-sm bg-muted border dark:border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary font-bold cursor-pointer"
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        >
                          <option value="pending">{t('statusPending', 'Pending')}</option>
                          <option value="processing">{t('statusProcessing', 'Processing')}</option>
                          <option value="completed">{t('statusCompleted', 'Completed')}</option>
                          <option value="cancelled">{t('statusCancelled', 'Cancelled')}</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

