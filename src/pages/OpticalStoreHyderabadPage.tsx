import { Link } from 'react-router-dom';
import { Glasses, Eye, Truck, Shield, Award, Star } from 'lucide-react';
import SEOPage from './SEOPage';

export default function OpticalStoreHyderabadPage() {
  const content = (
    <div className="space-y-12">
      {/* Why Choose Us */}
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">Why Choose S V Opticals in Hyderabad?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">For over 20 years, we have been the trusted optical destination for thousands of customers in Hyderabad. Here is why we stand out:</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: Glasses, title: '1000+ Frames', desc: 'Wide collection of branded and local frames including Ray-Ban, Titan, Oakley, and more.' },
          { icon: Eye, title: 'Expert Eye Testing', desc: 'Certified optometrists with digital eye testing equipment for accurate prescriptions.' },
          { icon: Shield, title: 'Genuine Products', desc: '100% authentic branded products with manufacturer warranty and GST invoices.' },
          { icon: Truck, title: 'Same-Day Fitting', desc: 'Get your glasses fitted on the same day with our in-house lens cutting lab.' },
          { icon: Award, title: 'Best Prices', desc: 'Competitive pricing with seasonal discounts and combo offers on frames and lenses.' },
          { icon: Star, title: 'After-Sales Support', desc: 'Free frame adjustments, tightening, and cleaning for lifetime of your glasses.' },
        ].map((item) => (
          <div key={item.title} className="bg-white rounded-xl shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-gold-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <item.icon size={24} className="text-gold-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Services */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Our Services in Hyderabad</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { title: 'Eye Testing', desc: 'Comprehensive eye examinations including vision acuity, refraction, and eye health checks.' },
            { title: 'Frame Fitting', desc: 'Personalized frame fitting based on your face shape, prescription, and lifestyle needs.' },
            { title: 'Lens Cutting', desc: 'In-house lens cutting and edging with precision machinery for quick turnaround.' },
            { title: 'Contact Lens Fitting', desc: 'Professional contact lens fitting and training for first-time users.' },
            { title: 'Frame Repairs', desc: 'Screw replacement, nose pad changes, temple adjustments, and minor repairs.' },
            { title: 'Progressive Lenses', desc: 'Advanced progressive lens fitting for seamless near, intermediate, and far vision.' },
          ].map((s) => (
            <div key={s.title} className="border-b pb-4">
              <h3 className="font-semibold text-navy-900">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="font-display text-xl font-bold text-navy-900 mb-4">Ready to See the World Through Us?</h2>
        <p className="text-gray-600 mb-6">Visit our store at Abids, Hyderabad or shop online for the best optical products.</p>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="bg-navy-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-navy-800 transition-colors">Shop Now</Link>
          <Link to="/services" className="border border-navy-900 text-navy-900 px-6 py-3 rounded-lg font-medium hover:bg-navy-50 transition-colors">Our Services</Link>
        </div>
      </div>
    </div>
  );

  return (
    <SEOPage
      title="Best Optical Store in Hyderabad | S V Opticals"
      description="Visit S V Opticals in Abids, Hyderabad for premium eyeglasses, sunglasses, contact lenses, and expert eye care. 1000+ frames, digital eye testing, same-day fitting."
      keywords={['Optical Store Hyderabad', 'Eyeglasses Hyderabad', 'Optical Shop Abids', 'Eye Testing Hyderabad', 'Contact Lenses Hyderabad', 'Best Optical Store', 'S V Opticals', 'Ray-Ban Hyderabad', 'Titan Eye+ Hyderabad']}
      content={content}
      pageName="optical-store-hyderabad"
    />
  );
}
