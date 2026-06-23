import { useState, useEffect } from 'react';
import { Search, Eye, ShoppingBag, Calendar, Mail, Phone } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Customer, Order } from '../../types';

interface CustomerWithOrders extends Customer {
  orders?: Order[];
  orderCount?: number;
  totalSpent?: number;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerWithOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithOrders | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch order counts for each customer
      const customersWithStats = await Promise.all(
        (data || []).map(async (customer) => {
          const { data: orders } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_id', customer.id);

          const filteredOrders = orders?.filter(o => o.status !== 'cancelled') || [];
          return {
            ...customer,
            orders,
            orderCount: filteredOrders.length,
            totalSpent: filteredOrders.reduce((sum, o) => sum + o.total, 0),
          };
        })
      );

      setCustomers(customersWithStats);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
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
      <h1 className="text-2xl font-display font-bold text-navy-900">Customer Management</h1>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, or email..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-navy-900">{customer.name}</h3>
                <p className="text-sm text-gray-500">{customer.city}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(customer)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                {customer.phone}
              </div>
              {customer.email && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail size={16} />
                  {customer.email}
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between text-sm">
              <div>
                <p className="text-gray-500">Orders</p>
                <p className="font-semibold text-navy-900">{customer.orderCount}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500">Total Spent</p>
                <p className="font-semibold text-navy-900">₹{customer.totalSpent?.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-navy-900">{selectedCustomer.name}</h2>
                <button onClick={() => setSelectedCustomer(null)} className="text-gray-500 hover:text-gray-700">
                  X
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{selectedCustomer.phone}</p>
                </div>
                {selectedCustomer.email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>
                )}
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedCustomer.address || '-'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium text-navy-900 mb-4">Orders</h3>
                {selectedCustomer.orders?.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No orders yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedCustomer.orders?.map((order) => (
                      <div key={order.id} className="flex justify-between py-2 border-b text-sm">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{order.total.toLocaleString('en-IN')}</p>
                          <span className={`capitalize ${
                            order.status === 'delivered' ? 'text-green-600' :
                            order.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
