import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signIn(email, password);
      navigate('/checkout'); 
    } catch (err: any) {
      setError(err.message || t('failedToSignIn', 'Failed to sign in'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/checkout');
    } catch (err: any) {
      setError(err.message || t('failedToSignInWithGoogle', 'Failed to sign in with Google'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-12">
      <div className="bg-white dark:bg-card border dark:border-border rounded-2xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold font-serif mb-2 text-[#F47A3E]">{t('supermarket', 'Simba Supermarket')}</h1>
          <p className="text-lg font-bold">{t('signInToAccount', 'Sign in to your account')}</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-gray-800 dark:text-white">{t('emailAddress', 'Email Address')}</label>
            <input 
              type="email" 
              required 
              placeholder={t('enterEmail', 'Enter your email')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field" 
            />
          </div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-base font-bold text-gray-900 dark:text-gray-100">{t('password', 'Password')}</label>
            <Link to="/forgot-password" className="text-xs text-[#F47A3E] hover:underline font-bold">Forgot password?</Link>
          </div>
          <div>
            <input 
              type="password" 
              required 
              placeholder={t('password', 'Password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field" 
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('signIn', 'Sign In')}
          </button>
        </form>

        <div className="mt-6 border-t dark:border-border pt-6">
          <button 
            type="button" 
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-white dark:bg-muted border border-gray-300 dark:border-border hover:bg-gray-50 dark:hover:bg-muted/80 text-foreground font-bold py-3 rounded-xl transition flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {t('signInWithGoogle', 'Sign In with Google')}
          </button>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {t('dontHaveAccount', 'Don\'t have an account?')} <Link to="/signup" className="text-[#F47A3E] font-bold hover:underline">{t('signUp', 'Sign up')}</Link>
        </div>
      </div>
    </div>
  );
}



