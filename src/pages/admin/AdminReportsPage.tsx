import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ReportStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  avgOrderValue: number;
}

export default function AdminReportsPage() {
  const [stats, setStats] = useState<ReportStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
  });
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      const today = new Date();
      let startDate: string;

      switch (dateRange) {
        case 'week':
          startDate = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
          break;
        case 'month':
          startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
          break;
        case 'quarter':
          startDate = new Date(today.setMonth(today.getMonth() - 3)).toISOString().split('T')[0];
          break;
        case 'year':
          startDate = new Date(today.setFullYear(today.getFullYear() - 1)).toISOString().split('T')[0];
          break;
        default:
          startDate = new Date(today.setMonth(today.getMonth() - 1)).toISOString().split('T')[0];
      }

      // Fetch orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate);

      const { count: customers } = await supabase.from('customers').select('*');
      const { count: products } = await supabase.from('products').select('*');

      const completedOrders = orders?.filter(o => o.status !== 'cancelled') || [];
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);

      setStats({
        totalRevenue,
        totalOrders: completedOrders.length,
        totalCustomers: customers || 0,
        totalProducts: products || 0,
        avgOrderValue: completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0,
      });

      // Generate sales chart data (daily for week, weekly for month, etc.)
      const chartData = generateChartData(completedOrders);
      setSalesData(chartData);

      // Category distribution
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id, total, products(category:product_categories(name))');

      const categoryMap = new Map<string, number>();
      orderItems?.forEach((item: any) => {
        const cat = item.products?.category?.name || 'Other';
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + item.total);
      });

      setCategoryData(Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value })));
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (orders: any[]) => {
    const data: { [key: string]: number } = {};
    orders.forEach(order => {
      const date = new Date(order.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      data[date] = (data[date] || 0) + order.total;
    });
    return Object.entries(data).map(([date, value]) => ({ date, value }));
  };

  const COLORS = ['#1e3a5f', '#d4a853', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

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
        <h1 className="text-2xl font-display font-bold text-navy-900">Reports & Analytics</h1>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="input-field w-40"
        >
          <option value="week">Last Week</option>
          <option value="month">Last Month</option>
          <option value="quarter">Last Quarter</option>
          <option value="year">Last Year</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="text-green-600" size={24} />
            <span className="text-sm text-gray-500">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-navy-900">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-blue-600" size={24} />
            <span className="text-sm text-gray-500">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-navy-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Users className="text-orange-600" size={24} />
            <span className="text-sm text-gray-500">Customers</span>
          </div>
          <p className="text-2xl font-bold text-navy-900">{stats.totalCustomers}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-purple-600" size={24} />
            <span className="text-sm text-gray-500">Avg Order Value</span>
          </div>
          <p className="text-2xl font-bold text-navy-900">
            ₹{Math.round(stats.avgOrderValue).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-teal-600" size={24} />
            <span className="text-sm text-gray-500">Products</span>
          </div>
          <p className="text-2xl font-bold text-navy-900">{stats.totalProducts}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-6">Sales Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => `₹${v/1000}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="value" stroke="#1e3a5f" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-6">Sales by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-4 mt-4 justify-center">
            {categoryData.map((cat, index) => (
              <div key={cat.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-gray-600">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
