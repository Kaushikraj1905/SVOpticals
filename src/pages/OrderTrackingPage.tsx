import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Truck, Package, CheckCircle, Clock, XCircle, ArrowRight, Phone, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  total: number;
}

interface OrderStatusHistory {
  id: string;
  status: string;
  created_at: string;
  notes: string;
}

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  gst_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: Clock },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle },
  processing: { label: 'Processing', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: Package },
  ready: { label: 'Ready', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
  delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: Truck },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
};

const statusSteps = ['pending', 'confirmed', 'processing', 'ready', 'delivered'];

export default function OrderTrackingPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      // Search by order number
      let { data, error: dbError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(*),
          items:order_items(*),
          status_history:order_status_history(*)
        `)
        .eq('order_number', searchQuery.trim())
        .single();

      if (dbError || !data) {
        // Try searching by phone
        const { data: phoneData, error: phoneError } = await supabase
          .from('orders')
          .select(`
            *,
            customer:customers(*),
            items:order_items(*),
            status_history:order_status_history(*)
          `)
          .ilike('customer.phone', `%${searchQuery.trim()}%`)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (phoneError || !phoneData) {
          setError('Order not found. Please check your order number or phone number.');
          setLoading(false);
          return;
        }
        data = phoneData;
      }

      const transformedOrder: OrderData = {
        id: data.id,
        order_number: data.order_number,
        status: data.status,
        subtotal: data.subtotal,
        gst_amount: data.gst_amount,
        total: data.total,
        created_at: data.created_at,
        updated_at: data.updated_at,
        customer_name: data.customer?.name || data.customer_name || 'Guest',
        customer_phone: data.customer?.phone || data.customer_phone || '',
        customer_address: data.customer?.address || data.customer_address || '',
        items: data.items || [],
        status_history: data.status_history || [],
      };

      setOrder(transformedOrder);
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status: string) => statusSteps.indexOf(status);
  const currentStep = order ? getStepIndex(order.status) : -1;
  const cancelled = order?.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-navy-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-3xl font-bold mb-2">Order Tracking</h1>
          <p className="text-gray-300">Track your order status in real-time</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <Search size={20} className="text-gray-400 ml-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter order number or phone number"
              className="flex-1 py-4 px-2 text-navy-900 placeholder-gray-400 outline-none bg-transparent"
            />
            <button
              type="submit"
              disabled={loading || !searchQuery.trim()}
              className="bg-gold-500 text-white px-6 py-4 font-medium hover:bg-gold-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Track'}
            </button>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-xl mx-auto mb-8 bg-red-50 text-red-600 px-4 py-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Order Result */}
        {order && !cancelled && (
          <div className="max-w-3xl mx-auto">
            {/* Status Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
              <h2 className="font-display text-lg font-semibold text-navy-900 mb-6">Order Status</h2>
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200 rounded">
                  <div
                    className="h-full bg-gold-500 rounded transition-all"
                    style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                  />
                </div>

                {/* Steps */}
                {statusSteps.map((step, index) => {
                  const statusInfo = statusConfig[step];
                  const Icon = statusInfo.icon;
                  const isActive = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step} className="flex flex-col items-center z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-gold-500 text-white' : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-gold-200' : ''}`}
                      >
                        <Icon size={16} />
                      </div>
                      <span className={`text-xs mt-2 font-medium ${isActive ? 'text-navy-900' : 'text-gray-400'}`}>
                        {statusInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <h3 className="text-xl font-bold text-navy-900">{order.order_number}</h3>
                </div>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium ${statusConfig[order.status]?.color || 'bg-gray-100'}`}>
                  {statusConfig[order.status]?.label || order.status}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-2">
                  <Phone size={16} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium text-navy-900">{order.customer_name}</p>
                    <p className="text-sm text-gray-600">{order.customer_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={16} className="text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Delivery Address</p>
                    <p className="font-medium text-navy-900">{order.customer_address}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-navy-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="font-medium text-navy-900">{item.product_name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium">₹{item.total.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">GST</span>
                    <span>₹{order.gst_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-navy-900 pt-2 border-t">
                    <span>Total</span>
                    <span>₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status History */}
            {order.status_history.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h4 className="font-semibold text-navy-900 mb-4">Status History</h4>
                <div className="space-y-3">
                  {order.status_history.map((history) => (
                    <div key={history.id} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gold-500 rounded-full" />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-navy-900 capitalize">{history.status}</span>
                        {history.notes && <span className="text-sm text-gray-500 ml-2">- {history.notes}</span>}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(history.created_at).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancelled Order */}
        {order && cancelled && (
          <div className="max-w-xl mx-auto text-center bg-white rounded-xl shadow-sm p-12">
            <XCircle size={64} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-navy-900 mb-2">Order Cancelled</h3>
            <p className="text-gray-500 mb-4">Order {order.order_number} has been cancelled.</p>
            <Link to="/products" className="btn-primary">
              Continue Shopping
            </Link>
          </div>
        )}

        {/* No Order - Tips */}
        {!order && !loading && !error && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Search size={32} className="mx-auto text-gold-500 mb-4" />
                <h3 className="font-semibold text-navy-900 mb-2">Find Your Order</h3>
                <p className="text-sm text-gray-500">Enter your order number or phone number to track</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Truck size={32} className="mx-auto text-gold-500 mb-4" />
                <h3 className="font-semibold text-navy-900 mb-2">Real-time Updates</h3>
                <p className="text-sm text-gray-500">Get instant updates on your order status</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <Phone size={32} className="mx-auto text-gold-500 mb-4" />
                <h3 className="font-semibold text-navy-900 mb-2">Need Help?</h3>
                <p className="text-sm text-gray-500">Contact us on WhatsApp for any assistance</p>
              </div>
            </div>
            <Link to="/products" className="btn-primary inline-flex items-center gap-2">
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
