import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';
import ProductCard from '../products/ProductCard';

export default function RecentlyViewed() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentlyViewed();
  }, []);

  const fetchRecentlyViewed = async () => {
    try {
      const { data } = await supabase
        .from('recently_viewed')
        .select('product:products(*)')
        .order('viewed_at', { ascending: false })
        .limit(8);

      if (data) {
        const uniqueProducts = new Map();
        data.forEach((item: any) => {
          if (item.product && !uniqueProducts.has(item.product.id)) {
            uniqueProducts.set(item.product.id, item.product);
          }
        });
        setProducts(Array.from(uniqueProducts.values()));
      }
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Clock className="text-navy-800" size={24} />
            <h2 className="section-title mb-0">Recently Viewed</h2>
          </div>
          <Link to="/products" className="text-sm text-gold-600 hover:text-gold-700 font-medium">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
