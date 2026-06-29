import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, RotateCw, ZoomIn, ZoomOut, Share2, ShoppingCart, X, Sparkles, CameraOff, Camera as CameraIcon } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { supabase } from '../../lib/supabase';
import html2canvas from 'html2canvas';

interface FrameModel {
  id: string;
  name: string;
  image_url: string;
  product_id: string;
}

export default function VirtualTryOnPage() {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureAreaRef = useRef<HTMLDivElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [frames, setFrames] = useState<FrameModel[]>([]);
  const [selectedFrame, setSelectedFrame] = useState<FrameModel | null>(null);
  const [frameScale, setFrameScale] = useState(1);
  const [frameRotation, setFrameRotation] = useState(0);
  const [framePosition, setFramePosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(true);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showFrameAdded, setShowFrameAdded] = useState(false);

  // Fetch frame products
  useEffect(() => {
    const fetchFrames = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name, image_urls, sku')
          .eq('is_active', true)
          .limit(12);

        if (error) throw error;

        const frameModels = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          image_url: p.image_urls?.[0] || 'https://images.pexels.com/photos/7018515/pexels-photo-7018515.jpeg?auto=compress&cs=tinysrgb&w=400',
          product_id: p.id,
        }));
        setFrames(frameModels);
        if (frameModels.length > 0) setSelectedFrame(frameModels[0]);
      } catch (error) {
        console.error('Error fetching frames:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFrames();
  }, []);

  // Start camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setUploadedImage(null);
      }
    } catch (err: any) {
      setCameraError(err.message || 'Could not access camera');
      setCameraActive(false);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Upload selfie
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - framePosition.x, y: e.clientY - framePosition.y });
  };
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    setFramePosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, dragStart]);
  const handleMouseUp = () => setIsDragging(false);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - framePosition.x, y: touch.clientY - framePosition.y });
  };
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setFramePosition({ x: touch.clientX - dragStart.x, y: touch.clientY - dragStart.y });
  }, [isDragging, dragStart]);
  const handleTouchEnd = () => setIsDragging(false);

  // Take screenshot
  const takeScreenshot = async () => {
    if (!captureAreaRef.current) return;
    try {
      const canvas = await html2canvas(captureAreaRef.current, {
        useCORS: true,
        allowTaint: true,
      });
      const link = document.createElement('a');
      link.download = `sv-opticals-tryon-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Screenshot error:', error);
    }
  };

  // Share via WhatsApp
  const shareWhatsApp = () => {
    const text = `Check out this amazing frame from S V Opticals! ${selectedFrame?.name || 'Virtual Try-On'}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Add to cart
  const addToCart = async () => {
    if (!selectedFrame) return;
    try {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', selectedFrame.product_id)
        .single();
      if (data) {
        await addItem(data, 1);
        setShowFrameAdded(true);
        setTimeout(() => setShowFrameAdded(false), 3000);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const displayImage = uploadedImage || (cameraActive ? undefined : null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-white hover:text-gold-400 transition-colors">
              <ArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Store</span>
            </Link>
            <h1 className="font-display text-xl md:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="text-gold-400" size={24} />
              Virtual Try-On
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Camera / Upload Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Camera Controls */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={cameraActive ? stopCamera : startCamera}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  cameraActive ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-navy-800 text-white hover:bg-navy-900'
                }`}
              >
                {cameraActive ? <CameraOff size={18} /> : <CameraIcon size={18} />}
                {cameraActive ? 'Stop Camera' : 'Start Camera'}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-navy-800 text-navy-800 rounded-lg font-medium hover:bg-navy-50 transition-colors"
              >
                <Upload size={18} />
                Upload Selfie
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </div>

            {cameraError && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                Camera error: {cameraError}. Please try uploading a selfie instead.
              </div>
            )}

            {/* Capture Area */}
            <div
              ref={captureAreaRef}
              className="relative bg-black rounded-xl overflow-hidden aspect-[4/3] flex items-center justify-center"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {cameraActive ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              ) : uploadedImage ? (
                <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-white/60">
                  <Camera size={64} className="mx-auto mb-4" />
                  <p className="text-lg">Start camera or upload a selfie to try on frames</p>
                </div>
              )}

              {/* Frame Overlay */}
              {selectedFrame && (cameraActive || uploadedImage) && (
                <div
                  className="absolute cursor-move"
                  style={{
                    left: `calc(50% + ${framePosition.x}px)`,
                    top: `calc(45% + ${framePosition.y}px)`,
                    transform: `translate(-50%, -50%) scale(${frameScale}) rotate(${frameRotation}deg)`,
                  }}
                  onMouseDown={handleMouseDown}
                  onTouchStart={handleTouchStart}
                >
                  <img
                    src={selectedFrame.image_url}
                    alt="Frame"
                    className="w-64 h-24 object-contain"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
                    crossOrigin="anonymous"
                  />
                </div>
              )}
            </div>

            {/* Frame Controls */}
            {(cameraActive || uploadedImage) && selectedFrame && (
              <div className="flex items-center gap-3 bg-white rounded-xl p-4 shadow-sm">
                <span className="text-sm font-medium text-gray-500">Frame Controls:</span>
                <button
                  onClick={() => setFrameScale(s => Math.max(0.5, s - 0.1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Zoom Out"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="text-sm font-medium w-12 text-center">{(frameScale * 100).toFixed(0)}%</span>
                <button
                  onClick={() => setFrameScale(s => Math.min(2, s + 0.1))}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Zoom In"
                >
                  <ZoomIn size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300" />
                <button
                  onClick={() => setFrameRotation(r => r - 5)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Rotate Left"
                >
                  <RotateCw size={18} className="transform -scale-x-100" />
                </button>
                <span className="text-sm font-medium w-12 text-center">{frameRotation}°</span>
                <button
                  onClick={() => setFrameRotation(r => r + 5)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  title="Rotate Right"
                >
                  <RotateCw size={18} />
                </button>
                <div className="w-px h-6 bg-gray-300" />
                <button
                  onClick={() => { setFramePosition({ x: 0, y: 0 }); setFrameScale(1); setFrameRotation(0); }}
                  className="p-2 hover:bg-gray-100 rounded-lg text-sm font-medium"
                  title="Reset"
                >
                  Reset
                </button>
              </div>
            )}

            {/* Actions */}
            {(cameraActive || uploadedImage) && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={takeScreenshot}
                  className="flex items-center gap-2 px-4 py-2 bg-navy-800 text-white rounded-lg hover:bg-navy-900 transition-colors"
                >
                  <CameraIcon size={18} />
                  Save Screenshot
                </button>
                <button
                  onClick={() => setShowShare(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Share2 size={18} />
                  Share on WhatsApp
                </button>
                <button
                  onClick={addToCart}
                  className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors"
                >
                  <ShoppingCart size={18} />
                  Add Frame to Cart
                </button>
              </div>
            )}

            {showFrameAdded && (
              <div className="bg-green-50 text-green-600 px-4 py-3 rounded-lg text-sm animate-fade-in">
                Frame added to cart! <Link to="/cart" className="underline font-medium">View Cart</Link>
              </div>
            )}
          </div>

          {/* Frame Selection Sidebar */}
          <div className="space-y-4">
            <h3 className="font-display text-lg font-semibold text-navy-900">Select Frame</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800" />
                </div>
              ) : (
                frames.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      selectedFrame?.id === frame.id
                        ? 'border-gold-500 bg-gold-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={frame.image_url} alt={frame.name} className="w-16 h-12 object-cover rounded-lg" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-navy-900 line-clamp-1">{frame.name}</p>
                      <p className="text-xs text-gray-500">Virtual Try-On</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShare && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold">Share via WhatsApp</h3>
              <button onClick={() => setShowShare(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">Share your virtual try-on with friends and family.</p>
            <div className="space-y-3">
              <button
                onClick={shareWhatsApp}
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
              >
                <Share2 size={18} />
                Share on WhatsApp
              </button>
              <button
                onClick={takeScreenshot}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <CameraIcon size={18} />
                Download Screenshot First
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
