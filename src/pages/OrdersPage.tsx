import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useTranslation } from 'react-i18next';
import { Loader2, Package, Clock, CheckCircle2, XCircle } from 'lucide-react';

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

export default function OrdersPage() {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!currentUser) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders: Order[] = [];
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        setOrders(fetchedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-32 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#F47A3E]" />
      </div>
    );
  }

  const getStatusDisplay = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <div className="flex items-center gap-1.5 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-1 rounded-full text-sm font-bold"><Clock className="w-4 h-4" /> {t('statusPending', 'Pending')}</div>;
      case 'processing':
        return <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full text-sm font-bold"><Loader2 className="w-4 h-4 animate-spin" /> {t('statusProcessing', 'Processing')}</div>;
      case 'completed':
        return <div className="flex items-center gap-1.5 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full text-sm font-bold"><CheckCircle2 className="w-4 h-4" /> {t('statusCompleted', 'Completed')}</div>;
      case 'cancelled':
        return <div className="flex items-center gap-1.5 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1 rounded-full text-sm font-bold"><XCircle className="w-4 h-4" /> {t('statusCancelled', 'Cancelled')}</div>;
      default:
        return null;
    }
  };

  return (
    <div className=" min-h-screen py-10 md:py-16 text-foreground">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-3 mb-8">
          <Package className="w-8 h-8 text-[#F47A3E]" />
          <h1 className="text-3xl font-bold font-serif">{t('orderHistory', 'Order History')}</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-card border dark:border-border rounded-2xl shadow-sm">
            <Package className="w-16 h-16 mx-auto text-muted-foreground opacity-20 mb-4" />
            <h2 className="text-xl font-bold mb-2">{t('noOrdersFound', 'No orders found')}</h2>
            <p className="text-muted-foreground mb-6">{t('noOrdersText', "You haven't placed any orders yet.")}</p>
            <a href="/shop" className="bg-[#F47A3E] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#D46A2E] transition-colors inline-block">
              {t('startShopping', 'Start Shopping')}
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white dark:bg-card border dark:border-border rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-border pb-4 mb-4">
                  <div>
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t('orderId', 'Order ID')}
                    </span>
                    <span className="font-mono text-sm">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t('date', 'Date')}
                    </span>
                    <span className="text-sm font-medium">
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t('status', 'Status')}
                    </span>
                    {getStatusDisplay(order.status)}
                  </div>
                  <div className="md:text-right">
                    <span className="text-sm font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                      {t('total', 'Total')}
                    </span>
                    <span className="text-lg font-bold text-primary">
                      {t('priceRwf', { price: order.totalAmount.toLocaleString() })}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{t('items', 'Items')}</h3>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-muted/30 p-3 rounded-xl border dark:border-border/50">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover border dark:border-border" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                          <Package className="w-5 h-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm line-clamp-1">{item.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {t('qty', 'Qty')}: <span className="font-bold">{item.quantity}</span> &times; {t('priceRwf', { price: item.price.toLocaleString() })}
                        </p>
                      </div>
                      <div className="font-bold text-sm">
                        {t('priceRwf', { price: (item.price * item.quantity).toLocaleString() })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

