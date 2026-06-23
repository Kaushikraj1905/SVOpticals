import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function WishlistPage() {
  const { t, language } = useLanguage();
  const { items, removeItem } = useWishlist();
  const { addItem: addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart size={48} className="text-pink-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-navy-900 mb-4">
              Your Wishlist is Empty
            </h1>
            <p className="text-gray-600 mb-6">
              Save your favorite products and they'll appear here.
            </p>
            <Link to="/products" className="btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            {t('myWishlist')}
          </h1>
          <p className="text-gray-300">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => {
            const productName = language === 'te' && product.name_te ? product.name_te : product.name;
            const productImage = product.image_urls?.[0] || 'https://images.pexels.com/photos/7018515/pexels-photo-7018515.jpeg?auto=compress&cs=tinysrgb&w=200';
            const inStock = product.inventory ? product.inventory.quantity > 0 : true;

            return (
              <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden group">
                <div className="relative aspect-square">
                  <Link to={`/products/${product.id}`}>
                    <img
                      src={productImage}
                      alt={productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <button
                    onClick={() => removeItem(product.id)}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <Link to={`/products/${product.id}`}>
                    <h3 className="font-medium text-navy-900 hover:text-gold-600 transition-colors line-clamp-2 mb-2">
                      {productName}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-navy-900 mb-4">
                    ₹{product.price.toLocaleString('en-IN')}
                  </p>
                  <button
                    onClick={() => {
                      addToCart(product);
                      removeItem(product.id);
                    }}
                    disabled={!inStock}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium ${
                      inStock ? 'btn-primary' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <ShoppingBag size={18} />
                    {t('addToCart')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
