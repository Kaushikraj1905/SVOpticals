import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../../types';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

export default function BrandShowcase() {
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

  if (loading) return null;

  return (
    <section className="py-16 bg-navy-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="section-title">{t('ourBrands')}</h2>
          <p className="section-subtitle">
            Partnering with world's leading eyewear brands
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              to={`/products?brand=${brand.id}`}
              className="bg-white rounded-xl p-6 flex flex-col items-center justify-center hover:shadow-lg transition-all group"
            >
              {/* Placeholder Logo */}
              <div className="w-20 h-20 flex items-center justify-center mb-4">
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-navy-100 rounded-full flex items-center justify-center group-hover:bg-gold-100 transition-colors">
                    <span className="text-2xl font-display font-bold text-navy-700 group-hover:text-gold-600">
                      {brand.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <p className="font-medium text-navy-800 text-center group-hover:text-gold-600 transition-colors">
                {brand.name}
              </p>
              {brand.description && (
                <p className="text-xs text-gray-500 text-center mt-1 line-clamp-2">
                  {brand.description}
                </p>
              )}
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link to="/brands" className="text-navy-800 hover:text-gold-600 font-medium transition-colors">
            View All Brands
          </Link>
        </div>
      </div>
    </section>
  );
}
