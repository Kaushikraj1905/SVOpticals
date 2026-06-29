import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Star, Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export default function ProductCard({ product, featured = false }: ProductCardProps) {
  const { t, language } = useLanguage();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { addItem: addToCart } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const inStock = product.inventory ? product.inventory.quantity > 0 : true;
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const productImage = product.image_urls?.[0] || 'https://images.pexels.com/photos/7018515/pexels-photo-7018515.jpeg?auto=compress&cs=tinysrgb&w=400';
  const productName = language === 'te' && product.name_te ? product.name_te : product.name;

  return (
    <div
      className={`card group overflow-hidden ${featured ? 'bg-navy-50' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/products/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <div className={`absolute inset-0 bg-gray-200 animate-pulse ${imageLoaded ? 'hidden' : ''}`} />
          <img
            src={productImage}
            alt={productName}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.is_featured && (
              <span className="bg-gold-500 text-navy-900 text-xs font-semibold px-2 py-1 rounded-md">
                Featured
              </span>
            )}
            {discount > 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
                {discount}% OFF
              </span>
            )}
            {!inStock && (
              <span className="bg-gray-800 text-white text-xs font-semibold px-2 py-1 rounded-md">
                {t('outOfStock')}
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 ${
              inWishlist
                ? 'bg-red-500 text-white'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            }`}
            aria-label={inWishlist ? t('removeFromWishlist') : t('addToWishlist')}
          >
            <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>

          {/* Quick Actions */}
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="flex gap-2">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-all ${
                  inStock
                    ? 'bg-gold-500 text-navy-900 hover:bg-gold-400'
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={18} />
                <span className="text-sm">{t('addToCart')}</span>
              </button>
              <Link
                to="/virtual-try-on"
                state={{ productId: product.id }}
                className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-400 transition-colors"
                title="Try On Virtually"
              >
                <Sparkles size={18} />
              </Link>
              <Link
                to={`/products/${product.id}`}
                className="p-2 bg-white text-navy-900 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Eye size={18} />
              </Link>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          {product.brand && (
            <p className="text-xs text-gold-600 font-medium uppercase tracking-wide mb-1">
              {product.brand.name}
            </p>
          )}

          {/* Name */}
          <h3 className="font-medium text-navy-900 mb-2 line-clamp-2 group-hover:text-gold-600 transition-colors">
            {productName}
          </h3>

          {/* Rating - dynamic */}
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="text-gold-500" fill={i < Math.round(product.rating || 0) ? 'currentColor' : 'none'} />
            ))}
            <span className="text-xs text-gray-500 ml-1">({product.rating?.toFixed(1) || '0'} · {product.review_count || 0})</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-navy-900">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.mrp > product.price && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* Category */}
          {product.category && (
            <p className="text-xs text-gray-500 mt-2">
              {language === 'te' && product.category.name_te ? product.category.name_te : product.category.name}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
}
