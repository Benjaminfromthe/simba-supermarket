import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Star, Store, Loader2, CheckCircle2 } from 'lucide-react';
import branches from '../data/branches.json';
import { Link } from 'react-router-dom';

interface Review {
  id: string;
  branchId: string;
  userId: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: any;
}

export default function BranchReviewsPage() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [selectedBranch, setSelectedBranch] = useState(branches[0].id);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    loadReviews(selectedBranch);
  }, [selectedBranch]);

  const loadReviews = async (branchId: string) => {
    setLoadingReviews(true);
    try {
      const q = query(collection(db, 'branchReviews'), where('branchId', '==', branchId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    } catch (e) {
      console.error(e);
    }
    setLoadingReviews(false);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || rating === 0) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'branchReviews'), {
        branchId: selectedBranch,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setRating(0);
      setComment('');
      await loadReviews(selectedBranch);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const branch = branches.find(b => b.id === selectedBranch);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl text-foreground">
      <h1 className="text-2xl font-black mb-2 dark:text-white flex items-center gap-2">
        <Store className="w-6 h-6 text-[#F47A3E]" /> Branch Reviews
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Rate your pick-up experience at a Simba branch</p>

      {/* Branch selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
        {branches.map(b => (
          <button key={b.id} onClick={() => setSelectedBranch(b.id)}
            className={`p-3 rounded-xl border-2 text-sm font-bold text-left transition-all ${selectedBranch === b.id ? 'border-[#F47A3E] bg-orange-50 dark:bg-orange-950/30 text-[#F47A3E]' : 'border-gray-200 dark:border-gray-700 dark:text-white hover:border-orange-300'}`}>
            {b.name}
          </button>
        ))}
      </div>

      {/* Branch stats */}
      {avgRating && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 mb-6 flex items-center gap-4">
          <div className="text-4xl font-black text-[#F47A3E]">{avgRating}</div>
          <div>
            <div className="flex gap-0.5 mb-1">
              {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= Math.round(Number(avgRating)) ? 'fill-[#F47A3E] text-[#F47A3E]' : 'text-gray-300'}`} />)}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''} for {branch?.name}</p>
          </div>
        </div>
      )}

      {/* Write review */}
      {currentUser ? (
        <div className="bg-white dark:bg-card border dark:border-border rounded-2xl p-5 shadow-sm mb-6">
          {submitted ? (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-bold dark:text-white">Thank you for your review!</p>
              <button onClick={() => setSubmitted(false)} className="text-[#F47A3E] text-sm hover:underline mt-1">Write another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h3 className="font-bold mb-3 dark:text-white">Rate {branch?.name}</h3>
              {/* Star rating */}
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(s)}>
                    <Star className={`w-8 h-8 transition-colors ${s <= (hovered || rating) ? 'fill-[#F47A3E] text-[#F47A3E]' : 'text-gray-300 dark:text-gray-600'}`} />
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience (optional)..."
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm bg-gray-50 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F47A3E] resize-none h-24 mb-3" />
              <button type="submit" disabled={rating === 0 || loading}
                className="bg-[#F47A3E] disabled:opacity-40 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#D46A2E] transition flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                Submit Review
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 text-center mb-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">Sign in to leave a review</p>
          <Link to="/login" className="bg-[#F47A3E] text-white font-bold px-6 py-2 rounded-xl hover:bg-[#D46A2E] transition text-sm">{t('signIn')}</Link>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-3">
        {loadingReviews ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#F47A3E]" /></div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No reviews yet. Be the first!</div>
        ) : reviews.map(r => (
          <div key={r.id} className="bg-white dark:bg-card border dark:border-border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-[#F47A3E] text-[#F47A3E]' : 'text-gray-200 dark:text-gray-700'}`} />)}
              </div>
              <span className="text-xs text-gray-400">{r.userEmail?.split('@')[0]}</span>
            </div>
            {r.comment && <p className="text-sm text-gray-700 dark:text-gray-300">{r.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

