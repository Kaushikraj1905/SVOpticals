import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingCart, Users, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useLanguage } from '../../contexts/LanguageContext';

interface Stats {
  totalSales: number;
  todaySales: number;
  monthlyRevenue: number;
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  pendingOrders: number;
}

interface TopProduct {
  id: string;
  name: string;
  sold: number;
  revenue: number;
}

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    todaySales: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    pendingOrders: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [productsRes, customersRes, ordersRes] = await Promise.all([
        supabase.from('products').select('id').eq('is_active', true),
        supabase.from('customers').select('id'),
        supabase.from('orders').select('*'),
      ]);

      const products = productsRes.data || [];
      const orders = ordersRes.data || [];

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const todayOrders = orders.filter((o: any) => o.created_at.startsWith(today));
      const monthOrders = orders.filter((o: any) => o.created_at >= monthStart);
      const pendingOrders = orders.filter((o: any) => o.status === 'pending');

      setStats({
        totalSales: orders.filter((o: any) => o.status !== 'cancelled').reduce((sum: number, o: any) => sum + o.total, 0),
        todaySales: todayOrders.reduce((sum: number, o: any) => sum + o.total, 0),
        monthlyRevenue: monthOrders.reduce((sum: number, o: any) => sum + o.total, 0),
        totalProducts: products.length,
        lowStockCount: 0,
        totalCustomers: customersRes.data?.length || 0,
        pendingOrders: pendingOrders.length,
      });

      // Fetch low stock
      const { data: lowStock } = await supabase
        .from('inventory')
        .select('*, products(name, sku)')
        .lte('quantity', 5)
        .limit(5);
      setLowStockProducts(lowStock || []);

      // Fetch recent orders
      const { data: recent } = await supabase
        .from('orders')
        .select('*, customers(name)')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentOrders(recent || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Sales',
      value: `₹${stats.totalSales.toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      change: '+12%',
      changeUp: true,
    },
    {
      title: 'Monthly Revenue',
      value: `₹${stats.monthlyRevenue.toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'bg-blue-100 text-blue-600',
      change: '+8%',
      changeUp: true,
    },
    {
      title: 'Total Products',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'bg-purple-100 text-purple-600',
      link: '/admin/inventory',
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      link: '/admin/customers',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
      link: '/admin/orders',
    },
    {
      title: 'Low Stock Alerts',
      value: lowStockProducts.length.toString(),
      icon: AlertTriangle,
      color: 'bg-red-100 text-red-600',
      link: '/admin/inventory?filter=low',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-navy-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const content = (
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon size={24} />
                </div>
                {stat.change && (
                  <span className={`flex items-center text-sm font-medium ${
                    stat.changeUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.title}</p>
            </div>
          );

          return stat.link ? (
            <Link key={stat.title} to={stat.link} className="block">
              {content}
            </Link>
          ) : (
            <div key={stat.title}>{content}</div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-navy-900">Recent Orders</h2>
              <Link to="/admin/orders" className="text-sm text-gold-600 hover:text-gold-700">
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y">
            {recentOrders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No orders yet</div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy-900">{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {order.customers?.name || 'Guest'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{order.total.toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-navy-900">Low Stock Alerts</h2>
              <Link to="/admin/inventory?filter=low" className="text-sm text-gold-600 hover:text-gold-700">
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">All products are well stocked</div>
            ) : (
              lowStockProducts.map((item: any) => (
                <div key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy-900">{item.products?.name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.products?.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{item.quantity} left</p>
                    <p className="text-xs text-gray-500">Min: {item.min_quantity}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
