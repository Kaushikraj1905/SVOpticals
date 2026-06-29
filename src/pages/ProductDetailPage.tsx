import { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Share2, ArrowLeft, Star, Check, Truck, Shield, RotateCcw, Upload, View, ScanEye, Eye, Pill, Ruler, Palette, Weight, Award, Sparkles, ThumbsUp } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from '../components/products/ProductCard';

const Product3DViewer = lazy(() => import('../components/products/Product3DViewer'));

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [show3D, setShow3D] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [showPrescriptionUpload, setShowPrescriptionUpload] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const [showWishlistToast, setShowWishlistToast] = useState(false);
  const [showCartToast, setShowCartToast] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      // Increment view count
      await supabase.rpc('increment_view_count', { p_id: id });

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
          .eq('is_active', true)
          .limit(4);
        setRelatedProducts(related || []);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    setShowCartToast(true);
    setTimeout(() => setShowCartToast(false), 2000);
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      setShowToast('Removed from wishlist');
    } else {
      addToWishlist(product);
      setShowToast('Added to wishlist');
    }
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} from S V Opticals!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShowToast('Link copied to clipboard');
        setTimeout(() => setShowToast(null), 2000);
      }
    } catch {
      // ignored
    }
  };

  const handlePrescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !product || !user) return;

    setPrescriptionFile(file);
    try {
      const fileName = `prescriptions/${user.id}/${product.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('prescriptions')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = await supabase.storage
        .from('prescriptions')
        .getPublicUrl(fileName);

      await supabase.from('prescriptions').insert({
        user_id: user.id,
        product_id: product.id,
        file_url: urlData.publicUrl,
        file_name: file.name,
      });

      setShowToast('Prescription uploaded successfully');
      setTimeout(() => setShowToast(null), 2000);
      setShowPrescriptionUpload(false);
    } catch (error) {
      console.error('Error uploading prescription:', error);
      setShowToast('Failed to upload prescription');
      setTimeout(() => setShowToast(null), 2000);
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
  const stockQuantity = product.inventory?.quantity || 0;
  const discount = product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const inWishlist = isInWishlist(product.id);
  const isLens = product.category?.name?.toLowerCase().includes('lens') || product.category?.name?.toLowerCase().includes('prescription');
  const isFrame = product.category?.name?.toLowerCase().includes('frame') || product.tags?.includes('frames');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-navy-900 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-down">
          {showToast}
        </div>
      )}
      {showCartToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-down flex items-center gap-2">
          <Check size={18} />
          Added to cart!
        </div>
      )}

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
            <div className="bg-white rounded-xl overflow-hidden relative">
              <img
                src={images[selectedImage]}
                alt={productName}
                className="w-full aspect-square object-cover"
              />
              {/* 3D View Button */}
              <button
                onClick={() => setShow3D(true)}
                className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium text-navy-800 hover:bg-white transition-colors"
              >
                <View size={16} />
                View in 3D
              </button>
              {/* Try On Button */}
              {(isFrame || product.tags?.some(t => ['frames', 'sunglasses'].includes(t))) && (
                <Link
                  to={`/virtual-try-on?product=${product.id}`}
                  className="absolute bottom-4 left-4 bg-gold-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium hover:bg-gold-600 transition-colors"
                >
                  <ScanEye size={16} />
                  Try Before You Buy
                </Link>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? 'border-gold-500' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`${productName} ${index + 1}`} className="w-full h-full object-cover" />
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

            {/* Rating - Dynamic */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-gold-500" fill={i < (product.rating || 0) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">({product.rating || 0} - {product.review_count || 0} reviews)</span>
              <span className="text-sm text-gray-400">|</span>
              <span className="text-sm text-green-600 font-medium">{product.view_count || 0} views</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
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
            <div className={`inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-lg text-sm font-medium ${
              inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {inStock ? <Check size={16} /> : <Eye size={16} />}
              <span>{inStock ? 'In Stock' : 'Out of Stock'}</span>
              {stockQuantity > 0 && (
                <span className="text-green-600/70">({stockQuantity} available)</span>
              )}
              {stockQuantity <= 5 && stockQuantity > 0 && (
                <span className="text-orange-600 text-xs font-medium"> - Low stock!</span>
              )}
            </div>

            {/* Description */}
            {productDesc && (
              <p className="text-gray-600 mb-6 leading-relaxed">{productDesc}</p>
            )}

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold text-navy-900 mb-3 flex items-center gap-2">
                  <Sparkles size={18} className="text-gold-500" /> Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feature, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-3 py-1 rounded-full">
                      <Check size={12} /> {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Frame & Product Details */}
            <div className="mb-6 bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-navy-900 mb-3">Frame Details</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.frame_shape && (
                  <div className="text-sm">
                    <span className="text-gray-500 block text-xs">Frame Shape</span>
                    <span className="text-navy-800 font-medium">{product.frame_shape}</span>
                  </div>
                )}
                {product.material && (
                  <div className="text-sm">
                    <span className="text-gray-500 block text-xs">Material</span>
                    <span className="text-navy-800 font-medium">{product.material}</span>
                  </div>
                )}
                {product.gender && (
                  <div className="text-sm">
                    <span className="text-gray-500 block text-xs">Gender</span>
                    <span className="text-navy-800 font-medium">{product.gender}</span>
                  </div>
                )}
                {product.color && (
                  <div className="text-sm">
                    <span className="text-gray-500 block text-xs">Color</span>
                    <span className="text-navy-800 font-medium">{product.color}</span>
                  </div>
                )}
                {product.size && (
                  <div className="text-sm">
                    <span className="text-gray-500 block text-xs">Size</span>
                    <span className="text-navy-800 font-medium">{product.size}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="text-sm">
                    <span className="text-gray-500 block text-xs">Weight</span>
                    <span className="text-navy-800 font-medium">{product.weight}</span>
                  </div>
                )}
                {product.warranty && (
                  <div className="text-sm">
                    <span className="text-gray-500 block text-xs">Warranty</span>
                    <span className="text-navy-800 font-medium">{product.warranty}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-6 bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-navy-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-gray-500 capitalize block text-xs">{key.replace(/_/g, ' ')}</span>
                      <span className="text-navy-800 font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {product.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-navy-800 mb-2">Quantity</label>
              <div className="flex items-center border rounded-lg w-32">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  -
                </button>
                <span className="flex-1 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(stockQuantity || 99, q + 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                  inStock ? 'btn-primary' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingBag size={20} />
                Add to Cart
              </button>
              <button
                onClick={handleWishlistToggle}
                className={`p-3 rounded-lg border transition-colors ${
                  inWishlist ? 'border-red-500 text-red-500' : 'border-gray-300 text-gray-400 hover:border-red-500 hover:text-red-500'
                }`}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={24} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 rounded-lg border border-gray-300 text-gray-400 hover:border-gold-500 hover:text-gold-500 transition-colors"
                title="Share"
              >
                <Share2 size={24} />
              </button>
            </div>

            {/* Prescription Upload for lenses */}
            {isLens && (
              <div className="mb-6">
                <button
                  onClick={() => setShowPrescriptionUpload(!showPrescriptionUpload)}
                  className="flex items-center gap-2 text-sm text-navy-700 hover:text-gold-600 transition-colors"
                >
                  <Pill size={16} />
                  {showPrescriptionUpload ? 'Hide prescription upload' : 'Upload prescription'}
                </button>
                {showPrescriptionUpload && (
                  <div className="mt-3 border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePrescriptionUpload}
                      className="hidden"
                      id="prescription-upload"
                    />
                    <label htmlFor="prescription-upload" className="cursor-pointer">
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">{prescriptionFile ? prescriptionFile.name : 'Click to upload prescription'}</p>
                      <p className="text-xs text-gray-400 mt-1">Image or PDF</p>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Benefits */}
            <div className="flex flex-wrap gap-4 pt-4 border-t">
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

      {/* 3D Viewer Modal */}
      {show3D && (
        <Suspense fallback={
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        }>
          <Product3DViewer imageUrl={images[0]} onClose={() => setShow3D(false)} />
        </Suspense>
      )}
    </div>
  );
}
