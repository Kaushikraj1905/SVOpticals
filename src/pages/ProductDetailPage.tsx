import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Share2, ArrowLeft, Star, Check, Truck, Shield, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import ProductCard from '../components/products/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:product_categories(*),
          inventory(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);

      // Fetch related products
      if (data?.category_id) {
        const { data: related } = await supabase
          .from('products')
          .select(`
            *,
            brand:brands(*),
            category:product_categories(*),
            inventory(*)
          `)
          .eq('category_id', data.category_id)
          .neq('id', id)
          .limit(4);
        setRelatedProducts(related || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy-900 mb-4">Product not found</h1>
          <Link to="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const productName = language === 'te' && product.name_te ? product.name_te : product.name;
  const productDesc = language === 'te' && product.description_te ? product.description_te : product.description;
  const images = product.image_urls?.length > 0 ? product.image_urls : ['https://images.pexels.com/photos/7018515/pexels-photo-7018515.jpeg?auto=compress&cs=tinysrgb&w=400'];
  const inStock = product.inventory ? product.inventory.quantity > 0 : true;
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const inWishlist = isInWishlist(product.id);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/products" className="flex items-center gap-2 text-navy-600 hover:text-gold-600 transition-colors">
            <ArrowLeft size={20} />
            Back to Products
          </Link>
        </div>
      </div>

      {/* Product Detail */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={productName}
                className="w-full aspect-square object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-gold-500' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="bg-white rounded-xl p-6 md:p-8">
            {/* Brand & Name */}
            {product.brand && (
              <p className="text-sm text-gold-600 font-medium uppercase tracking-wide mb-2">
                {product.brand.name}
              </p>
            )}
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy-900 mb-4">
              {productName}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-gold-500" fill={i < 4 ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">(4.0 - 23 reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-navy-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className={`inline-flex items-center gap-2 mb-6 ${inStock ? 'text-green-600' : 'text-red-600'}`}>
              {inStock ? <Check size={20} /> : null}
              <span className="font-medium">{inStock ? t('inStock') : t('outOfStock')}</span>
              {product.inventory && <span className="text-gray-500">({product.inventory.quantity} available)</span>}
            </div>

            {/* Description */}
            {productDesc && (
              <p className="text-gray-600 mb-6">{productDesc}</p>
            )}

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-navy-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                      <span className="text-navy-800">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-navy-800 mb-2">{t('quantity')}</label>
              <div className="flex items-center border rounded-lg w-32">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => addToCart(product, quantity)}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                  inStock ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={20} />
                {t('addToCart')}
              </button>
              <button
                onClick={() => inWishlist ? removeFromWishlist(product.id) : addToWishlist(product)}
                className={`p-3 rounded-lg border transition-colors ${
                  inWishlist ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart size={24} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
              <button className="p-3 rounded-lg border border-gray-300 text-gray-400 hover:border-gold-500 hover:text-gold-500 transition-colors">
                <Share2 size={24} />
              </button>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Truck size={18} className="text-green-600" />
                Free Delivery
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield size={18} className="text-blue-600" />
                Authentic Product
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <RotateCcw size={18} className="text-orange-600" />
                Easy Returns
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="section-title mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
