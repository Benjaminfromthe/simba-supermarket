import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, Package, User, Store, Loader2, AlertTriangle, Flag } from 'lucide-react';
import branches from '../data/branches.json';
import { markOutOfStock, getLowStock } from '../lib/inventory';
import { flagNoShow } from '../lib/noshow';

const STAFF_MEMBERS = ['Alice K.', 'Bob M.', 'Claire U.', 'David N.', 'Eve R.'];

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  ready: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function BranchDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState(branches[0].id);
  const [activeTab, setActiveTab] = useState<'pending' | 'preparing' | 'ready' | 'all'>('pending');

  useEffect(() => {
    if (!currentUser) { navigate('/login'); return; }
  }, [currentUser, navigate]);

  useEffect(() => {
    const q = query(
      collection(db, 'orders'),
      where('branchId', '==', selectedBranchId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [selectedBranchId]);

  const updateOrder = async (orderId: string, data: Record<string, any>) => {
    await updateDoc(doc(db, 'orders', orderId), { ...data, updatedAt: new Date() });
  };

  const filtered = orders.filter(o => activeTab === 'all' ? true : o.status === activeTab);

  const counts = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length,
    ready: orders.filter(o => o.status === 'ready').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark: text-foreground">
      <div className="bg-[#F47A3E] text-white py-4 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">Branch Dashboard</h1>
              <p className="text-orange-100 text-xs">Order Management</p>
            </div>
          </div>
          <select
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            className="bg-white/20 border border-white/30 text-white rounded-lg px-3 py-1.5 text-sm font-bold focus:outline-none"
          >
            {branches.map(b => <option key={b.id} value={b.id} className="text-gray-900">{b.name}</option>)}
          </select>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Pending', count: counts.pending, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
            { label: 'Preparing', count: counts.preparing, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Ready', count: counts.ready, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
              <p className={`text-3xl font-black ${s.color}`}>{s.count}</p>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {(['pending', 'preparing', 'ready', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[#F47A3E] text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && counts[tab as keyof typeof counts] > 0 && (
                <span className="ml-1.5 bg-white/30 text-xs px-1.5 py-0.5 rounded-full">{counts[tab as keyof typeof counts]}</span>
              )}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#F47A3E]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold">No orders in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <div key={order.id} className="bg-white dark:bg-card border dark:border-border rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> Pick-up: {order.pickupTime || 'Not set'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {order.userEmail}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                    {order.status?.toUpperCase()}
                  </span>
                </div>

                {/* Items */}
                <div className="flex gap-2 mb-3 flex-wrap">
                  {order.items?.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1">
                      <img src={item.image} alt={item.name} className="w-6 h-6 object-contain" />
                      <span className="text-xs dark:text-white line-clamp-1 max-w-[80px]">{item.name}</span>
                      <span className="text-xs text-gray-400">×{item.quantity}</span>
                    </div>
                  ))}
                  {order.items?.length > 4 && <span className="text-xs text-gray-400 self-center">+{order.items.length - 4} more</span>}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-bold text-[#F47A3E]">{order.totalAmount?.toLocaleString()} RWF</span>

                  {/* Assign to staff */}
                  {(order.status === 'pending' || order.status === 'accepted') && (
                    <div className="flex items-center gap-2 flex-1">
                      <select
                        defaultValue={order.assignedTo || ''}
                        onChange={e => updateOrder(order.id, { assignedTo: e.target.value, status: 'preparing' })}
                        className="flex-1 text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F47A3E]"
                      >
                        <option value="">Assign to staff...</option>
                        {STAFF_MEMBERS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => updateOrder(order.id, { status: 'ready' })}
                      className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark Ready
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrder(order.id, { status: 'completed' })}
                      className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </button>
                  )}

                  {/* Flag no-show — only on completed orders */}
                  {order.status === 'completed' && order.userId && !order.flagged && (
                    <button
                      onClick={async () => {
                        await flagNoShow(order.userId, order.id);
                        await updateOrder(order.id, { flagged: true });
                      }}
                      className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      title="Flag customer as no-show"
                    >
                      <Flag className="w-3 h-3" /> No-Show
                    </button>
                  )}
                  {order.flagged && (
                    <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                      <Flag className="w-3 h-3" /> Flagged
                    </span>
                  )}

                  {order.assignedTo && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <User className="w-3 h-3" /> {order.assignedTo}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

