import { Award, Users, Eye, Target, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-navy-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            {t('aboutTitle')}
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t('aboutSubtitle')}
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title mb-6">{t('ourStory')}</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  S V Opticals has been serving the Hyderabad community for over 15 years,
                  providing quality eyewear and professional eye care services. Located in the
                  heart of Abids, we have become a trusted destination for families seeking
                  reliable optical solutions.
                </p>
                <p>
                  Our journey began with a simple vision: to make quality eyewear accessible
                  to everyone. Today, we stock products from over 10 premium brands including
                  Ray-Ban, Oakley, Titan Eye+, and more.
                </p>
                <p>
                  What sets us apart is our commitment to personalized service. Our experienced
                  optometrists take the time to understand your vision needs and recommend the
                  best solutions for your lifestyle.
                </p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photo-1574269909188-957801726eb.jpeg?auto=compress&cs=tinysrgb&w=600"
                alt="S V Opticals Store"
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-navy-900 text-white rounded-xl p-6 shadow-xl">
                <p className="text-3xl font-bold">15+</p>
                <p className="text-sm">Years of Excellence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-navy-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Our Values</h2>
            <p className="section-subtitle">What drives us every day</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-gold-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Award className="text-gold-600" size={32} />
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900 mb-2">Quality First</h3>
              <p className="text-gray-600 text-sm">We only stock genuine products from authorized distributors.</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Eye className="text-blue-600" size={32} />
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900 mb-2">Expert Care</h3>
              <p className="text-gray-600 text-sm">Certified optometrists providing thorough eye examinations.</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="text-green-600" size={32} />
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900 mb-2">Fair Pricing</h3>
              <p className="text-gray-600 text-sm">Transparent pricing with no hidden charges.</p>
            </div>

            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="text-pink-600" size={32} />
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900 mb-2">Customer Love</h3>
              <p className="text-gray-600 text-sm">5000+ happy customers and counting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-navy-900 text-white rounded-2xl p-8 md:p-12">
              <h3 className="font-display text-2xl font-bold mb-4">{t('ourMission')}</h3>
              <p className="text-gray-300 leading-relaxed">
                To provide the highest quality eyewear and eye care services at affordable prices,
                making good vision accessible to everyone in our community.
              </p>
            </div>
            <div className="border-2 border-navy-800 rounded-2xl p-8 md:p-12">
              <h3 className="font-display text-2xl font-bold text-navy-900 mb-4">{t('ourVision')}</h3>
              <p className="text-gray-600 leading-relaxed">
                To be the most trusted optical store in Hyderabad, known for our quality products,
                expert service, and customer-first approach.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title mb-4">Meet Our Team</h2>
          <p className="section-subtitle mb-12">Dedicated professionals serving your vision needs</p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-24 h-24 bg-navy-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-navy-600" size={48} />
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900">Optometrists</h3>
              <p className="text-gray-600 text-sm mt-2">Certified eye care professionals</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-24 h-24 bg-gold-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-gold-600" size={48} />
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900">Staff</h3>
              <p className="text-gray-600 text-sm mt-2">Friendly and knowledgeable team</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="w-24 h-24 bg-blue-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-blue-600" size={48} />
              </div>
              <h3 className="font-display text-lg font-semibold text-navy-900">Management</h3>
              <p className="text-gray-600 text-sm mt-2">Committed to excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to See the World Through Us?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Visit our store or browse our collection online. Our team is ready to help you find the perfect eyewear.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-secondary">
              Browse Products
            </Link>
            <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-navy-900">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
