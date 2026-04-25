/**
 * No-show flagging system
 * When a customer doesn't pick up, staff flags them.
 * 2+ flags = higher deposit required (1000 RWF instead of 500)
 */
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

export const BASE_DEPOSIT = 500;
export const HIGH_DEPOSIT = 1000;
export const FLAG_THRESHOLD = 2;

export async function flagNoShow(userId: string, orderId: string): Promise<void> {
  try {
    const ref = doc(db, 'noshow_flags', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      await updateDoc(ref, {
        count: increment(1),
        lastOrderId: orderId,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        userId,
        count: 1,
        lastOrderId: orderId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (e) { console.error('Flag no-show failed:', e); }
}

export async function getDepositAmount(userId: string): Promise<number> {
  try {
    const snap = await getDoc(doc(db, 'noshow_flags', userId));
    if (snap.exists() && snap.data().count >= FLAG_THRESHOLD) {
      return HIGH_DEPOSIT;
    }
  } catch {}
  return BASE_DEPOSIT;
}

export async function getNoShowCount(userId: string): Promise<number> {
  try {
    const snap = await getDoc(doc(db, 'noshow_flags', userId));
    return snap.exists() ? (snap.data().count || 0) : 0;
  } catch { return 0; }
}
