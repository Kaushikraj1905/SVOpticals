import { Eye, Monitor, RefreshCw, Wrench, Truck, Sun, Contact, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

const services = [
  {
    icon: Eye,
    title: 'eyeTesting',
    titleEn: 'Eye Testing',
    description: 'Our certified optometrists conduct comprehensive eye examinations using the latest diagnostic equipment. We check for refractive errors, eye health conditions, and recommend the best solutions for your vision needs.',
    features: ['Complete eye health checkup', 'Digital refraction testing', 'Prescription for glasses/contacts', 'Eye pressure check'],
    price: 'Free with purchase',
    highlighted: true,
  },
  {
    icon: Monitor,
    title: 'computerVision',
    titleEn: 'Computer Vision Consultation',
    description: 'Specialized care for digital eye strain caused by extended screen time. We analyze your work environment and recommend appropriate solutions including blue light blocking lenses.',
    features: ['Screen time analysis', 'Blue light assessment', 'Custom lens recommendations', 'Workspace ergonomics advice'],
    price: '₹200 (adjusted in purchase)',
    highlighted: false,
  },
  {
    icon: RefreshCw,
    title: 'lensReplacement',
    titleEn: 'Lens Replacement',
    description: 'Quick and precise lens replacement services. Keep your favorite frames and upgrade to new prescription lenses with advanced coatings.',
    features: ['Same-day service available', 'All lens types supported', 'Coating options available', 'Frame fitting included'],
    price: 'From ₹1,500',
    highlighted: false,
  },
  {
    icon: Wrench,
    title: 'frameRepairs',
    titleEn: 'Frame Repairs',
    description: 'Expert repairs for all types of frames - metal, acetate, titanium. We fix broken temples, adjust fit, replace nose pads, and restore your frames to perfect condition.',
    features: ['Temple repairs', 'Frame adjustments', 'Nose pad replacement', 'Screw tightening/replacement'],
    price: 'From ₹100',
    highlighted: false,
  },
  {
    icon: Truck,
    title: 'homeDelivery',
    titleEn: 'Home Delivery',
    description: 'Free home delivery within Hyderabad. We bring your orders directly to your doorstep, ensuring safe and convenient delivery of your eyewear.',
    features: ['Free in Hyderabad', 'Safe packaging', 'Same-day for orders before 2 PM', 'Real-time tracking'],
    price: 'Free within city',
    highlighted: false,
  },
  {
    icon: Sun,
    title: 'prescriptionSunglasses',
    titleEn: 'Prescription Sunglasses',
    description: 'Custom prescription sunglasses combining vision correction with sun protection. Choose from polarized, photochromic, or tinted options.',
    features: ['Polarized lenses', 'Photochromic options', 'UV400 protection', 'All frame styles available'],
    price: 'From ₹3,000',
    highlighted: false,
  },
  {
    icon: Contact,
    title: 'contactLensFitting',
    titleEn: 'Contact Lens Fitting',
    description: 'Professional contact lens fitting service. We determine the best lens type for your eyes and provide training on proper usage and care.',
    features: ['Lens type selection', 'Comfort assessment', 'Application training', 'Care instructions'],
    price: '₹300 (adjusted in purchase)',
    highlighted: false,
  },
];

export default function ServicesPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-navy-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('services')}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Comprehensive eye care services delivered by experienced professionals
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-8">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className={`bg-white rounded-2xl shadow-sm overflow-hidden ${
                    service.highlighted ? 'ring-2 ring-gold-500' : ''
                  }`}
                >
                  <div className="grid lg:grid-cols-3 gap-0">
                    {/* Icon Section */}
                    <div className={`p-8 flex items-center justify-center ${
                      service.highlighted ? 'bg-gold-50' : 'bg-navy-50'
                    }`}>
                      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center ${
                        service.highlighted ? 'bg-gold-200' : 'bg-navy-200'
                      }`}>
                        <Icon size={48} className={service.highlighted ? 'text-gold-700' : 'text-navy-700'} />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="lg:col-span-2 p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="font-display text-2xl font-bold text-navy-900">
                            {t(service.title as any)}
                          </h2>
                          <p className="text-gold-600 font-medium mt-1">{service.price}</p>
                        </div>
                        {service.highlighted && (
                          <span className="bg-gold-500 text-navy-900 px-3 py-1 rounded-full text-sm font-medium">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-6">{service.description}</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {service.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Book Appointment CTA */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold mb-4">
            Book an Appointment
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Schedule an eye test or consultation. Walk-ins welcome, or book for guaranteed availability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/919441273074?text=I%20would%20like%20to%20book%20an%20eye%20test%20appointment"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Book via WhatsApp
            </a>
            <a
              href="tel:+919441273074"
              className="btn-outline border-white text-white hover:bg-white hover:text-navy-900"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
