import { Award, Users, Shield, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const features = [
  {
    icon: Award,
    title: 'qualityProducts',
    description: 'qualityProductsDesc',
    stat: '10+',
    statLabel: 'Premium Brands',
  },
  {
    icon: Users,
    title: 'expertService',
    description: 'expertServiceDesc',
    stat: '15+',
    statLabel: 'Years Experience',
  },
  {
    icon: Shield,
    title: 'affordablePrices',
    description: 'affordablePricesDesc',
    stat: '5000+',
    statLabel: 'Happy Customers',
  },
  {
    icon: Clock,
    title: 'Quick Service',
    description: 'Same-day delivery available within Hyderabad',
    stat: '24hrs',
    statLabel: 'Express Service',
  },
];

export default function WhyChooseUs() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-navy-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-2">
            {t('whyChooseUs')}
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Trusted by thousands of customers in Hyderabad for quality eyewear and professional eye care
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gold-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon size={32} className="text-navy-900" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-2">
                  {t(feature.title as any)}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {t(feature.description as any)}
                </p>
                <div className="pt-4 border-t border-navy-700">
                  <p className="text-3xl font-bold text-gold-400">{feature.stat}</p>
                  <p className="text-sm text-gray-400">{feature.statLabel}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
