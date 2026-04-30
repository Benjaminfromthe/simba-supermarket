import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const DEFAULT_STOCK = 50;

function invId(branchId: string, productId: string | number) {
  return `${branchId}_${productId}`;
}

export async function decrementStock(branchId: string, items: { id: string | number; quantity: number }[]): Promise<void> {
  try {
    for (const item of items) {
      const ref = doc(db, 'inventory', invId(branchId, item.id));
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { stock: increment(-item.quantity), updatedAt: serverTimestamp() });
      } else {
        await setDoc(ref, { branchId, productId: String(item.id), stock: DEFAULT_STOCK - item.quantity, updatedAt: serverTimestamp() });
      }
    }
  } catch (e) { console.error('Stock decrement failed:', e); }
}

export async function markOutOfStock(branchId: string, productId: string | number): Promise<void> {
  try {
    await setDoc(doc(db, 'inventory', invId(branchId, productId)), { branchId, productId: String(productId), stock: 0, updatedAt: serverTimestamp() }, { merge: true });
  } catch (e) { console.error(e); }
}

export async function getLowStock(branchId: string): Promise<{ productId: string; stock: number }[]> {
  try {
    const q = query(collection(db, 'inventory'), where('branchId', '==', branchId), where('stock', '<', 5));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ productId: d.data().productId, stock: d.data().stock }));
  } catch { return []; }
}

/** Check if a branch has sufficient stock for all cart items.
 *  Returns true if the branch can fulfil the entire cart.
 *  Items not yet in Firestore are assumed to have DEFAULT_STOCK (50). */
export async function branchHasStock(
  branchId: string,
  items: { id: string | number; quantity: number }[]
): Promise<boolean> {
  try {
    for (const item of items) {
      const ref = doc(db, 'inventory', invId(branchId, item.id));
      const snap = await getDoc(ref);
      const stock = snap.exists() ? (snap.data().stock ?? DEFAULT_STOCK) : DEFAULT_STOCK;
      if (stock < item.quantity) return false;
    }
    return true;
  } catch {
    return true; // fail open — don't block checkout on network error
  }
}
