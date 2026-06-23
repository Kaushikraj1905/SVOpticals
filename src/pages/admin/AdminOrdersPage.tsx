import { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Order, Customer, OrderItem } from '../../types';

interface OrderWithDetails extends Order {
  customer?: Customer;
  items?: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(search.toLowerCase()) ||
      order.customer?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !filterStatus || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
    processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700', icon: Clock },
    ready: { label: 'Ready', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-700', icon: Truck },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
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
      <h1 className="text-2xl font-display font-bold text-navy-900">Orders Management</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number or customer..."
              className="input-field pl-10"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-40"
          >
            <option value="">All Status</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Order</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Total</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Date</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-navy-900">{order.order_number}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-navy-900">{order.customer?.name || 'Guest'}</p>
                      <p className="text-sm text-gray-500">{order.customer?.phone}</p>
                    </td>
                    <td className="px-6 py-4 font-medium">₹{order.total.toLocaleString('en-IN')}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${status.color}`}>
                        <StatusIcon size={14} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye size={16} className="text-gray-500" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-navy-900">{selectedOrder.order_number}</h2>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                  X
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-navy-900 mb-2">Customer Details</h3>
                <p className="text-gray-600">{selectedOrder.customer?.name || 'Guest'}</p>
                <p className="text-gray-600">{selectedOrder.customer?.phone}</p>
                <p className="text-gray-600">{selectedOrder.customer?.address}</p>
              </div>

              <div>
                <h3 className="font-medium text-navy-900 mb-2">Order Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b text-sm">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{item.total.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST</span>
                  <span>₹{selectedOrder.gst_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span>Total</span>
                  <span>₹{selectedOrder.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-navy-900 mb-2">Update Status</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => updateOrderStatus(selectedOrder.id, key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium ${
                        selectedOrder.status === key ? config.color : 'bg-gray-100 hover:bg-gray-200'
                      }`}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
