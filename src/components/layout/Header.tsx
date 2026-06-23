import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingBag, Heart, User, Search, Globe, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '../common/Logo';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { language, setLanguage, t } = useLanguage();
  const { totalItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { user, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/about', label: t('about') },
    { to: '/products', label: t('products') },
    { to: '/brands', label: t('brands') },
    { to: '/services', label: t('services') },
    { to: '/contact', label: t('contact') },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-transparent'
      }`}
    >
      {/* Top bar */}
      <div className={`hidden md:block bg-navy-900 text-white text-sm py-2 transition-all duration-300 ${isScrolled ? 'h-0 opacity-0 overflow-hidden py-0' : 'opacity-100'}`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span>Mon-Fri: 10:00 AM - 9:00 PM | Sat-Sun: 12:00 PM - 9:00 PM</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/virtual-try-on"
              className="flex items-center gap-1 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-purple-600 transition-colors"
            >
              <Sparkles size={12} />
              Try On
            </Link>
            <a href="tel:+919441273074" className="hover:text-gold-400 transition-colors">
              +91 9441273074
            </a>
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="flex items-center gap-1 hover:text-gold-400 transition-colors"
            >
              <Globe size={14} />
              {language === 'en' ? 'తెలుగు' : 'English'}
            </button>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <Logo size={isScrolled ? 'sm' : 'md'} showTagline={!isScrolled} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-medium transition-colors relative py-2 ${
                  isActive(link.to)
                    ? 'text-gold-600'
                    : 'text-navy-800 hover:text-gold-600'
                }`}
              >
                {link.label}
                {isActive(link.to) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-600 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Virtual Try-On (Desktop) */}
            <Link
              to="/virtual-try-on"
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg text-sm font-medium hover:from-purple-600 hover:to-blue-600 transition-all"
            >
              <Sparkles size={18} />
              <span className="hidden xl:inline">Try On</span>
            </Link>

            {/* Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-navy-800 hover:text-gold-600 transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Language Toggle (Mobile) */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'te' : 'en')}
              className="md:hidden p-2 text-navy-800 hover:text-gold-600 transition-colors"
              aria-label="Change language"
            >
              <Globe size={20} />
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2 text-navy-800 hover:text-gold-600 transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-500 text-navy-900 text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-navy-800 hover:text-gold-600 transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-navy-800 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Account */}
            {user ? (
              <div className="relative group">
                <button className="p-2 text-navy-800 hover:text-gold-600 transition-colors">
                  <User size={20} />
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 border border-gray-100">
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-navy-800 hover:bg-navy-50 hover:text-gold-600 transition-colors"
                  >
                    {t('account')}
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-navy-800 hover:bg-navy-50 hover:text-gold-600 transition-colors"
                    >
                      {t('dashboard')}
                    </Link>
                  )}
                  <button
                    onClick={signOut}
                    className="block w-full text-left px-4 py-2 text-navy-800 hover:bg-navy-50 hover:text-gold-600 transition-colors"
                  >
                    {t('logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-900 transition-colors"
              >
                <User size={18} />
                <span>{t('login')}</span>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-navy-800 hover:text-gold-600 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        className={`absolute top-full left-0 right-0 bg-white shadow-lg transition-all duration-300 ${
          showSearch ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchProducts')}
              className="input-field flex-1"
              autoFocus={showSearch}
            />
            <button type="submit" className="btn-primary">
              {t('products')}
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 top-16 bg-white z-40 transition-transform duration-300 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <nav className="container mx-auto px-4 py-8 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-lg font-medium py-3 border-b border-gray-100 ${
                isActive(link.to) ? 'text-gold-600' : 'text-navy-800'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            to="/virtual-try-on"
            className="text-lg font-medium py-3 border-b border-gray-100 text-purple-600 flex items-center gap-2"
          >
            <Sparkles size={20} />
            Virtual Try-On
          </Link>
          <Link
            to="/ai-stylist"
            className="text-lg font-medium py-3 border-b border-gray-100 text-blue-600 flex items-center gap-2"
          >
            <Sparkles size={20} />
            AI Stylist
          </Link>
          {!user && (
            <Link
              to="/login"
              className="text-lg font-medium py-3 border-b border-gray-100 text-navy-800"
            >
              {t('login')}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
