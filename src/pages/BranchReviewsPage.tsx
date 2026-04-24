import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { Star, Store, Loader2, CheckCircle2, MapPin } from 'lucide-react';
import branches from '../data/branches.json';
import { Link } from 'react-router-dom';

interface Review { id: string; branchId: string; userId: string; userEmail: string; rating: number; comment: string; createdAt: any; }

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

  useEffect(() => { loadReviews(selectedBranch); }, [selectedBranch]);

  const loadReviews = async (branchId: string) => {
    setLoadingReviews(true);
    try {
      const q = query(collection(db, 'branchReviews'), where('branchId', '==', branchId), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    } catch (e) { console.error(e); }
    setLoadingReviews(false);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : 0;
  const branch = branches.find(b => b.id === selectedBranch);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || rating === 0) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'branchReviews'), { branchId: selectedBranch, userId: currentUser.uid, userEmail: currentUser.email, rating, comment, createdAt: serverTimestamp() });
      setSubmitted(true); setRating(0); setComment('');
      await loadReviews(selectedBranch);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Branch Reviews</h1>
        <p className="text-gray-500 dark:text-gray-400">Rate your pick-up experience at any Simba branch</p>
      </div>

      {/* Branch selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
        {branches.map(b => (
          <div key={b.id} onClick={() => setSelectedBranch(b.id)}
            className={`card-premium p-4 cursor-pointer flex flex-col gap-2 ${selectedBranch === b.id ? 'border-[#F47A3E] bg-orange-50 dark:!bg-orange-950/20' : ''}`}>
            <Store className={`w-5 h-5 mb-2 ${selectedBranch === b.id ? 'text-[#F47A3E]' : 'text-gray-400'}`} />
            <p className={`text-sm font-bold leading-tight ${selectedBranch === b.id ? 'text-[#F47A3E]' : 'text-gray-800 dark:text-white'}`}>{b.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{b.locationNote}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Write review */}
        <div className="card-premium p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="font-bold text-lg dark:text-white mb-1">Thank you!</h3>
              <p className="text-gray-500 text-sm mb-4">Your review has been submitted</p>
              <button onClick={() => setSubmitted(false)} className="text-[#F47A3E] text-sm font-bold hover:underline">Write another review</button>
            </div>
          ) : currentUser ? (
            <>
              <h3 className="font-bold text-lg dark:text-white mb-1">Rate {branch?.name}</h3>
              <p className="text-gray-500 text-sm mb-4">How was your experience?</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button" onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)} onClick={() => setRating(s)}>
                      <Star className={`w-9 h-9 transition-all ${s <= (hovered || rating) ? 'fill-[#F47A3E] text-[#F47A3E] scale-110' : 'text-gray-200 dark:text-gray-700'}`} />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-sm font-bold text-[#F47A3E]">
                    {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'} ✓
                  </p>
                )}
                <textarea value={comment} onChange={e => setComment(e.target.value)}
                  placeholder="Share your experience (optional)..."
                  className="input-field resize-none h-24" />
                <button type="submit" disabled={rating === 0 || loading}
                  className="w-full bg-[#F47A3E] disabled:opacity-40 text-white font-bold py-3 rounded-xl hover:bg-[#D46A2E] transition flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4 fill-white" />}
                  Submit Review
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-[#F47A3E]" />
              </div>
              <h3 className="font-bold dark:text-white mb-1">Sign in to review</h3>
              <p className="text-gray-500 text-sm mb-4">Share your experience with other shoppers</p>
              <Link to="/login" className="bg-[#F47A3E] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#D46A2E] transition text-sm">{t('signIn')}</Link>
            </div>
          )}
        </div>

        {/* Reviews list */}
        <div>
          {/* Stats */}
          {reviews.length > 0 && (
            <div className="bg-white dark:bg-card border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm mb-4 flex items-center gap-4">
              <div className="text-5xl font-black text-[#F47A3E]">{avgRating.toFixed(1)}</div>
              <div>
                <div className="flex gap-0.5 mb-1">
                  {[1,2,3,4,5].map(s => <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-[#F47A3E] text-[#F47A3E]' : 'text-gray-200 dark:text-gray-700'}`} />)}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{branch?.name}</p>
              </div>
            </div>
          )}

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loadingReviews ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-[#F47A3E]" /></div>
            ) : reviews.length === 0 ? (
              <div className="bg-white dark:bg-card border border-gray-100 dark:border-gray-800 rounded-2xl p-8 text-center">
                <Star className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No reviews yet. Be the first!</p>
              </div>
            ) : reviews.map(r => (
              <div key={r.id} className="bg-white dark:bg-card border border-gray-100 dark:border-gray-800 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-[#F47A3E] text-[#F47A3E]' : 'text-gray-200 dark:text-gray-700'}`} />)}
                  </div>
                  <span className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">{r.userEmail?.split('@')[0]}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
