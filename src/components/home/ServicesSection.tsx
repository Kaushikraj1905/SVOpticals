import { Eye, Monitor, RefreshCw, Wrench, Truck, Sun, Contact } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const services = [
  {
    icon: Eye,
    title: 'eyeTesting',
    titleEn: 'Eye Testing',
    description: 'Comprehensive eye examinations by certified optometrists',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Monitor,
    title: 'computerVision',
    titleEn: 'Computer Vision Consultation',
    description: 'Specialized care for digital eye strain',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: RefreshCw,
    title: 'lensReplacement',
    titleEn: 'Lens Replacement',
    description: 'Quick and precise lens replacement services',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Wrench,
    title: 'frameRepairs',
    titleEn: 'Frame Repairs',
    description: 'Expert repairs for all types of frames',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Truck,
    title: 'homeDelivery',
    titleEn: 'Home Delivery',
    description: 'Free delivery within Hyderabad',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Sun,
    title: 'prescriptionSunglasses',
    titleEn: 'Prescription Sunglasses',
    description: 'Custom prescription sunglasses',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: Contact,
    title: 'contactLensFitting',
    titleEn: 'Contact Lens Fitting',
    description: 'Professional contact lens fitting service',
    color: 'bg-pink-50 text-pink-600',
  },
];

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-gradient-to-b from-white to-navy-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title">{t('services')}</h2>
          <p className="section-subtitle">
            Comprehensive eye care services for your vision needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isFirst = index === 0;
            return (
              <div
                key={service.title}
                className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all group ${
                  isFirst ? 'lg:col-span-2 lg:row-span-2' : ''
                }`}
              >
                <div className={`${service.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={28} />
                </div>
                <h3 className="font-display text-lg font-semibold text-navy-900 mb-2 group-hover:text-gold-600 transition-colors">
                  {t(service.title as any)}
                </h3>
                <p className="text-gray-600 text-sm">
                  {service.description}
                </p>
                {isFirst && (
                  <div className="mt-6">
                    <a
                      href="https://wa.me/919441273074?text=I%20would%20like%20to%20book%20an%20eye%20test"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      Book Appointment
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
