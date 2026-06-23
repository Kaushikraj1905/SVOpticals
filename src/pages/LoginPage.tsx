import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from '../components/common/Logo';

export default function LoginPage() {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await signIn(email, password); // Use same for now
        if (error) throw error;
        navigate('/');
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
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" showTagline className="justify-center" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                isLogin
                  ? 'text-navy-900 border-b-2 border-gold-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('login')}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-center font-medium transition-colors ${
                !isLogin
                  ? 'text-navy-900 border-b-2 border-gold-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('register')}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-navy-800 mb-2">
                  {t('fullName')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-navy-800 mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-navy-800 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pr-12"
                  required
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

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
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
              ) : (
                isLogin ? t('login') : t('register')
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500">{t('or')}</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* WhatsApp Login */}
          <a
            href="https://wa.me/919441273074?text=I%20would%20like%20to%20create%20an%20account"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full border border-green-500 text-green-600 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-50 transition-colors"
          >
            Continue with WhatsApp
          </a>

          {/* Link to store */}
          <Link to="/" className="block text-center text-sm text-gray-500 hover:text-gold-600 mt-6">
            Continue as Guest
          </Link>
        </div>
      </div>
    </div>
  );
}
