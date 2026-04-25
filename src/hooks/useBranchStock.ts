/**
 * Hook to check stock for a product at a specific branch.
 * Only used on ProductPage — not on cards (too many reads).
 */
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const DEFAULT_STOCK = 50;

export function useBranchStock(branchId: string | null, productId: string | number | null) {
  const [stock, setStock] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!branchId || !productId) { setStock(null); return; }
    setLoading(true);
    const ref = doc(db, 'inventory', `${branchId}_${productId}`);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setStock(snap.data().stock ?? DEFAULT_STOCK);
      } else {
        setStock(DEFAULT_STOCK); // Not tracked yet = full stock
      }
      setLoading(false);
    }, () => { setStock(DEFAULT_STOCK); setLoading(false); });
    return unsub;
  }, [branchId, productId]);

  return { stock, loading, outOfStock: stock !== null && stock <= 0 };
}
