import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AuthBackground from '../components/AuthBackground';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError(t('passwordsDoNotMatch', 'Passwords do not match'));
    }
    try {
      setError('');
      setLoading(true);
      await signUp(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('failedToCreateAccount', 'Failed to create an account'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message || t('failedToSignUpWithGoogle', 'Failed to sign up with Google'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground isTypingPassword={password.length > 0 || confirmPassword.length > 0}>
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-[#F47A3E]/20 border border-[#F47A3E]/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🛒</span>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">Simba Supermarket</h1>
        <p className="text-white/60 text-sm font-medium">{t('createAccount', 'Create an account')}</p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400/40 text-red-300 p-3 rounded-xl text-sm mb-5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-1.5">
            {t('emailAddress', 'Email Address')}
          </label>
          <input
            type="email"
            required
            placeholder={t('enterEmail', 'Enter your email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all text-white placeholder:text-white/30"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            onFocus={e => (e.target.style.border = '1px solid rgba(244,122,62,0.8)')}
            onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.15)')}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-1.5">
            {t('password', 'Password')}
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all text-white placeholder:text-white/30"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            onFocus={e => (e.target.style.border = '1px solid rgba(244,122,62,0.8)')}
            onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.15)')}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-white/70 uppercase tracking-widest mb-1.5">
            {t('confirmPassword', 'Confirm Password')}
          </label>
          <input
            type="password"
            required
            placeholder="••••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-sm font-medium outline-none transition-all text-white placeholder:text-white/30"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
            onFocus={e => (e.target.style.border = '1px solid rgba(244,122,62,0.8)')}
            onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.15)')}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl font-black text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2"
          style={{ background: 'linear-gradient(135deg, #F47A3E, #D46A2E)' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('signUp', 'Sign Up')}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
        <span className="text-white/40 text-xs font-bold uppercase">or</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
      </div>

      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        className="w-full py-3 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {t('signUpWithGoogle', 'Sign up with Google')}
      </button>

      <p className="mt-6 text-center text-sm text-white/50">
        {t('alreadyHaveAccount', 'Already have an account?')}{' '}
        <Link to="/login" className="text-[#F47A3E] font-bold hover:text-orange-300 transition-colors">
          {t('signIn', 'Sign in')}
        </Link>
      </p>
    </AuthBackground>
  );
}
