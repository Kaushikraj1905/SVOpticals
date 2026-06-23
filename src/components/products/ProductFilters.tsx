import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Brand, ProductCategory } from '../../types';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface ProductFiltersProps {
  selectedCategory: string | null;
  selectedBrand: string | null;
  priceRange: [number, number];
  onCategoryChange: (category: string | null) => void;
  onBrandChange: (brand: string | null) => void;
  onPriceChange: (range: [number, number]) => void;
  onClear: () => void;
}

export default function ProductFilters({
  selectedCategory,
  selectedBrand,
  priceRange,
  onCategoryChange,
  onBrandChange,
  onPriceChange,
  onClear,
}: ProductFiltersProps) {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    if (data) setCategories(data);
  };

  const fetchBrands = async () => {
    const { data } = await supabase
      .from('brands')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (data) setBrands(data);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const hasFilters = selectedCategory || selectedBrand || priceRange[0] > 0 || priceRange[1] < 50000;

  return (
    <div className="lg:block">
      {/* Mobile Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="lg:hidden w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-lg mb-4"
      >
        <SlidersHorizontal size={20} />
        <span>{t('filter')}</span>
      </button>

      {/* Filters Panel */}
      <div
        className={`bg-white rounded-xl shadow-sm p-6 lg:block ${
          showFilters ? 'block' : 'hidden'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-semibold text-navy-900">
            {t('filter')}
          </h3>
          {hasFilters && (
            <button
              onClick={onClear}
              className="text-sm text-gold-600 hover:text-gold-700 transition-colors"
            >
              {t('all')}
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('category')}
            className="w-full flex items-center justify-between py-2"
          >
            <span className="font-medium text-navy-800">{t('category')}</span>
            {expandedSections.category ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
          {expandedSections.category && (
            <div className="mt-3 space-y-2">
              <button
                onClick={() => onCategoryChange(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !selectedCategory
                    ? 'bg-navy-100 text-navy-900 font-medium'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                {t('all')}
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-navy-100 text-navy-900 font-medium'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  {language === 'te' && category.name_te ? category.name_te : category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('brand')}
            className="w-full flex items-center justify-between py-2"
          >
            <span className="font-medium text-navy-800">{t('brand')}</span>
            {expandedSections.brand ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
          {expandedSections.brand && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
              <button
                onClick={() => onBrandChange(null)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  !selectedBrand
                    ? 'bg-navy-100 text-navy-900 font-medium'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                {t('all')}
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => onBrandChange(brand.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedBrand === brand.id
                      ? 'bg-navy-100 text-navy-900 font-medium'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  {brand.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between py-2"
          >
            <span className="font-medium text-navy-800">{t('priceRange')}</span>
            {expandedSections.price ? (
              <ChevronUp size={18} className="text-gray-500" />
            ) : (
              <ChevronDown size={18} className="text-gray-500" />
            )}
          </button>
          {expandedSections.price && (
            <div className="mt-3 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Min</label>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => onPriceChange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="input-field text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Max</label>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value) || 50000])}
                    className="input-field text-sm"
                    placeholder="50000"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  [0, 1000],
                  [1000, 5000],
                  [5000, 10000],
                  [10000, 50000],
                ].map(([min, max]) => (
                  <button
                    key={`${min}-${max}`}
                    onClick={() => onPriceChange([min, max])}
                    className={`px-3 py-1 rounded text-sm transition-colors ${
                      priceRange[0] === min && priceRange[1] === max
                        ? 'bg-navy-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    ₹{min >= 1000 ? `${min / 1000}k` : min} - ₹{max >= 1000 ? `${max / 1000}k` : max}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy-100 text-navy-900 rounded-full text-sm">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                  <button
                    onClick={() => onCategoryChange(null)}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
              {selectedBrand && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-navy-100 text-navy-900 rounded-full text-sm">
                  {brands.find((b) => b.id === selectedBrand)?.name}
                  <button
                    onClick={() => onBrandChange(null)}
                    className="hover:text-red-500"
                  >
                    <X size={14} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
