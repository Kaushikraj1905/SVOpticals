import { useState, useEffect } from 'react';
import { Plus, Search, Truck, DollarSign, Calendar, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
}

interface Purchase {
  id: string;
  supplier_id: string;
  supplier: Supplier;
  purchase_date: string;
  total_amount: number;
  gst_amount: number;
  grand_total: number;
  status: string;
  notes: string;
  created_at: string;
}

export default function AdminPurchasesPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [suppliersRes, purchasesRes] = await Promise.all([
        supabase.from('suppliers').select('*').eq('is_active', true),
        supabase.from('purchases').select('*, suppliers(name)').order('created_at', { ascending: false }),
      ]);

      setSuppliers(suppliersRes.data || []);
      setPurchases(purchasesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('suppliers').insert(formData);
      if (error) throw error;
      setFormData({ name: '', contact_person: '', phone: '', email: '', address: '' });
      setShowSupplierForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search)
  );

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
        <h1 className="text-2xl font-display font-bold text-navy-900">Purchases</h1>
        <div className="flex gap-3">
          <button onClick={() => setShowSupplierForm(true)} className="btn-outline flex items-center gap-2">
            <Plus size={20} />
            Add Supplier
          </button>
          <button onClick={() => setShowPurchaseForm(true)} className="btn-primary flex items-center gap-2">
            <Plus size={20} />
            New Purchase
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Truck className="text-blue-600" size={24} />
            <span className="text-sm text-gray-500">Suppliers</span>
          </div>
          <p className="text-2xl font-bold text-navy-900">{suppliers.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-600" size={24} />
            <span className="text-sm text-gray-500">Total Purchases</span>
          </div>
          <p className="text-2xl font-bold text-navy-900">
            ₹{purchases.reduce((sum, p) => sum + p.grand_total, 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="text-purple-600" size={24} />
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <p className="text-2xl font-bold text-navy-900">
            ₹{purchases
              .filter(p => new Date(p.purchase_date).getMonth() === new Date().getMonth())
              .reduce((sum, p) => sum + p.grand_total, 0)
              .toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Suppliers */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="font-semibold text-navy-900">Supplier Management</h2>
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suppliers..."
              className="input-field pl-10 w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Name</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Contact</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Phone</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSuppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-navy-900">{supplier.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{supplier.contact_person}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{supplier.phone}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{supplier.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase History */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-navy-900">Purchase History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Supplier</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Amount</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">GST</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(purchase.purchase_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm text-navy-900">{purchase.suppliers?.name}</td>
                  <td className="px-6 py-4 text-sm">₹{purchase.total_amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm">₹{purchase.gst_amount.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-sm font-medium">₹{purchase.grand_total.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      purchase.status === 'completed' ? 'bg-green-100 text-green-700' :
                      purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {purchase.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Form Modal */}
      {showSupplierForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-navy-900">Add Supplier</h3>
              <button onClick={() => setShowSupplierForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                <input type="text" value={formData.contact_person} onChange={e => setFormData({...formData, contact_person: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="input-field" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-field" rows={2} />
              </div>
              <button type="submit" className="w-full btn-primary">Add Supplier</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
