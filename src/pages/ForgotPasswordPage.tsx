import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: any) {
      setError(err.message || t('failedToSendResetEmail'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-12">
      <div className="bg-white dark:bg-card border dark:border-border rounded-2xl shadow-sm p-8 w-full max-w-md">
        <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#F47A3E] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('backToSignIn')}
        </Link>

        {sent ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold mb-2 dark:text-white">{t('checkYourEmail')}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              {t('resetLinkSent')} <strong>{email}</strong>
            </p>
            <Link to="/login" className="text-[#F47A3E] font-bold hover:underline text-sm">
              {t('backToSignIn')}
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2 text-[#F47A3E]">{t('resetPassword')}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('resetPasswordInstructions')}</p>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 dark:text-gray-200">{t('emailAddress', 'Email Address')}</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('enterEmailReset')}
                  className="w-full border-2 border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F47A3E]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#F47A3E] hover:opacity-90 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('sendResetLink')}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

