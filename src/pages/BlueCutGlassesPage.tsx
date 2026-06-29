import { Link } from 'react-router-dom';
import { Monitor, Shield, Glasses, Eye, Check, Sun } from 'lucide-react';
import SEOPage from './SEOPage';

export default function BlueCutGlassesPage() {
  const content = (
    <div className="space-y-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-4">Blue Cut Computer Glasses in Hyderabad</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">Protect your eyes from digital strain with blue cut computer glasses at S V Opticals. Perfect for professionals, students, and gamers who spend hours in front of screens.</p>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'Blocks Blue Light', desc: 'Filters out harmful blue light (400-450nm) emitted by screens, reducing eye strain and fatigue.', icon: Shield },
          { title: 'Reduces Eye Strain', desc: 'Anti-reflective coating minimizes glare and reflections for comfortable extended screen use.', icon: Eye },
          { title: 'Better Sleep', desc: 'Reduces blue light exposure that disrupts melatonin production, helping you sleep better.', icon: Sun },
          { title: 'Prevents Headaches', desc: 'Reduces digital eye strain that causes headaches and migraines in heavy screen users.', icon: Monitor },
          { title: 'UV Protection', desc: 'Many blue cut lenses also provide UV protection for outdoor use and screen glare.', icon: Shield },
          { title: 'Clear Vision', desc: 'High-quality lenses with anti-glare coating ensure crystal clear vision at all times.', icon: Glasses },
        ].map((b) => (
          <div key={b.title} className="bg-white rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <b.icon size={24} className="text-blue-600" />
            </div>
            <h3 className="font-semibold text-navy-900 mb-2">{b.title}</h3>
            <p className="text-sm text-gray-600">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* Who Needs */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Who Needs Blue Cut Glasses?</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            'IT professionals working 8+ hours daily',
            'Students attending online classes',
            'Gamers spending long sessions',
            'Office workers using spreadsheets/documents',
            'Graphic designers and video editors',
            'Anyone experiencing digital eye strain',
            'People with sleep issues from screen use',
            'Children using tablets for learning',
          ].map((w, i) => (
            <div key={i} className="flex items-center gap-3">
              <Check size={20} className="text-green-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{w}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lens Options */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Blue Cut Lens Options</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Basic Blue Cut', price: 'From ₹500', desc: 'Entry-level blue light filter with anti-glare coating. Good for occasional screen users.' },
            { title: 'Premium Blue Cut', price: 'From ₹1500', desc: 'Advanced filter with higher blue light blocking percentage. Better clarity and durability.' },
            { title: 'Blue Cut + Photochromic', price: 'From ₹2500', desc: 'Combines blue light protection with photochromic lenses for indoor/outdoor use.' },
            { title: 'Blue Cut Progressive', price: 'From ₹3000', desc: 'Progressive lenses with blue cut for users who need both near and far vision correction.' },
            { title: 'Blue Cut Zero Power', price: 'From ₹400', desc: 'Non-prescription blue cut glasses for those with perfect vision but screen exposure.' },
            { title: 'Kids Blue Cut', price: 'From ₹600', desc: 'Specially designed for children with durable frames and enhanced blue light protection.' },
          ].map((l) => (
            <div key={l.title} className="border rounded-xl p-6">
              <h3 className="font-semibold text-navy-900 mb-2">{l.title}</h3>
              <p className="text-lg font-bold text-gold-600 mb-2">{l.price}</p>
              <p className="text-sm text-gray-600">{l.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">Available Brands</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Essilor Crizal', 'Zeiss DuraVision', 'Hoya Blue Control', 'Kodak Blue', 'SV Opticals', 'Crizal Prevencia', 'Nikon SeeMax', 'Rodenstock'].map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm font-medium text-navy-800">
              <Check size={16} className="text-green-600" /> {b}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gradient-to-br from-navy-900 to-purple-900 rounded-xl p-8 text-white">
        <h2 className="font-display text-2xl font-bold mb-4">Protect Your Eyes Today</h2>
        <p className="text-gray-300 mb-6 max-w-xl mx-auto">Get your blue cut computer glasses at S V Opticals in Abids, Hyderabad. Free eye testing included with every purchase.</p>
        <div className="flex justify-center gap-4">
          <Link to="/products" className="bg-gold-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">Shop Blue Cut Glasses</Link>
          <Link to="/ai-search" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">AI Search</Link>
        </div>
      </div>
    </div>
  );

  return (
    <SEOPage
      title="Blue Cut Computer Glasses in Hyderabad | Anti Blue Light"
      description="Buy blue cut computer glasses in Hyderabad at S V Opticals. Protect your eyes from digital strain. Free eye testing included. Blue light filter lenses with anti-glare coating."
      keywords={['Blue Cut Glasses Hyderabad', 'Computer Glasses Hyderabad', 'Anti Blue Light Glasses', 'Blue Light Filter Lenses', 'Digital Eye Strain Hyderabad', 'Screen Glasses Abids', 'Blue Cut Lenses Price', 'Computer Glasses Store']}
      content={content}
      pageName="blue-cut-glasses-hyderabad"
    />
  );
}
