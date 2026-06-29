import { Link } from 'react-router-dom';
import { Glasses, Search, Filter, Eye, Check } from 'lucide-react';
import SEOPage from './SEOPage';

export default function EyeglassesAbidsPage() {
  const content = (
    <div className="space-y-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">Eyeglasses in Abids, Hyderabad</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Find the perfect eyeglasses at S V Opticals in Abids. We offer a wide range of prescription glasses, reading glasses, computer glasses, and more from top brands and local manufacturers.</p>
      </div>

      {/* Categories */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'Prescription Glasses', desc: 'Single vision, bifocal, and progressive lenses with frames from all major brands.', link: '/products' },
          { title: 'Computer Glasses', desc: 'Blue light filtering glasses for extended screen use. Reduce eye strain and headaches.', link: '/products' },
          { title: 'Reading Glasses', desc: 'Prescription and non-prescription reading glasses in various powers and styles.', link: '/products' },
          { title: 'Kids Eyeglasses', desc: 'Durable, lightweight, and colorful frames designed specifically for children.', link: '/products' },
          { title: 'Designer Frames', desc: 'Premium designer frames from Ray-Ban, Oakley, Vogue, and other luxury brands.', link: '/products' },
          { title: 'Budget Frames', desc: 'Affordable quality frames starting at just ₹500. Great value without compromise.', link: '/products' },
        ].map((c) => (
          <Link key={c.title} to={c.link} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center mb-4">
              <Glasses size={24} className="text-navy-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">{c.title}</h3>
            <p className="text-sm text-gray-600">{c.desc}</p>
          </Link>
        ))}
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Why Buy Eyeglasses from S V Opticals?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'Free eye testing with every purchase',
            'Same-day lens fitting for most prescriptions',
            '1000+ frame styles to choose from',
            'Genuine branded products with warranty',
            'Blue cut, photochromic, and progressive lenses',
            'Flexible payment options including UPI and cards',
            'Home delivery across Hyderabad',
            'Free adjustments and repairs for 1 year',
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <Check size={20} className="text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gradient-to-br from-navy-900 to-purple-900 rounded-xl p-8 text-white">
        <h2 className="font-display text-2xl font-bold mb-4">Find Your Perfect Eyeglasses</h2>
        <p className="text-gray-300 mb-6 max-w-xl mx-auto">Browse our collection of 100+ eyeglasses or use our AI search to find the perfect match for your needs.</p>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="bg-gold-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">Browse Products</Link>
          <Link to="/ai-search" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">AI Search</Link>
        </div>
      </div>
    </div>
  );

  return (
    <SEOPage
      title="Eyeglasses in Abids, Hyderabad | Prescription Glasses"
      description="Buy eyeglasses in Abids, Hyderabad at S V Opticals. Wide range of prescription glasses, computer glasses, reading glasses, and designer frames. Free eye testing included."
      keywords={['Eyeglasses Abids', 'Prescription Glasses Hyderabad', 'Computer Glasses Abids', 'Reading Glasses Hyderabad', 'Kids Eyeglasses Abids', 'Blue Cut Glasses Hyderabad', 'Designer Frames Abids', 'Eyeglasses Store Hyderabad']}
      content={content}
      pageName="eyeglasses-abids"
    />
  );
}
