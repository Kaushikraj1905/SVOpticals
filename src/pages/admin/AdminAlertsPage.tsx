import { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Package, CheckCircle, X, RefreshCw, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LowStockAlert {
  id: string;
  product_id: string;
  product_name: string;
  sku: string;
  current_quantity: number;
  min_quantity: number;
  brand: string;
  created_at: string;
}

interface InventoryNotification {
  id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [notifications, setNotifications] = useState<InventoryNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch low stock products
      const { data: lowStock } = await supabase
        .from('inventory')
        .select('*, products(id, name, sku, brand:brands(name))')
        .lte('quantity', threshold)
        .gt('quantity', 0);

      const mappedAlerts = (lowStock || []).map((item: any) => ({
        id: item.id,
        product_id: item.products?.id,
        product_name: item.products?.name,
        sku: item.products?.sku,
        current_quantity: item.quantity,
        min_quantity: item.min_quantity || threshold,
        brand: item.products?.brand?.name,
        created_at: item.last_updated,
      }));

      setAlerts(mappedAlerts);

      // Fetch inventory notifications
      const { data: notifs } = await supabase
        .from('inventory_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setNotifications(notifs || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await supabase
        .from('inventory_notifications')
        .update({ is_read: true })
        .eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleRestock = async (productId: string, quantity: number) => {
    try {
      await supabase
        .from('inventory')
        .update({ quantity: quantity + 10, last_updated: new Date().toISOString() })
        .eq('product_id', productId);
      fetchData();
    } catch (error) {
      console.error('Error restocking:', error);
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
        <h1 className="text-2xl font-display font-bold text-navy-900">Inventory Alerts</h1>
        <div className="flex gap-3">
          <button onClick={fetchData} className="btn-outline flex items-center gap-2">
            <RefreshCw size={20} />
            Refresh
          </button>
          <button onClick={() => setShowSettings(!showSettings)} className="btn-outline flex items-center gap-2">
            <Settings size={20} />
            Settings
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-100">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="text-red-500" size={24} />
            <span className="text-sm text-red-700 font-medium">Low Stock Items</span>
          </div>
          <p className="text-3xl font-bold text-red-600">{alerts.length}</p>
          <p className="text-sm text-red-400 mt-1">Below {threshold} units</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow-sm p-6 border border-yellow-100">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="text-yellow-600" size={24} />
            <span className="text-sm text-yellow-700 font-medium">Unread Notifications</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {notifications.filter(n => !n.is_read).length}
          </p>
          <p className="text-sm text-yellow-400 mt-1">Requires attention</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow-sm p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-green-600" size={24} />
            <span className="text-sm text-green-700 font-medium">Inventory Value</span>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {alerts.length > 0 ? '₹' + (alerts.reduce((sum, a) => sum + (a.current_quantity * 500), 0)).toLocaleString('en-IN') : 'N/A'}
          </p>
          <p className="text-sm text-green-400 mt-1">Estimated value</p>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-navy-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-500" />
            Low Stock Products
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Product</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">SKU</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Brand</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Current Stock</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Min Required</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-2" />
                    <p className="text-lg font-medium">All products are well stocked!</p>
                    <p className="text-sm">No low stock alerts at this time.</p>
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-navy-900">{alert.product_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{alert.sku}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{alert.brand}</td>
                    <td className="px-6 py-4">
                      <span className="text-red-600 font-bold">{alert.current_quantity}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{alert.min_quantity}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleRestock(alert.product_id, alert.current_quantity)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Restock (+10)
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-navy-900 flex items-center gap-2">
            <Bell size={20} className="text-yellow-500" />
            Inventory Notifications
          </h2>
        </div>
        <div className="divide-y">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 flex items-center justify-between ${!notif.is_read ? 'bg-yellow-50' : ''}`}
              >
                <div>
                  <p className="font-medium text-navy-900">{notif.message}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                {!notif.is_read && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
