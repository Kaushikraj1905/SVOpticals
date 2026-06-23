import { Link } from 'react-router-dom';
import { ArrowRight, Eye, Award, ShoppingBag, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-navy-50 via-white to-gold-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-500 rounded-full blur-3xl" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 opacity-10">
        <Eye size={200} className="text-navy-900" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10">
        <Award size={150} className="text-gold-500" />
      </div>

      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gold-100 text-gold-700 px-4 py-2 rounded-full text-sm font-medium">
              <Award size={16} />
              Premium Optical Store in Hyderabad
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-navy-900 leading-tight">
              See the World{' '}
              <span className="relative">
                <span className="relative z-10">Through Us!</span>
                <span className="absolute bottom-2 left-0 right-0 h-3 bg-gold-200 -z-0 opacity-50" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-navy-600 max-w-lg">
              Discover premium eyewear from world-renowned brands. Expert eye care services
              and personalized attention at our store in the heart of Abids, Hyderabad.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                {t('shopNow')}
                <ArrowRight size={20} />
              </Link>
              <a
                href="https://wa.me/919441273074?text=Hi,%20I%20would%20like%20to%20book%20an%20eye%20test%20at%20S%20V%20Opticals"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline flex items-center justify-center gap-2"
              >
                <MessageCircle size={20} />
                {t('bookEyeTest')}
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8">
              <div>
                <p className="text-3xl font-bold text-navy-900">10+</p>
                <p className="text-sm text-navy-600">Premium Brands</p>
              </div>
              <div className="w-px bg-navy-200" />
              <div>
                <p className="text-3xl font-bold text-navy-900">5000+</p>
                <p className="text-sm text-navy-600">Happy Customers</p>
              </div>
              <div className="w-px bg-navy-200" />
              <div>
                <p className="text-3xl font-bold text-navy-900">15+</p>
                <p className="text-sm text-navy-600">Years Experience</p>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative animate-slide-up hidden lg:block">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="Premium Eyewear Collection"
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
              {/* Overlay Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gold-100 rounded-lg">
                    <Eye className="text-gold-600" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900">Expert Eye Testing</p>
                    <p className="text-sm text-gray-500">Free Consultation</p>
                  </div>
                </div>
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-navy-900 text-white rounded-xl p-4 shadow-lg">
                <p className="text-2xl font-bold">20%</p>
                <p className="text-xs">First Order OFF</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 100L60 83.3C120 66.7 240 33.3 360 25C480 16.7 600 33.3 720 41.7C840 50 960 50 1080 41.7C1200 33.3 1320 16.7 1380 8.3L1440 0V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
}
