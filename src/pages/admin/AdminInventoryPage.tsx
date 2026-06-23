import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, Package, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Product, Brand, ProductCategory, Inventory } from '../../types';

interface ProductWithInventory extends Product {
  inventory: Inventory | null;
}

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<ProductWithInventory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductWithInventory | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, brand:brands(*), category:product_categories(*), inventory(*)')
          .order('created_at', { ascending: false }),
        supabase.from('brands').select('*').eq('is_active', true),
        supabase.from('product_categories').select('*').eq('is_active', true),
      ]);

      setProducts(productsRes.data || []);
      setBrands(brandsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = !filterBrand || p.brand_id === filterBrand;
    const matchesStock = !filterStock ||
      (filterStock === 'low' && p.inventory && p.inventory.quantity <= p.inventory.min_quantity) ||
      (filterStock === 'out' && (!p.inventory || p.inventory.quantity === 0)) ||
      (filterStock === 'in' && p.inventory && p.inventory.quantity > (p.inventory.min_quantity || 0));

    return matchesSearch && matchesBrand && matchesStock;
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleUpdateStock = async (productId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .upsert({ product_id: productId, quantity, last_updated: new Date().toISOString() }, { onConflict: 'product_id' });

      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-navy-900">Inventory Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
            <option value="in">In Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">SKU</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Brand</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Price</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Stock</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => {
                const stock = product.inventory?.quantity ?? 0;
                const minStock = product.inventory?.min_quantity ?? 5;
                const isLow = stock <= minStock;
                const isOut = stock === 0;

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={product.image_urls?.[0] || 'https://via.placeholder.com/48'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-navy-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{product.brand?.name || '-'}</td>
                    <td className="px-6 py-4 text-sm font-medium">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {isOut ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <Package size={16} />
                            Out
                          </span>
                        ) : isLow ? (
                          <span className="flex items-center gap-1 text-orange-600">
                            <AlertTriangle size={16} />
                            {stock}
                          </span>
                        ) : (
                          <span className="text-green-600">{stock}</span>
                        )}
                        <input
                          type="number"
                          defaultValue={stock}
                          onBlur={(e) => handleUpdateStock(product.id, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 border rounded text-sm"
                          min="0"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingProduct(product)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit size={16} className="text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} className="text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
