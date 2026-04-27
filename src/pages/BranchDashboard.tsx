import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Clock, CheckCircle2, Package, User, Store, Loader2, Flag, Boxes, AlertTriangle, Bell, X } from 'lucide-react';
import branches from '../data/branches.json';
import productsData from '../data/simba_products.json';
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

type DashboardRole = 'manager' | 'staff';
type DashboardTab = 'pending' | 'preparing' | 'ready' | 'all';

interface InventoryAlert {
  productId: string;
  stock: number;
}

const productList = (Array.isArray(productsData) ? productsData : (productsData as any).products || []) as Array<{ id: string | number; name: string }>;
const productNameById = new Map(productList.map(product => [String(product.id), product.name]));

export default function BranchDashboard() {
  const { t } = useTranslation();
  const { currentUser, userProfile, isAdmin, isManager, isStaff, isBranchOperator } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBranchId, setSelectedBranchId] = useState(userProfile?.branchId || branches[0].id);
  const [activeTab, setActiveTab] = useState<DashboardTab>('pending');
  const [dashboardRole, setDashboardRole] = useState<DashboardRole>(isStaff ? 'staff' : 'manager');
  const [selectedStaff, setSelectedStaff] = useState(userProfile?.staffName || STAFF_MEMBERS[0]);
  const [lowStock, setLowStock] = useState<InventoryAlert[]>([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const branchLocked = !!userProfile?.branchId;

  // New-order alert state
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const prevPendingCount = useRef<number | null>(null);

  // Beep using Web Audio API — no external files needed
  const playBeep = useCallback(() => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch { /* browser may block audio before user interaction — silent fail */ }
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!isBranchOperator) {
      navigate('/');
    }
  }, [currentUser, isBranchOperator, navigate]);

  useEffect(() => {
    if (userProfile?.branchId) setSelectedBranchId(userProfile.branchId);
    if (userProfile?.staffName) setSelectedStaff(userProfile.staffName);
    if (!isAdmin) setDashboardRole(isStaff ? 'staff' : 'manager');
  }, [isAdmin, isStaff, userProfile]);

  useEffect(() => {
    // Reset alert tracking when branch changes
    prevPendingCount.current = null;
    setNewOrderAlert(false);

    const q = query(
      collection(db, 'orders'),
      where('branchId', '==', selectedBranchId),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(fetched);
      setLoading(false);

      // Count pending orders and alert if new ones arrived
      const pendingNow = fetched.filter(o => o.status === 'pending').length;
      if (prevPendingCount.current !== null && pendingNow > prevPendingCount.current) {
        const diff = pendingNow - prevPendingCount.current;
        setNewOrderCount(diff);
        setNewOrderAlert(true);
        playBeep();
      }
      prevPendingCount.current = pendingNow;
    });
    return unsub;
  }, [selectedBranchId, playBeep]);

  useEffect(() => {
    const loadLowStock = async () => {
      setLoadingInventory(true);
      const records = await getLowStock(selectedBranchId);
      setLowStock(records);
      setLoadingInventory(false);
    };
    loadLowStock();
  }, [selectedBranchId, orders.length]);

  const updateOrder = async (orderId: string, data: Record<string, any>) => {
    await updateDoc(doc(db, 'orders', orderId), { ...data, updatedAt: new Date() });
  };

  const counts = {
    pending: orders.filter(o => o.status === 'pending').length,
    preparing: orders.filter(o => o.status === 'preparing' || o.status === 'accepted').length,
    ready: orders.filter(o => o.status === 'ready').length,
  };

  const visibleOrders = useMemo(() => {
    const roleFiltered = dashboardRole === 'manager'
      ? orders
      : orders.filter(order => order.assignedTo === selectedStaff || (order.status === 'pending' && !order.assignedTo));

    return roleFiltered.filter(order => {
      if (activeTab === 'all') return true;
      if (activeTab === 'preparing') return order.status === 'preparing' || order.status === 'accepted';
      return order.status === activeTab;
    });
  }, [activeTab, dashboardRole, orders, selectedStaff]);

  const markItemUnavailable = async (productId: string | number) => {
    await markOutOfStock(selectedBranchId, productId);
    const records = await getLowStock(selectedBranchId);
    setLowStock(records);
  };

  const tabs: DashboardTab[] = ['pending', 'preparing', 'ready', 'all'];

  return (
    <div className="min-h-screen bg-gray-50 text-foreground">
      <div className="bg-[#F47A3E] text-white py-4 px-4">
        <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">          <div className="flex items-center gap-3">
            <Store className="w-6 h-6" />
            <div>
              <h1 className="font-bold text-lg">{t('branchPortal')}</h1>
              <p className="text-orange-100 text-xs">{t('orderManagement')}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={selectedBranchId}
              onChange={e => setSelectedBranchId(e.target.value)}
              disabled={branchLocked}
              className="bg-white/20 border border-white/30 text-white rounded-lg px-3 py-2 text-sm font-bold focus:outline-none"
            >
              {branches.map(b => <option key={b.id} value={b.id} className="text-gray-900">{b.name}</option>)}
            </select>
            {isAdmin ? (
              <div className="flex rounded-xl overflow-hidden border border-white/30">
                <button
                  onClick={() => setDashboardRole('manager')}
                  className={`px-4 py-2 text-sm font-bold ${dashboardRole === 'manager' ? 'bg-white text-[#F47A3E]' : 'bg-white/10 text-white'}`}
                >
                  {t('managerView')}
                </button>
                <button
                  onClick={() => setDashboardRole('staff')}
                  className={`px-4 py-2 text-sm font-bold ${dashboardRole === 'staff' ? 'bg-white text-[#F47A3E]' : 'bg-white/10 text-white'}`}
                >
                  {t('staffView')}
                </button>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-xl bg-white/15 text-sm font-bold">
                {dashboardRole === 'manager' ? t('managerView') : t('staffView')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── NEW ORDER ALERT BANNER ── */}
      {newOrderAlert && (
        <div className="bg-green-500 text-white px-4 py-3 flex items-center gap-3 shadow-lg animate-pulse">
          <div className="container mx-auto flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-black text-sm">
                🛎️ {newOrderCount} {t('newOrderAlert', newOrderCount === 1 ? 'new order arrived!' : 'new orders arrived!')}
              </p>
              <p className="text-green-100 text-xs">{t('checkPendingTab', 'Check the Pending tab to assign and prepare.')}</p>
            </div>
            <button
              onClick={() => { setNewOrderAlert(false); setActiveTab('pending'); }}
              className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition shrink-0"
            >
              {t('viewOrders', 'View Orders')} →
            </button>
            <button onClick={() => setNewOrderAlert(false)} className="p-1 hover:bg-white/20 rounded-full transition shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
          <div className="space-y-6">
            <div className="bg-white dark:bg-card rounded-2xl p-5 shadow-sm border dark:border-border">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">{t('workflowPreview')}</p>
                  <h2 className="text-xl font-black dark:text-white">{dashboardRole === 'manager' ? t('managerView') : t('staffView')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {dashboardRole === 'manager' ? t('managerWorkflowDescription') : t('staffWorkflowDescription')}
                  </p>
                </div>
                {dashboardRole === 'staff' && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">{t('staffMember')}</span>
                    <select
                      value={selectedStaff}
                      onChange={e => setSelectedStaff(e.target.value)}
                      disabled={!isAdmin}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm font-semibold bg-white dark:bg-gray-900"
                    >
                      {STAFF_MEMBERS.map(member => <option key={member} value={member}>{member}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: t('pending'), count: counts.pending, color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
                { label: t('preparing'), count: counts.preparing, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { label: t('ready'), count: counts.ready, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
              ].map(card => (
                <div key={card.label} className={`${card.bg} rounded-2xl p-4 text-center`}>
                  <p className={`text-3xl font-black ${card.color}`}>{card.count}</p>
                  <p className="text-xs font-bold text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-[#F47A3E] text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}
                >
                  {tab === 'all' ? t('viewAll') : t(tab)}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#F47A3E]" />
              </div>
            ) : visibleOrders.length === 0 ? (
              <div className="text-center py-20 text-gray-400 bg-white dark:bg-card rounded-2xl border dark:border-border">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-bold">{t('noOrdersInCategory')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {visibleOrders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-card border dark:border-border rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-3">
                      <div>
                        <p className="font-bold dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {t('pickupTime')}: {order.pickupTime || t('notAssignedYet')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3" /> {order.userEmail}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {t('assignedTo')}: <span className="font-semibold">{order.assignedTo || t('notAssignedYet')}</span>
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                        {order.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex gap-2 mb-4 flex-wrap">
                      {order.items?.slice(0, 4).map((item: any) => (
                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-2 py-1.5">
                          <img src={item.image} alt={item.name} className="w-6 h-6 object-contain" />
                          <div>
                            <span className="text-xs dark:text-white line-clamp-1 max-w-[100px] block">{item.name}</span>
                            <span className="text-[11px] text-gray-400">x{item.quantity}</span>
                          </div>
                          <button
                            onClick={() => markItemUnavailable(item.id)}
                            className="text-[11px] font-bold text-red-500 hover:text-red-600"
                          >
                            {t('markItemOutOfStock')}
                          </button>
                        </div>
                      ))}
                      {order.items?.length > 4 && <span className="text-xs text-gray-400 self-center">+{order.items.length - 4} {t('moreItems', 'more')}</span>}
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-sm font-bold text-[#F47A3E]">{order.totalAmount?.toLocaleString()} RWF</span>

                      {dashboardRole === 'manager' && (order.status === 'pending' || order.status === 'accepted') && (
                        <select
                          defaultValue={order.assignedTo || ''}
                          onChange={e => updateOrder(order.id, { assignedTo: e.target.value, status: 'accepted' })}
                          className="text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#F47A3E]"
                        >
                          <option value="">{t('assignToStaff')}</option>
                          {STAFF_MEMBERS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      )}

                      {dashboardRole === 'staff' && order.assignedTo === selectedStaff && (order.status === 'accepted' || order.status === 'pending') && (
                        <button
                          onClick={() => updateOrder(order.id, { status: 'preparing', assignedTo: selectedStaff })}
                          className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <Package className="w-3 h-3" /> {t('markPreparing')}
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrder(order.id, { status: 'ready' })}
                          className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <CheckCircle2 className="w-3 h-3" /> {t('markReady')}
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrder(order.id, { status: 'completed' })}
                          className="flex items-center gap-1 bg-gray-500 hover:bg-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <CheckCircle2 className="w-3 h-3" /> {t('complete')}
                        </button>
                      )}

                      {dashboardRole === 'manager' && order.status === 'completed' && order.userId && !order.flagged && (
                        <button
                          onClick={async () => {
                            await flagNoShow(order.userId, order.id);
                            await updateOrder(order.id, { flagged: true });
                          }}
                          className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          <Flag className="w-3 h-3" /> {t('noShow')}
                        </button>
                      )}

                      {order.flagged && (
                        <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                          <Flag className="w-3 h-3" /> {t('flagged')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-card rounded-2xl p-5 shadow-sm border dark:border-border">
              <div className="flex items-center gap-2 mb-2">
                <Boxes className="w-5 h-5 text-[#F47A3E]" />
                <h3 className="font-bold text-lg dark:text-white">{t('inventoryOverview')}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('stockTrackedByBranch')}</p>
              <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 text-sm text-amber-800 dark:text-amber-300 mb-4">
                {t('staffCanUpdateStock')}
              </div>

              {loadingInventory ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-[#F47A3E]" />
                </div>
              ) : lowStock.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">{t('noLowStockItems')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-bold">{t('lowStockItems')}</p>
                  {lowStock.map(item => (
                    <div key={item.productId} className="rounded-xl border border-gray-100 dark:border-gray-800 p-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm dark:text-white">{productNameById.get(item.productId) || item.productId}</p>
                        <p className="text-xs text-red-500 font-bold">{item.stock} {t('itemsLeft')}</p>
                      </div>
                      <button
                        onClick={() => markItemUnavailable(item.productId)}
                        className="text-xs font-bold text-red-500 hover:text-red-600"
                      >
                        {t('markItemOutOfStock')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-card rounded-2xl p-5 shadow-sm border dark:border-border">
              <h3 className="font-bold text-lg dark:text-white mb-3">{t('staffMember')}</h3>
              <div className="space-y-2">
                {STAFF_MEMBERS.map(member => {
                  const activeOrders = orders.filter(order => order.assignedTo === member && order.status !== 'completed').length;
                  return (
                    <div key={member} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-gray-800 px-3 py-2">
                      <span className="text-sm font-semibold dark:text-white">{member}</span>
                      <span className="text-xs font-bold text-[#F47A3E]">{activeOrders} {t('activeLabel')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
