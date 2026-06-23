import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageCircle, Facebook, Instagram, Twitter, Sparkles } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import Logo from '../common/Logo';

export default function Footer() {
  const { t, language, setLanguage } = useLanguage();
  const currentYear = new Date().getFullYear();

  const navLinks = [
    { to: '/', label: t('home') },
    { to: '/about', label: t('about') },
    { to: '/products', label: t('products') },
    { to: '/brands', label: t('brands') },
    { to: '/services', label: t('services') },
    { to: '/contact', label: t('contact') },
  ];

  const productLinks = [
    { to: '/products?category=frames-men', label: t('frames') + ' - ' + t('men') },
    { to: '/products?category=frames-women', label: t('frames') + ' - ' + t('women') },
    { to: '/products?category=frames-kids', label: t('frames') + ' - ' + t('kids') },
    { to: '/products?category=sunglasses', label: t('sunglasses') },
    { to: '/products?category=contact-lenses', label: t('contactLenses') },
    { to: '/products?category=lenses', label: t('lenses') },
  ];

  return (
    <footer className="bg-navy-950 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Store Info */}
          <div className="space-y-6">
            <Logo size="lg" light />
            <p className="text-gold-400 font-medium">{t('tagline')}</p>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-gold-500 flex-shrink-0 mt-0.5" />
                <span>
                  S. No. G-4 Malti Naik Plaza,<br />
                  Abids, Hyderabad,<br />
                  Telangana 500001, India
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={20} className="text-gold-500" />
                <a href="tel:+919441273074" className="hover:text-gold-400 transition-colors">
                  +91 9441273074
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={20} className="text-gold-500" />
                <a href="mailto:drrkgupta037@gmail.com" className="hover:text-gold-400 transition-colors">
                  drrkgupta037@gmail.com
                </a>
              </div>
            </div>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 bg-navy-800 rounded-lg hover:bg-gold-600 transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-2 bg-navy-800 rounded-lg hover:bg-gold-600 transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 bg-navy-800 rounded-lg hover:bg-gold-600 transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a
                href="https://wa.me/919441273074"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} />
              </a>
            </div>

            {/* AI Features */}
            <div className="flex flex-col gap-3">
              <Link
                to="/virtual-try-on"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all text-sm font-medium"
              >
                <Sparkles size={16} />
                Virtual Try-On
              </Link>
              <Link
                to="/ai-stylist"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all text-sm font-medium"
              >
                <Sparkles size={16} />
                AI Stylist
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold-400 mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-300 hover:text-gold-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold-400 mb-6">{t('products')}</h3>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-300 hover:text-gold-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Business Hours */}
          <div>
            <h3 className="font-display text-lg font-semibold text-gold-400 mb-6">{t('businessHours')}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-gold-500" />
                <div>
                  <p className="text-white font-medium">{t('mondayFriday')}</p>
                  <p className="text-gray-400">10:00 AM - 9:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-gold-500" />
                <div>
                  <p className="text-white font-medium">{t('saturdaySunday')}</p>
                  <p className="text-gray-400">12:00 PM - 9:00 PM</p>
                </div>
              </div>
            </div>

            {/* Language Toggle */}
            <div className="mt-8">
              <p className="text-sm text-gray-400 mb-3">Language / భాష</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-gold-500 text-navy-900'
                      : 'bg-navy-800 text-white hover:bg-navy-700'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('te')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    language === 'te'
                      ? 'bg-gold-500 text-navy-900'
                      : 'bg-navy-800 text-white hover:bg-navy-700'
                  }`}
                >
                  తెలుగు
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-navy-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>
              © {currentYear} {t('storeName')}. {t('allRightsReserved')}
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://maps.app.goo.gl/Sib48ePerWs8Tua2A"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-gold-400 transition-colors"
              >
                <MapPin size={16} />
                Find us on Google Maps
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
