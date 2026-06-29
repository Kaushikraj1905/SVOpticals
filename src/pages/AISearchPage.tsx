import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Loader, ArrowRight, Wand2, Eye, ShoppingCart, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Product } from '../types';

interface AIResult {
  recommended: Array<Product & { aiScore: number; reasons: string[] }>;
  similar: Array<Product & { aiScore: number; reasons: string[] }>;
  keywords: string[];
  query: string;
}

const examples = [
  'I want lightweight office glasses',
  'I need blue cut computer glasses',
  'I want round sunglasses',
  'Show me titanium frames for men',
  'I need progressive lenses',
  'Find me daily disposable contact lenses',
  'I want cat eye sunglasses for women',
  'Looking for sports eyewear',
  'I need photochromic lenses',
  'Show me kids durable frames',
];

export default function AISearchPage() {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:product_categories(*),
          inventory(*)
        `)
        .eq('is_active', true);

      if (error) throw error;
      setAllProducts(data || []);
      setProductsLoaded(true);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || !productsLoaded) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ query, products: allProducts }),
      });

      if (!response.ok) {
        // Fallback: local search if edge function fails
        const fallbackResults = localSearch(query, allProducts);
        setResult(fallbackResults);
        return;
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      // Fallback: local search
      const fallbackResults = localSearch(query, allProducts);
      setResult(fallbackResults);
    } finally {
      setLoading(false);
    }
  };

  const localSearch = (searchQuery: string, products: Product[]): AIResult => {
    const keywords = searchQuery.toLowerCase()
      .replace(/i want |i need |looking for |show me |find |give me /gi, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

    const scored = products.map((product) => {
      let score = 0;
      const reasons: string[] = [];
      const allText = [
        product.name?.toLowerCase() || '',
        product.description?.toLowerCase() || '',
        product.brand?.name?.toLowerCase() || '',
        product.category?.name?.toLowerCase() || '',
        ...(product.search_keywords || []).map(k => k.toLowerCase()),
        ...(product.tags || []).map(t => t.toLowerCase()),
      ].join(' ');

      for (const keyword of keywords) {
        if (allText.includes(keyword)) {
          score += 10;
          reasons.push('Matches your search terms');
        }
        if (product.category?.name?.toLowerCase().includes(keyword)) {
          score += 8;
        }
        if (product.popularity > 50) {
          score += 3;
          reasons.push('Popular choice');
        }
        if (product.inventory?.quantity > 0) {
          score += 2;
          reasons.push('Available in stock');
        }
      }
      reasons.push(...new Set(reasons));
      return { ...product, aiScore: score, reasons: [...new Set(reasons)] };
    });

    scored.sort((a, b) => b.aiScore - a.aiScore);
    const topResults = scored.filter(p => p.aiScore > 0).slice(0, 8);
    const similarProducts = scored.filter(p => p.aiScore > 0 && p.aiScore < (topResults[0]?.aiScore || 0)).slice(0, 4);

    return {
      query: searchQuery,
      keywords,
      recommended: topResults,
      similar: similarProducts,
    };
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const handleAddToCart = async (product: Product) => {
    await addToCart(product, 1);
    setShowToast('Added to cart');
    setTimeout(() => setShowToast(null), 2000);
  };

  const handleAddToWishlist = (product: Product) => {
    addToWishlist(product);
    setShowToast('Added to wishlist');
    setTimeout(() => setShowToast(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-navy-900 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-down">
          {showToast}
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-purple-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="text-gold-400" size={32} />
            <h1 className="font-display text-3xl md:text-4xl font-bold">AI Product Search</h1>
          </div>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg mb-8">
            Describe what you need in natural language, and our AI will find the perfect products for you.
          </p>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative">
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-lg overflow-hidden">
              <Search size={20} className="text-gray-400 ml-4" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., 'I want lightweight office glasses'"
                className="flex-1 py-4 px-2 text-navy-900 placeholder-gray-400 outline-none bg-transparent"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-gold-500 text-white px-6 py-4 font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? <Loader className="animate-spin" size={18} /> : <Wand2 size={18} />}
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Examples */}
      {!result && !loading && (
        <div className="container mx-auto px-4 py-12">
          <h2 className="font-display text-xl font-semibold text-navy-900 mb-6 text-center">Try These Examples</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl mx-auto">
            {examples.map((example) => (
              <button
                key={example}
                onClick={() => handleExampleClick(example)}
                className="text-sm bg-white border border-gray-200 rounded-lg px-4 py-3 text-gray-600 hover:border-gold-500 hover:text-navy-800 transition-colors text-left"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Loader className="animate-spin text-gold-500" size={32} />
            <span className="text-navy-800 font-medium text-lg">AI is analyzing your request...</span>
          </div>
          <p className="text-gray-500">Understanding natural language, matching features, and ranking products</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="container mx-auto px-4 py-8">
          {/* Understanding */}
          <div className="bg-white rounded-xl p-4 mb-8 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Sparkles size={16} className="text-gold-500" />
              <span>AI understood: <span className="font-medium text-navy-800">{result.query}</span></span>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {result.keywords.map((kw) => (
                <span key={kw} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Recommended Products */}
          {result.recommended.length > 0 ? (
            <div className="mb-12">
              <h2 className="font-display text-2xl font-semibold text-navy-900 mb-2 flex items-center gap-2">
                <Wand2 size={24} className="text-gold-500" />
                Recommended Products
              </h2>
              <p className="text-gray-500 mb-6">Based on your natural language description</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.recommended.map((product, index) => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 transition-all hover:shadow-lg ${
                      index === 0 ? 'border-gold-500' : 'border-transparent'
                    }`}
                  >
                    {index === 0 && (
                      <div className="bg-gold-500 text-white text-xs font-medium px-3 py-1 text-center">
                        Best Match
                      </div>
                    )}
                    <div className="relative group">
                      <Link to={`/products/${product.id}`}>
                        <img
                          src={product.image_urls?.[0] || 'https://images.pexels.com/photos/7018515/pexels-photo-7018515.jpeg?auto=compress&cs=tinysrgb&w=400'}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                        />
                      </Link>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </div>
                    <div className="p-4">
                      <Link to={`/products/${product.id}`}>
                        <p className="text-xs text-gold-600 font-medium">{product.brand?.name}</p>
                        <h3 className="font-semibold text-navy-900 line-clamp-2 hover:text-gold-600 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-bold text-navy-900">₹{product.price.toLocaleString('en-IN')}</span>
                        {product.mrp > product.price && (
                          <span className="text-sm text-gray-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                      {/* Reasons */}
                      <div className="mt-3 space-y-1">
                        {product.reasons?.slice(0, 3).map((reason, i) => (
                          <div key={i} className="flex items-center gap-1 text-xs text-green-600">
                            <ArrowRight size={12} />
                            {reason}
                          </div>
                        ))}
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 flex items-center justify-center gap-1 bg-navy-800 text-white py-2 rounded-lg text-sm font-medium hover:bg-navy-900 transition-colors"
                        >
                          <ShoppingCart size={14} />
                          Add
                        </button>
                        <button
                          onClick={() => handleAddToWishlist(product)}
                          className="p-2 border border-gray-200 rounded-lg hover:border-red-400 transition-colors"
                        >
                          <Heart size={16} fill={isInWishlist(product.id) ? 'red' : 'none'} className={isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <Eye size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-navy-900 mb-2">No results found</h3>
              <p className="text-gray-500">Try using different keywords like "frames", "lenses", "sunglasses", or "contact lenses"</p>
            </div>
          )}

          {/* Similar Products */}
          {result.similar.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-semibold text-navy-900 mb-2 flex items-center gap-2">
                <Eye size={20} className="text-gray-400" />
                Similar Products
              </h2>
              <p className="text-gray-500 mb-6">You might also be interested in these</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {result.similar.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-lg transition-all">
                    <Link to={`/products/${product.id}`}>
                      <img
                        src={product.image_urls?.[0] || 'https://images.pexels.com/photos/7018515/pexels-photo-7018515.jpeg?auto=compress&cs=tinysrgb&w=400'}
                        alt={product.name}
                        className="w-full h-40 object-cover"
                      />
                    </Link>
                    <div className="p-3">
                      <Link to={`/products/${product.id}`}>
                        <h3 className="font-medium text-sm text-navy-900 line-clamp-1 hover:text-gold-600">{product.name}</h3>
                      </Link>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-navy-900 text-sm">₹{product.price.toLocaleString('en-IN')}</span>
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="p-1.5 bg-navy-800 text-white rounded-lg hover:bg-navy-900"
                        >
                          <ShoppingCart size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
