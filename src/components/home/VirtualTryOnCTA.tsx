import { Link } from 'react-router-dom';
import { Sparkles, Camera, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function VirtualTryOnCTA() {
  const { language } = useLanguage();

  return (
    <section className="py-16 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="tryOnGrid" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="2" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#tryOnGrid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles size={16} />
              {language === 'te' ? 'AI ఆధారిత టెక్నాలజీ' : 'AI-Powered Technology'}
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              {language === 'te' ? 'కొనడానికి ముందు ప్రయత్నించండి' : 'Try Before You Buy'}
            </h2>

            <p className="text-lg text-white/80 mb-8 max-w-lg">
              {language === 'te'
                ? 'మా వర్చువల్ ట్రై-ఆన్ టెక్నాలజీని ఉపయోగించి ఇంటి వద్దే ఫ్రేమ్‌లను ప్రయత్నించండి. కేమెరా ఉపయోగించండి లేదా ఫోటో అప్‌లోడ్ చేయండి.'
                : 'Use our virtual try-on technology to see how frames look on you from the comfort of your home. Use your camera or upload a photo.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/virtual-try-on"
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                {language === 'te' ? 'వర్చువల్ ట్రై-ఆన్' : 'Virtual Try-On'}
                <ArrowRight size={20} />
              </Link>
              <Link
                to="/ai-stylist"
                className="bg-white/20 hover:bg-white/30 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles size={20} />
                {language === 'te' ? 'AI స్టైలిస్ట్' : 'AI Stylist'}
              </Link>
            </div>
          </div>

          {/* Visual */}
          <div className="hidden md:flex items-center justify-center relative">
            <div className="relative">
              <div className="w-64 h-64 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="w-56 h-56 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-48 h-48 bg-white/20 rounded-full flex items-center justify-center">
                    <Camera size={80} className="text-white" />
                  </div>
                </div>
              </div>
              {/* Orbiting icons */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="text-purple-600" size={24} />
                </div>
              </div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                <div className="w-12 h-12 bg-gold-400 rounded-full flex items-center justify-center shadow-lg">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 text-navy-900" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="8" width="6" height="5" rx="1" />
                    <rect x="14" y="8" width="6" height="5" rx="1" />
                    <path d="M10 10h4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
