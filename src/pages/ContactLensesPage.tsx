import { Link } from 'react-router-dom';
import { Eye, Droplets, Calendar, Shield, Check } from 'lucide-react';
import SEOPage from './SEOPage';

export default function ContactLensesPage() {
  const content = (
    <div className="space-y-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">Contact Lenses in Hyderabad</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">S V Opticals offers a complete range of contact lenses in Hyderabad including daily disposable, monthly, toric, and colored lenses. Professional fitting and training included.</p>
      </div>

      {/* Lens Types */}
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: 'Daily Disposable', desc: 'Fresh, clean lenses every day. No cleaning needed. Perfect for occasional wearers and first-time users.', icon: Calendar },
          { title: 'Monthly Lenses', desc: 'Economical option for regular wearers. Easy cleaning with multi-purpose solution. Lasts up to 30 days.', icon: Calendar },
          { title: 'Toric Lenses', desc: 'Specially designed for astigmatism. Corrects both spherical and cylindrical powers for clear vision.', icon: Eye },
          { title: 'Multifocal Lenses', desc: 'Correct near, intermediate, and far vision in one lens. Ideal for presbyopia patients.', icon: Eye },
          { title: 'Colored Lenses', desc: 'Enhance or change your eye color with safe, cosmetic lenses. Available in multiple shades.', icon: Droplets },
          { title: 'Silicone Hydrogel', desc: 'Advanced material allows more oxygen to reach the eye. Comfortable for extended wear.', icon: Shield },
        ].map((l) => (
          <div key={l.title} className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <l.icon size={24} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">{l.title}</h3>
            <p className="text-sm text-gray-600">{l.desc}</p>
          </div>
        ))}
      </div>

      {/* Brands */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Contact Lens Brands Available</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Acuvue', 'Bausch + Lomb', 'Alcon', 'CooperVision', 'Ciba Vision', 'Johnson & Johnson', 'SofLens', 'FreshLook'].map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm font-medium text-navy-800">
              <Check size={16} className="text-green-600" /> {b}
            </div>
          ))}
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Our Contact Lens Services</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Free contact lens fitting and trial',
            'Personalized training for first-time users',
            'Corneal topography for accurate fitting',
            'Contact lens solution and accessories',
            'Follow-up consultations after fitting',
            'Emergency lens replacement service',
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              <Check size={20} className="text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gradient-to-br from-navy-900 to-purple-900 rounded-xl p-8 text-white">
        <h2 className="font-display text-2xl font-bold mb-4">Book Your Contact Lens Fitting</h2>
        <p className="text-gray-300 mb-6 max-w-xl mx-auto">Visit our store at Abids, Hyderabad for a professional contact lens fitting. Our experts will help you find the perfect lenses.</p>
        <div className="flex justify-center gap-4">
          <Link to="/contact" className="bg-gold-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">Book Appointment</Link>
          <Link to="/products" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">Browse Products</Link>
        </div>
      </div>
    </div>
  );

  return (
    <SEOPage
      title="Contact Lenses in Hyderabad | Daily, Monthly, Toric"
      description="Buy contact lenses in Hyderabad at S V Opticals. Daily disposable, monthly, toric, multifocal, and colored lenses. Professional fitting included. Brands: Acuvue, Bausch + Lomb, Alcon."
      keywords={['Contact Lenses Hyderabad', 'Daily Disposable Lenses Hyderabad', 'Monthly Contact Lenses', 'Toric Lenses Hyderabad', 'Colored Lenses Hyderabad', 'Contact Lens Fitting Hyderabad', 'Acuvue Hyderabad', 'Bausch Lomb Hyderabad', 'Contact Lens Store']}
      content={content}
      pageName="contact-lenses-hyderabad"
    />
  );
}
