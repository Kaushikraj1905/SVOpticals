import { useEffect } from 'react';
import { MapPin, Phone, Clock, Eye, Glasses, GlassesIcon, Contact } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SEOPageProps {
  title: string;
  description: string;
  keywords: string[];
  content: React.ReactNode;
  pageName: string;
}

export default function SEOPage({ title, description, keywords, content, pageName }: SEOPageProps) {
  useEffect(() => {
    document.title = title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
  }, [title, description]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-purple-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">{description}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {keywords.slice(0, 8).map((kw) => (
              <span key={kw} className="text-xs bg-white/10 text-white px-3 py-1 rounded-full">{kw}</span>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/products" className="bg-gold-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-gold-600 transition-colors">Browse Products</Link>
            <Link to="/contact" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">Visit Our Store</Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {content}
      </div>

      {/* Location CTA */}
      <div className="bg-navy-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl font-bold mb-6">Visit S V Opticals Today</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto mb-8">
            <div>
              <MapPin className="mx-auto text-gold-500 mb-3" size={32} />
              <p className="font-medium">Abids, Hyderabad</p>
              <p className="text-sm text-gray-400">Telangana, India</p>
            </div>
            <div>
              <Phone className="mx-auto text-gold-500 mb-3" size={32} />
              <p className="font-medium">+91 92461 86144</p>
              <p className="text-sm text-gray-400">Call us for appointments</p>
            </div>
            <div>
              <Clock className="mx-auto text-gold-500 mb-3" size={32} />
              <p className="font-medium">Mon-Sat 10AM-8PM</p>
              <p className="text-sm text-gray-400">Sunday 11AM-6PM</p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden max-w-2xl mx-auto">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.1!2d78.4737!3d17.3840!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99daeaebd2c7%3A0xcc6e2b51f1b23d2a!2sAbids%2C%20Hyderabad!5e0!3m2!1sen!2sin!4v1690000000000!5m2!1sen!2sin"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="S V Opticals Location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
