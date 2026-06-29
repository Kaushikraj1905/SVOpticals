import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, AlertTriangle, Package, Filter, Download, Upload, FileSpreadsheet, Image, Minus, Plus as PlusIcon } from 'lucide-react';
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
  const [toast, setToast] = useState<string | null>(null);
  const [stockAdjustProduct, setStockAdjustProduct] = useState<ProductWithInventory | null>(null);
  const [adjustQuantity, setAdjustQuantity] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<string>('');
  const [importPreview, setImportPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      showToast('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast('Error deleting product');
    }
  };

  const handleUpdateStock = async (productId: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .upsert({ product_id: productId, quantity, last_updated: new Date().toISOString() }, { onConflict: 'product_id' });

      if (error) throw error;
      fetchData();
      showToast('Stock updated');
    } catch (error) {
      console.error('Error updating stock:', error);
      showToast('Error updating stock');
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['ID', 'SKU', 'Name', 'Brand', 'Category', 'Price', 'MRP', 'GST Rate', 'Stock', 'Min Stock', 'Status', 'Frame Shape', 'Material', 'Gender', 'Color', 'Size', 'Rating', 'Review Count'];
    const rows = filteredProducts.map(p => [
      p.id,
      p.sku,
      p.name,
      p.brand?.name || '',
      p.category?.name || '',
      p.price,
      p.mrp,
      p.gst_rate,
      p.inventory?.quantity || 0,
      p.inventory?.min_quantity || 0,
      p.is_active ? 'Active' : 'Inactive',
      p.frame_shape || '',
      p.material || '',
      p.gender || '',
      p.color || '',
      p.size || '',
      p.rating || 0,
      p.review_count || 0,
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `products_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV exported successfully');
  };

  // Excel Export (CSV format)
  const handleExportExcel = () => {
    handleExportCSV();
  };

  // CSV Import
  const handleImportCSV = () => {
    setShowImportModal(true);
  };

  const parseImportData = () => {
    if (!importData.trim()) return;
    const lines = importData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      parsed.push(row);
    }
    setImportPreview(parsed);
  };

  const handleConfirmImport = async () => {
    if (importPreview.length === 0) return;
    try {
      for (const row of importPreview) {
        const brand = brands.find(b => b.name === row.Brand);
        const category = categories.find(c => c.name === row.Category);
        const productData = {
          sku: row.SKU || `SKU-${Date.now()}`,
          name: row.Name,
          price: parseFloat(row.Price) || 0,
          mrp: parseFloat(row.MRP) || parseFloat(row.Price) || 0,
          gst_rate: parseFloat(row['GST Rate']) || 12,
          brand_id: brand?.id || null,
          category_id: category?.id || categories[0]?.id,
          is_active: row.Status === 'Active',
          frame_shape: row['Frame Shape'] || null,
          material: row.Material || null,
          gender: row.Gender || null,
          color: row.Color || null,
          size: row.Size || null,
          rating: parseFloat(row.Rating) || 0,
          review_count: parseInt(row['Review Count']) || 0,
        };
        const { data: newProduct, error } = await supabase.from('products').insert(productData).select().single();
        if (error) throw error;
        if (newProduct && row.Stock) {
          await supabase.from('inventory').insert({
            product_id: newProduct.id,
            quantity: parseInt(row.Stock) || 0,
            min_quantity: parseInt(row['Min Stock']) || 5,
          });
        }
      }
      showToast(`Imported ${importPreview.length} products`);
      setShowImportModal(false);
      setImportData('');
      setImportPreview([]);
      fetchData();
    } catch (err: any) {
      showToast('Import error: ' + err.message);
    }
  };

  // Stock Adjustment
  const openStockAdjust = (product: ProductWithInventory) => {
    setStockAdjustProduct(product);
    setAdjustQuantity(product.inventory?.quantity || 0);
    setAdjustReason('');
  };

  const handleStockAdjust = async () => {
    if (!stockAdjustProduct || !adjustReason) return;
    try {
      const { error } = await supabase
        .from('inventory')
        .upsert({
          product_id: stockAdjustProduct.id,
          quantity: adjustQuantity,
          last_updated: new Date().toISOString(),
        }, { onConflict: 'product_id' });
      if (error) throw error;

      // Log the movement
      await supabase.from('inventory_movements').insert({
        product_id: stockAdjustProduct.id,
        movement_type: 'adjustment',
        quantity: adjustQuantity - (stockAdjustProduct.inventory?.quantity || 0),
        reason: adjustReason,
        created_at: new Date().toISOString(),
      });

      showToast('Stock adjusted successfully');
      setStockAdjustProduct(null);
      fetchData();
    } catch (err: any) {
      showToast('Error: ' + err.message);
    }
  };

  // Image Upload
  const handleImageUpload = async (productId: string, file: File) => {
    setUploadingImage(true);
    try {
      const filePath = `products/${productId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: publicUrl } = supabase.storage.from('products').getPublicUrl(filePath);
      const product = products.find(p => p.id === productId);
      const newUrls = [...(product?.image_urls || []), publicUrl.publicUrl];
      await supabase.from('products').update({ image_urls: newUrls }).eq('id', productId);
      showToast('Image uploaded');
      fetchData();
    } catch (err: any) {
      showToast('Upload error: ' + err.message);
    } finally {
      setUploadingImage(false);
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
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-navy-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-down">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-display font-bold text-navy-900">Inventory Management</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleImportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Upload size={16} /> Import
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <Download size={16} /> CSV
          </button>
          <button onClick={handleExportExcel} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <FileSpreadsheet size={16} /> Excel
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add Product
          </button>
        </div>
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
          <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="input-field w-40">
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="input-field w-40">
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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">SKU</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Brand</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Price</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Stock</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={product.image_urls?.[0] || 'https://via.placeholder.com/48'}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium text-navy-900 text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.category?.name}</p>
                          {product.frame_shape && <span className="text-xs text-gray-400">{product.frame_shape} · {product.material}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.sku}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{product.brand?.name || '-'}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ₹{product.price.toLocaleString('en-IN')}
                      {product.discount_price > 0 && (
                        <span className="text-xs text-green-600 ml-1">₹{product.discount_price.toLocaleString('en-IN')}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {isOut ? (
                          <span className="flex items-center gap-1 text-red-600 text-sm">
                            <Package size={14} /> Out
                          </span>
                        ) : isLow ? (
                          <span className="flex items-center gap-1 text-orange-600 text-sm">
                            <AlertTriangle size={14} /> {stock}
                          </span>
                        ) : (
                          <span className="text-green-600 text-sm">{stock}</span>
                        )}
                        <button onClick={() => openStockAdjust(product)} className="p-1 hover:bg-gray-100 rounded text-xs text-gray-500">
                          <PlusIcon size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditingProduct(product)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit size={14} className="text-gray-500" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                        <button onClick={() => imageInputRef.current?.click()} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Image size={14} className="text-gray-500" />
                        </button>
                        <input
                          ref={imageInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(product.id, file);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold text-navy-900">Bulk Import Products</h2>
              <button onClick={() => { setShowImportModal(false); setImportData(''); setImportPreview([]); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <span className="text-gray-500">X</span>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Paste CSV data below. Columns: Name, SKU, Price, MRP, Brand, Category, Stock, Min Stock, GST Rate, Frame Shape, Material, Gender, Color, Size</p>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                rows={8}
                className="input-field w-full font-mono text-sm"
                placeholder={`Name,SKU,Price,MRP,Brand,Category,Stock,Min Stock,GST Rate,Frame Shape,Material,Gender,Color,Size\nRay-Ban Aviator,RB-001,2999,3999,Ray-Ban,Sunglasses,15,5,12,Aviator,Metal,Unisex,Gold,Medium`}
              />
              <button onClick={parseImportData} className="btn-primary">Preview Import</button>

              {importPreview.length > 0 && (
                <div>
                  <h3 className="font-medium text-navy-900 mb-2">Preview ({importPreview.length} products)</h3>
                  <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">SKU</th>
                          <th className="px-3 py-2 text-left">Price</th>
                          <th className="px-3 py-2 text-left">Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.slice(0, 10).map((row, i) => (
                          <tr key={i} className="border-b">
                            <td className="px-3 py-2">{row.Name}</td>
                            <td className="px-3 py-2">{row.SKU}</td>
                            <td className="px-3 py-2">{row.Price}</td>
                            <td className="px-3 py-2">{row.Stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importPreview.length > 10 && <p className="text-sm text-gray-500 mt-2">...and {importPreview.length - 10} more</p>}
                  </div>
                  <button onClick={handleConfirmImport} className="btn-primary mt-4">Import {importPreview.length} Products</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {stockAdjustProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">Adjust Stock: {stockAdjustProduct.name}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Current Stock</label>
                <p className="text-2xl font-bold text-navy-900">{stockAdjustProduct.inventory?.quantity || 0}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">New Quantity</label>
                <input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                  className="input-field"
                  min="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Reason</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Stock count, Damaged goods, New shipment"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleStockAdjust} disabled={!adjustReason} className="btn-primary flex-1 disabled:opacity-50">Save Adjustment</button>
                <button onClick={() => setStockAdjustProduct(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
