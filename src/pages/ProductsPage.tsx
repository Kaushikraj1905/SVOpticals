import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Grid, List, SlidersHorizontal, X, Search, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';

export default function ProductsPage() {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [aiSearchOpen, setAiSearchOpen] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get('category')
  );
  const [selectedBrand, setSelectedBrand] = useState<string | null>(
    searchParams.get('brand')
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedBrand, priceRange, sortBy, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          brand:brands(*),
          category:product_categories(*),
          inventory(*)
        `)
        .eq('is_active', true);

      // Apply filters
      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }
      if (selectedBrand) {
        query = query.eq('brand_id', selectedBrand);
      }
      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }
      if (priceRange[0] > 0) {
        query = query.gte('price', priceRange[0]);
      }
      if (priceRange[1] < 50000) {
        query = query.lte('price', priceRange[1]);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price-low':
          query = query.order('price', { ascending: true });
          break;
        case 'price-high':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    }
    fetchProducts();
  };

  const handleAiSearch = async () => {
    if (!aiSearchQuery.trim()) return;

    setAiSearching(true);
    // AI search processing (would connect to edge function in production)
    // For now, it converts natural language to keywords
    const keywords = aiSearchQuery
      .toLowerCase()
      .replace(/i want |i need |looking for |show me |find /gi, '')
      .replace(/glasses|specs|spectacles/gi, 'frames')
      .split(' ')
      .join(' ');

    setSearchQuery(keywords);
    setSearchParams({ search: keywords });
    setAiSearchOpen(false);
    setAiSearching(false);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedBrand(null);
    setPriceRange([0, 50000]);
    setSearchQuery('');
    setSearchParams({});
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      searchParams.set('category', category);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleBrandChange = (brand: string | null) => {
    setSelectedBrand(brand);
    if (brand) {
      searchParams.set('brand', brand);
    } else {
      searchParams.delete('brand');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-navy-900 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            {t('products')}
          </h1>
          <p className="text-gray-300">
            Explore our premium collection of eyewear
          </p>
        </div>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border-b sticky top-16 md:top-20 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 w-full md:max-w-md">
              <div className="relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchProducts')}
                  className="input-field pl-12 pr-4"
                />
              </div>
            </form>

            {/* AI Search Button */}
            <button
              onClick={() => setAiSearchOpen(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              <Sparkles size={20} />
              <span className="hidden sm:inline">AI Search</span>
            </button>

            {/* Sort & View */}
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field py-2 px-3 w-40"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>

              <div className="hidden md:flex items-center border rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-navy-100 text-navy-800' : 'text-gray-400'}`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-navy-100 text-navy-800' : 'text-gray-400'}`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <ProductFilters
              selectedCategory={selectedCategory}
              selectedBrand={selectedBrand}
              priceRange={priceRange}
              onCategoryChange={handleCategoryChange}
              onBrandChange={handleBrandChange}
              onPriceChange={setPriceRange}
              onClear={clearFilters}
            />
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing <span className="font-medium">{products.length}</span> products
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg mb-4">No products found</p>
                <button onClick={clearFilters} className="btn-outline">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6'
                  : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Search Modal */}
      {aiSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-purple-500" size={24} />
                <h3 className="font-display text-xl font-semibold">AI Product Search</h3>
              </div>
              <button onClick={() => setAiSearchOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Describe what you're looking for in natural language. Example: "I want stylish sunglasses for men under 5000"
            </p>
            <textarea
              value={aiSearchQuery}
              onChange={(e) => setAiSearchQuery(e.target.value)}
              placeholder="Describe what you're looking for..."
              className="input-field min-h-[100px] mb-4"
              autoFocus
            />
            <button
              onClick={handleAiSearch}
              disabled={!aiSearchQuery.trim() || aiSearching}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {aiSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Searching...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Search with AI
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
