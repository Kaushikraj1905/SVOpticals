import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguage as useLang } from '../contexts/LanguageContext';

export default function CartPage() {
  const { t, language } = useLanguage();
  const { items, removeItem, updateQuantity, subtotal, gstAmount, total, clearCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} className="text-navy-400" />
            </div>
            <h1 className="font-display text-2xl font-bold text-navy-900 mb-4">
              {t('emptyCart')}
            </h1>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              {t('continueShopping')}
              <ArrowRight size={20} />
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
            {t('yourCart')}
          </h1>
          <p className="text-gray-300">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const productName = language === 'te' && item.product.name_te ? item.product.name_te : item.product.name;
              const productImage = item.product.image_urls?.[0] || 'https://images.pexels.com/photos/7018515/pexels-photo-7018515.jpeg?auto=compress&cs=tinysrgb&w=200';

              return (
                <div key={item.product.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                  <div className="flex gap-4">
                    {/* Image */}
                    <Link to={`/products/${item.product.id}`} className="flex-shrink-0">
                      <img
                        src={productImage}
                        alt={productName}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg"
                      />
                    </Link>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${item.product.id}`}>
                        <h3 className="font-medium text-navy-900 hover:text-gold-600 transition-colors line-clamp-2">
                          {productName}
                        </h3>
                      </Link>
                      {item.product.brand && (
                        <p className="text-sm text-gray-500 mt-1">{item.product.brand.name}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">SKU: {item.product.sku}</p>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity */}
                        <div className="flex items-center border rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="font-bold text-navy-900">
                            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                          {item.product.mrp > item.product.price && (
                            <p className="text-sm text-gray-500 line-through">
                              ₹{(item.product.mrp * item.quantity).toLocaleString('en-IN')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart */}
            <button
              onClick={clearCart}
              className="text-red-500 hover:text-red-600 font-medium text-sm"
            >
              Clear Cart
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('subtotal')}</span>
                  <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('gst')} (18%)</span>
                  <span className="font-medium">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <hr />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-navy-900">{t('total')}</span>
                  <span className="font-bold text-navy-900">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link to="/checkout" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
                {t('proceedToCheckout')}
                <ArrowRight size={20} />
              </Link>

              <Link to="/products" className="btn-outline w-full mt-3 flex items-center justify-center">
                {t('continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
