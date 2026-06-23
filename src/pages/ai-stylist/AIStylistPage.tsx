import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  Camera,
  Sparkles,
  ShoppingCart,
  Heart,
  CheckCircle,
  X,
  Loader,
  RotateCcw,
  Share2,
  MessageCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { Product } from '../../types';

interface FaceAnalysis {
  shape: 'round' | 'oval' | 'square' | 'heart' | 'diamond';
  confidence: number;
  recommendations: Recommendation[];
}

interface Recommendation {
  product: Product;
  confidence: number;
  reason: string;
  styleType: string;
}

const faceShapeDescriptions = {
  round: {
    en: 'Your face has soft angles with similar width and length. Angular and rectangular frames will add definition.',
    te: 'మీ ముఖానికి మృదువైన కోణాలు ఉన్నాయి. కోణ మరియు దీర్ఘచతురస్ర ఫ్రేమ్‌లు మీకు సరిపోతాయి.',
  },
  oval: {
    en: 'You have a balanced face shape with slightly wider cheekbones. Almost any frame style suits you!',
    te: 'మీరు సమతుల్యమైన ముఖాకృతి కలిగి ఉన్నారు. దాదాపు అన్ని ఫ్రేమ్ శైలీలు మీకు సరిపోతాయి!',
  },
  square: {
    en: 'Your face has strong jawline and forehead. Round or oval frames will soften your features.',
    te: 'మీ ముఖానికి బలమైన దవడ ఉంది. వృత్తాకార లేదా అండాకార ఫ్రేమ్‌లు మీ లక్షణాలను మెరుగుపరుస్తాయి.',
  },
  heart: {
    en: 'Your face is wider at the forehead and narrows at the chin. Bottom-heavy frames balance your features.',
    te: 'మీ ముఖం నుదుట వైపు వెడల్పుగా మరియు గడ్డం వైపు చిన్నదిగా ఉంది. క్రింద వైపు బరువుగా ఉండే ఫ్రేమ్‌లు సరిపోతాయి.',
  },
  diamond: {
    en: 'Your face has narrow forehead and jawline with wide cheekbones. Cat-eye or oval frames highlight your cheekbones.',
    te: 'మీ ముఖానికి చిన్న నుదుటు మరియు దవడ ఉన్నాయి. క్యాట్-ఐ లేదా అండాకార ఫ్రేమ్‌లు సరిపోతాయి.',
  },
};

const styleCategories = [
  { id: 'professional', en: 'Professional', te: 'ప్రొఫెషనల్' },
  { id: 'casual', en: 'Casual', te: 'క్యాజువల్' },
  { id: 'premium', en: 'Premium', te: 'ప్రీమియం' },
  { id: 'fashion', en: 'Fashion', te: 'ఫ్యాషన్' },
  { id: 'lightweight', en: 'Lightweight', te: 'తేలికైనది' },
];

export default function AIStylistPage() {
  const { t, language } = useLanguage();
  const { addItem: addToCart } = useCart();
  const { addItem: addToWishlist, isInWishlist } = useWishlist();

  // State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<FaceAnalysis | null>(null);
  const [preferences, setPreferences] = useState({
    gender: '',
    ageGroup: '',
    style: '',
  });
  const [showPreferences, setShowPreferences] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Analyze face (simulated AI - would use TensorFlow.js/MediaPipe in production)
  const analyzeFace = async () => {
    if (!uploadedImage) return;

    setAnalyzing(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulated face shape detection
    const shapes = ['round', 'oval', 'square', 'heart', 'diamond'];
    const detectedShape = shapes[Math.floor(Math.random() * shapes.length)] as FaceAnalysis['shape'];

    // Fetch recommended products
    try {
      const { data: products } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:product_categories(*),
          inventory(*)
        `)
        .eq('is_active', true)
        .limit(12);

      // Generate recommendations based on face shape
      const recommendations: Recommendation[] = (products || [])
        .map((product, index) => {
          const confidence = Math.random() * 0.3 + 0.6; // 60-90%
          return {
            product,
            confidence,
            reason: getRecommendationReason(detectedShape, product),
            styleType: styleCategories[Math.floor(Math.random() * 5)].id,
          };
        })
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 6);

      setAnalysis({
        shape: detectedShape,
        confidence: Math.random() * 0.2 + 0.75,
        recommendations,
      });
      setShowPreferences(false);
    } catch (error) {
      console.error('Error analyzing face:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getRecommendationReason = (shape: string, product: Product): string => {
    const reasons: Record<string, string[]> = {
      round: [
        'Angular design adds definition to soft curves',
        'Rectangular shape elongates face',
        'Higher temples create vertical illusion',
        'Bold corners add structure',
      ],
      oval: [
        'Perfectly balanced for your face',
        'Complements your natural proportions',
        'Enhances your symmetrical features',
        'Ideal for versatile styling',
      ],
      square: [
        'Rounded edges soften facial angles',
        'Oval shape complements strong jawline',
        'Thin frames balance prominent features',
        'Curved design harmonizes with bone structure',
      ],
      heart: [
        'Bottom-heavy frame adds width to chin area',
        'Light rimless design draws attention up',
        'Low temples balance wider forehead',
        'Butterfly shape complements your features',
      ],
      diamond: [
        'Cat-eye highlights cheekbones',
        'Brow bar draws attention to eyes',
        'Oval shape balances angles',
        'Decorated temples add width at jawline',
      ],
    };

    const shapeReasons = reasons[shape] || reasons.oval;
    return shapeReasons[Math.floor(Math.random() * shapeReasons.length)];
  };

  const shareToWhatsApp = () => {
    if (!analysis || analysis.recommendations.length === 0) return;

    const topPick = analysis.recommendations[0];
    const productName = language === 'te' && topPick.product.name_te ? topPick.product.name_te : topPick.product.name;

    const message = `I used the AI Stylist at S V Opticals!

Face Shape: ${analysis.shape.charAt(0).toUpperCase() + analysis.shape.slice(1)}
Recommended Frame: ${productName}
Confidence: ${Math.round(topPick.confidence * 100)}%

Reason: ${topPick.reason}

I'd like to try this frame. Can you help?`;

    const whatsappUrl = `https://wa.me/919441273074?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const reset = () => {
    setUploadedImage(null);
    setAnalysis(null);
    setShowPreferences(true);
    setPreferences({
      gender: '',
      ageGroup: '',
      style: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-purple-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-gold-400" size={32} />
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              AI Stylist Assistant
            </h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Upload your photo and let our AI analyze your face shape to recommend the perfect frames for you.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column - Upload & Analysis */}
          <div className="space-y-6">
            {/* Upload Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-4">
                {t('uploadPrescription') === 'Upload Prescription' ? 'Upload Your Photo' : 'మీ ఫోటో అప్‌లోడ్ చేయండి'}
              </h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all"
              >
                {uploadedImage ? (
                  <div className="relative">
                    <img
                      src={uploadedImage}
                      alt="Uploaded"
                      className="w-48 h-48 mx-auto rounded-xl object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        reset();
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
                      <Camera size={40} className="text-purple-500" />
                    </div>
                    <p className="text-gray-600">
                      {language === 'te' ? 'ఫోటో అప్‌లోడ్ చేయడానికి క్లిక్ చేయండి' : 'Click to upload your photo'}
                    </p>
                    <p className="text-sm text-gray-400">
                      JPG, PNG only
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Preferences */}
              {uploadedImage && showPreferences && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-medium text-navy-900">
                    {language === 'te' ? 'మీ ప్రాధాన్యతలు' : 'Your Preferences'}
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        {language === 'te' ? 'లింగం' : 'Gender'}
                      </label>
                      <select
                        value={preferences.gender}
                        onChange={(e) => setPreferences({ ...preferences, gender: e.target.value })}
                        className="input-field"
                      >
                        <option value="">{language === 'te' ? 'ఎంచుకోండి' : 'Select'}</option>
                        <option value="male">{language === 'te' ? 'పురుషుడు' : 'Male'}</option>
                        <option value="female">{language === 'te' ? 'మహిళ' : 'Female'}</option>
                        <option value="other">{language === 'te' ? 'ఇతర' : 'Other'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        {language === 'te' ? 'వయస్సు' : 'Age Group'}
                      </label>
                      <select
                        value={preferences.ageGroup}
                        onChange={(e) => setPreferences({ ...preferences, ageGroup: e.target.value })}
                        className="input-field"
                      >
                        <option value="">{language === 'te' ? 'ఎంచుకోండి' : 'Select'}</option>
                        <option value="child">{language === 'te' ? 'పిల్లలు (0-12)' : 'Child (0-12)'}</option>
                        <option value="teen">{language === 'te' ? 'టీనేజర్ (13-19)' : 'Teen (13-19)'}</option>
                        <option value="young-adult">{language === 'te' ? 'యువ వయోజన (20-35)' : 'Young Adult (20-35)'}</option>
                        <option value="adult">{language === 'te' ? 'వయోజన (36-50)' : 'Adult (36-50)'}</option>
                        <option value="senior">{language === 'te' ? 'సీనియర్ (50+)' : 'Senior (50+)'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      {language === 'te' ? 'ప్రిఫర్డ్ శైలి' : 'Preferred Style'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {styleCategories.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setPreferences({ ...preferences, style: style.id })}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            preferences.style === style.id
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {language === 'te' ? style.te : style.en}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Analyze Button */}
              {uploadedImage && !analysis && (
                <button
                  onClick={analyzeFace}
                  disabled={analyzing}
                  className="w-full btn-primary mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {analyzing ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      {language === 'te' ? 'విశ్లేషిస్తోంది...' : 'Analyzing...'}
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      {language === 'te' ? 'AI విశ్లేషించండి' : 'Analyze with AI'}
                    </>
                  )}
                </button>
              )}

              {/* Reset */}
              {analysis && (
                <button
                  onClick={reset}
                  className="w-full btn-outline mt-4 flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} />
                  {language === 'te' ? 'కొత్త ఫోటో' : 'Try New Photo'}
                </button>
              )}
            </div>

            {/* Face Shape Result */}
            {analysis && (
              <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={24} />
                  <h3 className="font-display text-xl font-bold">
                    {language === 'te' ? 'ముఖ ఆకారం గుర్తించబడింది' : 'Face Shape Detected'}
                  </h3>
                </div>

                <div className="bg-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold capitalize">{analysis.shape}</span>
                    <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                      {Math.round(analysis.confidence * 100)}% {language === 'te' ? 'విశ్వాసం' : 'confidence'}
                    </span>
                  </div>
                  <p className="text-sm text-white/80">
                    {faceShapeDescriptions[analysis.shape]?.[language] || faceShapeDescriptions[analysis.shape]?.en}
                  </p>
                </div>

                <button
                  onClick={shareToWhatsApp}
                  className="w-full mt-4 bg-white text-purple-600 py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-purple-50"
                >
                  <MessageCircle size={20} />
                  {language === 'te' ? 'వాట్సాప్‌లో సూచనలను పంపు' : 'Share on WhatsApp'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Recommendations */}
          <div>
            {analysis ? (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="font-display text-xl font-semibold text-navy-900 mb-6">
                  {language === 'te' ? 'మీకు సిఫార్సు చేసిన ఫ్రేమ్‌లు' : 'Recommended Frames'}
                </h2>

                <div className="space-y-4">
                  {analysis.recommendations.map((rec, index) => {
                    const product = rec.product;
                    const productName = language === 'te' && product.name_te ? product.name_te : product.name;

                    return (
                      <div
                        key={product.id}
                        className={`p-4 rounded-xl border-2 ${
                          index === 0 ? 'border-gold-500 bg-gold-50' : 'border-gray-100'
                        }`}
                      >
                        {index === 0 && (
                          <span className="text-xs bg-gold-500 text-navy-900 px-2 py-0.5 rounded-full font-medium mb-2 inline-block">
                            Top Pick
                          </span>
                        )}

                        <div className="flex gap-4">
                          <Link to={`/products/${product.id}`} className="flex-shrink-0">
                            <img
                              src={product.image_urls?.[0] || 'https://via.placeholder.com/80'}
                              alt={product.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gold-600 font-medium">
                              {product.brand?.name}
                            </p>
                            <Link to={`/products/${product.id}`}>
                              <h4 className="font-semibold text-navy-900 hover:text-gold-600 line-clamp-1">
                                {productName}
                              </h4>
                            </Link>
                            <p className="text-sm text-green-600 font-medium mt-1">
                              {Math.round(rec.confidence * 100)}% match
                            </p>
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {rec.reason}
                            </p>
                          </div>

                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-navy-900">
                              ₹{product.price.toLocaleString('en-IN')}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => addToWishlist(product)}
                                className={`p-2 rounded-lg border ${
                                  isInWishlist(product.id)
                                    ? 'border-red-500 text-red-500'
                                    : 'border-gray-200 hover:border-red-400'
                                }`}
                              >
                                <Heart size={16} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                              </button>
                              <button
                                onClick={() => addToCart(product)}
                                className="p-2 bg-navy-800 text-white rounded-lg hover:bg-navy-900"
                              >
                                <ShoppingCart size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  to="/virtual-try-on"
                  className="block mt-6 text-center py-3 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200"
                >
                  <Camera size={18} className="inline mr-2" />
                  {language === 'te' ? 'వర్చువల్ ట్రై-ఆన్' : 'Try These Frames Virtually'}
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Sparkles size={64} className="mx-auto text-purple-200 mb-4" />
                <h3 className="text-xl font-semibold text-navy-900 mb-2">
                  {language === 'te' ? 'మీ వ్యక్తిగత సిఫార్సులు' : 'Your Personalized Recommendations'}
                </h3>
                <p className="text-gray-500">
                  {language === 'te'
                    ? 'మీ ఫోటో అప్‌లోడ్ చేసి AI విశ్లేషణ పొందండి'
                    : 'Upload your photo and get AI-powered frame recommendations'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
