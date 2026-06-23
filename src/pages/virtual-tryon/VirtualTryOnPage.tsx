import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Upload,
  SwitchCamera,
  Download,
  Share2,
  MessageCircle,
  ShoppingBag,
  Heart,
  X,
  ChevronLeft,
  ChevronRight,
  Loader,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { Product } from '../../types';

export default function VirtualTryOnPage() {
  const { t, language } = useLanguage();
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Face detection state
  const [facePosition, setFacePosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const animationRef = useRef<number>();

  // Frame categories
  const categories = ['frames-men', 'frames-women', 'frames-kids'];
  const [activeCategory, setActiveCategory] = useState('frames-men');

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
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
        .in('category_id', (await supabase
          .from('product_categories')
          .select('id')
          .or('slug.ilike.%frames%')).data?.map(c => c.id) || [])
        .limit(20);

      if (error) throw error;
      setProducts(data || []);
      if (data && data.length > 0) {
        setSelectedProduct(data[0]);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Camera functions
  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        detectFace();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied. Please allow camera access or upload a photo.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCameraActive(false);
  };

  // Face detection (simplified - would use TensorFlow.js/MediaPipe in production)
  const detectFace = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(detectFace);
      return;
    }

    const video = videoRef.current;
    const ctx = canvasRef.current.getContext('2d');

    if (!ctx) {
      animationRef.current = requestAnimationFrame(detectFace);
      return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw video frame
    ctx.save();
    ctx.translate(canvasRef.current.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.restore();

    // Simple face estimation (center of frame)
    setFacePosition({
      x: canvasRef.current.width / 2 - 80,
      y: canvasRef.current.height / 2 - 40,
      width: 160,
      height: 80,
    });

    animationRef.current = requestAnimationFrame(detectFace);
  }, []);

  // Upload image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setCameraActive(false);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Capture image
  const captureImage = () => {
    if (!canvasRef.current) return;

    setCapturing(true);
    const dataUrl = canvasRef.current.toDataURL('image/png');

    // Download
    const link = document.createElement('a');
    link.download = 'sv-opticals-tryon.png';
    link.href = dataUrl;
    link.click();
    setCapturing(false);
  };

  // Share to WhatsApp
  const shareToWhatsApp = () => {
    if (!selectedProduct) return;

    const productName = language === 'te' && selectedProduct.name_te ? selectedProduct.name_te : selectedProduct.name;
    const message = `I tried ${productName} virtually at S V Opticals website.

See the world through us!

Visit: ${window.location.origin}/products/${selectedProduct.id}

I'm interested in this frame. Please provide more details.`;

    const whatsappUrl = `https://wa.me/919441273074?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Filter products by category
  const filteredProducts = products.filter(p => p.category?.slug === activeCategory);

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const frameStyles = [
    { name: 'Classic Rectangle', ratio: 1.8 },
    { name: 'Round', ratio: 1.4 },
    { name: 'Aviator', ratio: 1.6 },
    { name: 'Cat Eye', ratio: 1.5 },
    { name: 'Square', ratio: 1.3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Virtual Try-On
          </h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Try before you buy! Use our virtual try-on feature to see how frames look on you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Try-On Area */}
          <div className="lg:col-span-2">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-center gap-3">
                <AlertCircle className="text-red-500" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Camera/Upload Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative aspect-[4/3] bg-gray-900">
                {/* Video Feed */}
                <video
                  ref={videoRef}
                  className={`absolute inset-0 w-full h-full object-cover ${cameraActive ? '' : 'hidden'}`}
                  playsInline
                  muted
                />

                {/* Canvas Overlay */}
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={480}
                  className={`absolute inset-0 w-full h-full ${cameraActive ? '' : 'hidden'}`}
                />

                {/* Uploaded Image */}
                {uploadedImage && !cameraActive && (
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}

                {/* Frame Overlay */}
                {selectedProduct && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <svg
                      viewBox="0 0 200 100"
                      className="w-1/2 max-w-xs"
                      style={{ transform: 'translateY(-10%)' }}
                    >
                      {/* Frame Left */}
                      <rect x="10" y="25" width="70" height="50" rx="10" fill="none" stroke="#1e3a5f" strokeWidth="4" />
                      {/* Frame Right */}
                      <rect x="120" y="25" width="70" height="50" rx="10" fill="none" stroke="#1e3a5f" strokeWidth="4" />
                      {/* Bridge */}
                      <path d="M80 50 Q100 45 120 50" fill="none" stroke="#1e3a5f" strokeWidth="3" />
                      {/* Temples */}
                      <line x1="10" y1="35" x2="0" y2="30" stroke="#1e3a5f" strokeWidth="3" />
                      <line x1="190" y1="35" x2="200" y2="30" stroke="#1e3a5f" strokeWidth="3" />
                      {/* Lens Shine */}
                      <ellipse cx="35" cy="45" rx="20" ry="15" fill="url(#goldGlow)" opacity="0.2" />
                      <ellipse cx="155" cy="45" rx="20" ry="15" fill="url(#goldGlow)" opacity="0.2" />
                      <defs>
                        <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#d4a853" />
                          <stop offset="100%" stopColor="transparent" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>
                )}

                {/* Placeholder */}
                {!cameraActive && !uploadedImage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <Camera size={64} className="mb-4" />
                    <p className="text-lg">Start camera or upload a photo</p>
                  </div>
                )}

                {/* Loading */}
                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader className="animate-spin text-white" size={40} />
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 flex flex-wrap gap-3 justify-center border-t">
                {!cameraActive && !uploadedImage ? (
                  <>
                    <button
                      onClick={startCamera}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Camera size={20} />
                      Start Camera
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-outline flex items-center gap-2"
                    >
                      <Upload size={20} />
                      Upload Photo
                    </button>
                  </>
                ) : (
                  <>
                    {cameraActive && (
                      <button
                        onClick={captureImage}
                        disabled={capturing}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Download size={20} />
                        {capturing ? 'Saving...' : 'Save Screenshot'}
                      </button>
                    )}
                    <button
                      onClick={shareToWhatsApp}
                      className="bg-green-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-green-700"
                    >
                      <MessageCircle size={20} />
                      Share to WhatsApp
                    </button>
                    <button
                      onClick={() => {
                        stopCamera();
                        setUploadedImage(null);
                      }}
                      className="btn-outline flex items-center gap-2"
                    >
                      <SwitchCamera size={20} />
                      New Photo
                    </button>
                  </>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Current Frame Info */}
            {selectedProduct && (
              <div className="mt-4 bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gold-600 font-medium uppercase">
                      {selectedProduct.brand?.name}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-navy-900">
                      {language === 'te' && selectedProduct.name_te ? selectedProduct.name_te : selectedProduct.name}
                    </h3>
                    <p className="text-2xl font-bold text-navy-900 mt-2">
                      ₹{selectedProduct.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToWishlist(selectedProduct)}
                      className={`p-3 rounded-lg border ${
                        isInWishlist(selectedProduct.id)
                          ? 'border-red-500 text-red-500'
                          : 'border-gray-300'
                      }`}
                    >
                      <Heart size={24} fill={isInWishlist(selectedProduct.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={() => addToCart(selectedProduct)}
                      className="btn-primary flex items-center gap-2"
                    >
                      <ShoppingBag size={20} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Frame Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h2 className="font-display text-lg font-semibold text-navy-900 mb-4">
                Select Frame
              </h2>

              {/* Category Tabs */}
              <div className="flex gap-2 mb-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      activeCategory === cat
                        ? 'bg-navy-900 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {cat.split('-')[1]?.charAt(0).toUpperCase() + cat.split('-')[1]?.slice(1)}
                  </button>
                ))}
              </div>

              {/* Frame List */}
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full p-3 rounded-lg flex items-center gap-3 transition-all ${
                      selectedProduct?.id === product.id
                        ? 'bg-navy-100 border-2 border-gold-500'
                        : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                    }`}
                  >
                    <div className="w-12 h-12 bg-white rounded-lg overflow-hidden">
                      <img
                        src={product.image_urls?.[0] || 'https://via.placeholder.com/48'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-navy-900 text-sm line-clamp-1">
                        {language === 'te' && product.name_te ? product.name_te : product.name}
                      </p>
                      <p className="text-xs text-gray-500">{product.brand?.name}</p>
                    </div>
                    <p className="text-sm font-semibold text-navy-900">
                      ₹{product.price.toLocaleString('en-IN')}
                    </p>
                  </button>
                ))}
              </div>

              {/* View All Button */}
              <Link
                to={`/products?category=${activeCategory}`}
                className="block text-center mt-4 py-2 text-gold-600 hover:text-gold-700 font-medium"
              >
                View All Frames
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
