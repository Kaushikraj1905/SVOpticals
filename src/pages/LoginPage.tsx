import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/common/Logo';

export default function LoginPage() {
  const { t } = useLanguage();
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/');
      } else if (mode === 'register') {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
        setSuccess('Account created! Please check your email to verify.');
        setMode('login');
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setSuccess('Password reset link sent! Check your email.');
        setMode('login');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-50 via-white to-gold-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo size="lg" showTagline className="justify-center" />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {mode === 'login' && (
            <div className="flex border-b border-gray-200 mb-8">
              <button className="flex-1 py-3 text-center font-medium text-navy-900 border-b-2 border-gold-500">
                {t('login')}
              </button>
              <button
                onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
                className="flex-1 py-3 text-center font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t('register')}
              </button>
            </div>
          )}
          {mode === 'register' && (
            <div className="flex border-b border-gray-200 mb-8">
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className="flex-1 py-3 text-center font-medium text-gray-500 hover:text-gray-700 transition-colors"
              >
                {t('login')}
              </button>
              <button className="flex-1 py-3 text-center font-medium text-navy-900 border-b-2 border-gold-500">
                {t('register')}
              </button>
            </div>
          )}
          {mode === 'reset' && (
            <div className="flex items-center gap-2 mb-8">
              <button
                onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft size={16} />
                Back to Login
              </button>
              <h2 className="text-lg font-semibold text-navy-900">Reset Password</h2>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required={mode === 'register'}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-navy-800 mb-2">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  required
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-2">Password</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-12"
                    required={mode !== 'reset'}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Loading...
                </>
              ) : mode === 'login' ? (
                t('login')
              ) : mode === 'register' ? (
                t('register')
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <div className="mt-6 text-center">
              <button
                onClick={() => { setMode('reset'); setError(null); setSuccess(null); }}
                className="text-sm text-gold-600 hover:text-gold-700"
              >
                Forgot password?
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <a
            href="https://wa.me/919441273074?text=I%20would%20like%20to%20create%20an%20account"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border border-green-500 text-green-600 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
          >
            Continue with WhatsApp
          </a>

          <Link to="/" className="block text-center text-sm text-gray-500 hover:text-gold-600 mt-6">
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
