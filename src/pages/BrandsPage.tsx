import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../types';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

export default function BrandsPage() {
  const { t } = useLanguage();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setBrands(data || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-navy-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            {t('ourBrands')}
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            We partner with world-renowned eyewear brands to bring you the best in quality and style
          </p>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                to={`/products?brand=${brand.id}`}
                className="bg-white rounded-xl p-8 hover:shadow-lg transition-all group flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 bg-navy-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-gold-100 transition-colors">
                  <span className="text-4xl font-display font-bold text-navy-700 group-hover:text-gold-600 transition-colors">
                    {brand.name.charAt(0)}
                  </span>
                </div>
                <h2 className="font-display text-xl font-semibold text-navy-900 group-hover:text-gold-600 transition-colors">
                  {brand.name}
                </h2>
                {brand.description && (
                  <p className="text-gray-600 text-sm mt-2 line-clamp-3">
                    {brand.description}
                  </p>
                )}
                <span className="text-gold-600 font-medium mt-4 text-sm">
                  View Products
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-navy-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-4">
            Looking for a specific brand? Contact us!
          </p>
          <a
            href="https://wa.me/919441273074"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            Contact on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
