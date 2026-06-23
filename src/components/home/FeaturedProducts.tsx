import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import ProductCard from '../products/ProductCard';

export default function FeaturedProducts() {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:product_categories(*),
          inventory(*)
        `)
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(8);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <h2 className="section-title">{t('featuredProducts')}</h2>
            <p className="section-subtitle">Discover our most popular eyewear collection</p>
          </div>
          <Link
            to="/products"
            className="hidden md:flex items-center gap-2 text-navy-800 hover:text-gold-600 font-medium transition-colors"
          >
            {t('viewAll')}
            <ArrowRight size={20} />
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} featured />
          ))}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/products"
            className="btn-outline inline-flex items-center gap-2"
          >
            {t('viewAll')}
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
