import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, Package, Users, TrendingUp, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Clock,
  Calendar, BarChart2, PieChart as PieChartIcon, Download, Eye, Award, Star
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
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
  grossProfit: number;
  netProfit: number;
  inventoryValue: number;
  deadStockCount: number;
  totalDiscounts: number;
  totalCostBasis: number;
}

interface TopProduct {
  id: string;
  name: string;
  sold: number;
  revenue: number;
}


type DateRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

const CHART_COLORS = ['#1a365d', '#c5a047', '#4a5568', '#68d391', '#f6ad55', '#fc8181', '#9f7aea', '#4299e1'];

const formatCurrency = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

const getDateRange = (range: DateRange) => {
  const now = new Date();
  const start = new Date(now);
  switch (range) {
    case 'daily':
      start.setDate(now.getDate() - 30);
      return { start, end: now, label: 'Last 30 Days' };
    case 'weekly':
      start.setDate(now.getDate() - 90);
      return { start, end: now, label: 'Last 12 Weeks' };
    case 'monthly':
      start.setMonth(now.getMonth() - 12);
      return { start, end: now, label: 'Last 12 Months' };
    case 'yearly':
      start.setFullYear(now.getFullYear() - 5);
      return { start, end: now, label: 'Last 5 Years' };
  }
};

const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = row[h];
      if (val === null || val === undefined) return '';
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(','))
  ].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

const ChartEmptyState = () => (
  <div className="h-80 flex items-center justify-center text-gray-500">No data available</div>
);

export default function AdminDashboardPage() {
  const { t } = useLanguage();
  // reference t to satisfy TS while keeping translation hook ready
  const pageTitle = (() => { void t; return 'Dashboard'; })();
  const [stats, setStats] = useState<Stats>({
    totalSales: 0,
    todaySales: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
    lowStockCount: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    grossProfit: 0,
    netProfit: 0,
    inventoryValue: 0,
    deadStockCount: 0,
    totalDiscounts: 0,
    totalCostBasis: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>('monthly');

  // Extended data for charts and KPIs
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [deadStockProducts, setDeadStockProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all extended data in parallel
      const [
        productsRes,
        customersRes,
        ordersRes,
        orderItemsRes,
        inventoryRes,
        purchaseItemsRes,
        brandsRes,
        categoriesRes,
      ] = await Promise.all([
        supabase.from('products').select('*, brands(name), product_categories(name)'),
        supabase.from('customers').select('id, name, total_purchases'),
        supabase.from('orders').select('*, customers(name)'),
        supabase.from('order_items').select('*, products(name, brand_id, category_id)'),
        supabase.from('inventory').select('*, products(name, sku, price)'),
        supabase.from('purchase_items').select('product_id, unit_cost, quantity'),
        supabase.from('brands').select('id, name'),
        supabase.from('product_categories').select('id, name'),
      ]);

      const productsData = productsRes.data || [];
      const customersData = customersRes.data || [];
      const ordersData = ordersRes.data || [];
      const orderItemsData = orderItemsRes.data || [];
      const inventoryData = inventoryRes.data || [];
      const purchaseItemsData = purchaseItemsRes.data || [];
      const brandsData = brandsRes.data || [];
      const categoriesData = categoriesRes.data || [];

      setCustomers(customersData);
      setOrders(ordersData);
      setOrderItems(orderItemsData);
      setInventory(inventoryData);
      setBrands(brandsData);
      setCategories(categoriesData);

      // Compute product costs from purchase history (fallback to 60% of price)
      const productCosts: Record<string, number[]> = {};
      purchaseItemsData.forEach((item: any) => {
        if (!productCosts[item.product_id]) productCosts[item.product_id] = [];
        productCosts[item.product_id].push(item.unit_cost);
      });

      const getProductCost = (productId: string): number => {
        if (!productId) return 0;
        const costs = productCosts[productId];
        if (costs && costs.length > 0) {
          return costs.reduce((a, b) => a + b, 0) / costs.length;
        }
        const product = productsData.find((p: any) => p.id === productId);
        return (product?.price || 0) * 0.6;
      };

      // Calculate core stats
      const today = new Date().toISOString().split('T')[0];
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const todayOrders = ordersData.filter((o: any) => o.created_at?.startsWith(today));
      const monthOrders = ordersData.filter((o: any) => o.created_at >= monthStart);
      const pendingOrders = ordersData.filter((o: any) => o.status === 'pending');
      const nonCancelledOrders = ordersData.filter((o: any) => o.status !== 'cancelled');

      const totalSales = nonCancelledOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      const todaySales = todayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      const monthlyRevenue = monthOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0);
      const totalDiscounts = nonCancelledOrders.reduce((sum: number, o: any) => sum + (o.discount || 0), 0);

      // Cost basis and profit
      const totalCostBasis = orderItemsData.reduce((sum: number, item: any) => {
        const order = ordersData.find((o: any) => o.id === item.order_id);
        if (order?.status === 'cancelled') return sum;
        const cost = getProductCost(item.product_id);
        return sum + (cost * (item.quantity || 0));
      }, 0);

      const grossProfit = totalSales - totalCostBasis;
      const netProfit = grossProfit - totalDiscounts;

      // Inventory value
      const inventoryValue = inventoryData.reduce((sum: number, item: any) => {
        const cost = getProductCost(item.product_id);
        return sum + (cost * (item.quantity || 0));
      }, 0);

      // Dead stock (in inventory but no sales in 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const soldProductIds = new Set(
        orderItemsData
          .filter((item: any) => {
            const order = ordersData.find((o: any) => o.id === item.order_id);
            return order?.status !== 'cancelled' && order?.created_at && new Date(order.created_at) >= ninetyDaysAgo;
          })
          .map((item: any) => item.product_id)
      );
      const deadStock = productsData.filter((p: any) => {
        const inv = inventoryData.find((i: any) => i.product_id === p.id);
        return inv && inv.quantity > 0 && !soldProductIds.has(p.id);
      });
      setDeadStockProducts(deadStock);

      // Top products by revenue
      const productRevenue: Record<string, { name: string; sold: number; revenue: number }> = {};
      orderItemsData.forEach((item: any) => {
        const order = ordersData.find((o: any) => o.id === item.order_id);
        if (order?.status === 'cancelled') return;
        const pid = item.product_id || item.product_name;
        if (!productRevenue[pid]) {
          productRevenue[pid] = {
            name: item.products?.name || item.product_name || 'Unknown',
            sold: 0,
            revenue: 0,
          };
        }
        productRevenue[pid].sold += item.quantity || 0;
        productRevenue[pid].revenue += item.total || 0;
      });
      const topProductsList = Object.entries(productRevenue)
        .map(([id, data]) => ({ id, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);
      setTopProducts(topProductsList);

      setStats({
        totalSales,
        todaySales,
        monthlyRevenue,
        totalProducts: productsData.filter((p: any) => p.is_active).length,
        lowStockCount: 0,
        totalCustomers: customersData.length,
        pendingOrders: pendingOrders.length,
        grossProfit,
        netProfit,
        inventoryValue,
        deadStockCount: deadStock.length,
        totalDiscounts,
        totalCostBasis,
      });

      // Fetch low stock (original behavior)
      const { data: lowStock } = await supabase
        .from('inventory')
        .select('*, products(name, sku)')
        .lte('quantity', 5)
        .limit(5);
      setLowStockProducts(lowStock || []);

      // Fetch recent orders (original behavior)
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

  // Sales trend data for LineChart
  const salesTrendData = useMemo(() => {
    const { start, end } = getDateRange(dateRange);
    const filteredOrders = orders.filter((o: any) => {
      if (o.status === 'cancelled') return false;
      const date = new Date(o.created_at);
      return date >= start && date <= end;
    });

    const grouped = new Map<string, { label: string; revenue: number; orders: number }>();

    if (dateRange === 'daily') {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0];
        grouped.set(key, {
          label: d.toLocaleString('en-US', { month: 'short', day: 'numeric' }),
          revenue: 0,
          orders: 0,
        });
      }
      filteredOrders.forEach((o: any) => {
        const key = o.created_at.split('T')[0];
        const existing = grouped.get(key);
        if (existing) {
          existing.revenue += o.total || 0;
          existing.orders += 1;
        }
      });
    } else if (dateRange === 'weekly') {
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-W${Math.ceil(d.getDate() / 7)}`;
        if (!grouped.has(key)) {
          grouped.set(key, {
            label: d.toLocaleString('en-US', { month: 'short' }) + ` W${Math.ceil(d.getDate() / 7)}`,
            revenue: 0,
            orders: 0,
          });
        }
      }
      filteredOrders.forEach((o: any) => {
        const date = new Date(o.created_at);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${Math.ceil(date.getDate() / 7)}`;
        const existing = grouped.get(key);
        if (existing) {
          existing.revenue += o.total || 0;
          existing.orders += 1;
        }
      });
    } else if (dateRange === 'monthly') {
      for (let i = 0; i < 12; i++) {
        const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        grouped.set(key, {
          label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
          revenue: 0,
          orders: 0,
        });
      }
      filteredOrders.forEach((o: any) => {
        const key = o.created_at.slice(0, 7);
        const existing = grouped.get(key);
        if (existing) {
          existing.revenue += o.total || 0;
          existing.orders += 1;
        }
      });
    } else if (dateRange === 'yearly') {
      for (let i = 0; i < 5; i++) {
        const year = end.getFullYear() - i;
        grouped.set(String(year), {
          label: String(year),
          revenue: 0,
          orders: 0,
        });
      }
      filteredOrders.forEach((o: any) => {
        const key = o.created_at.slice(0, 4);
        const existing = grouped.get(key);
        if (existing) {
          existing.revenue += o.total || 0;
          existing.orders += 1;
        }
      });
    }

    return Array.from(grouped.values()).reverse();
  }, [orders, dateRange]);

  // Top customers for chart
  const topCustomersData = useMemo(() => {
    const customerSpending: Record<string, number> = {};
    orders.forEach((order: any) => {
      if (order.status === 'cancelled') return;
      const cid = order.customer_id;
      if (!cid) return;
      customerSpending[cid] = (customerSpending[cid] || 0) + (order.total || 0);
    });
    return Object.entries(customerSpending)
      .map(([id, total]) => {
        const name = customers.find((c: any) => c.id === id)?.name || 'Guest';
        return {
          id,
          name: name.length > 20 ? name.slice(0, 20) + '...' : name,
          total: total as number,
        };
      })
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [orders, customers]);

  // Top products chart data
  const topProductsChartData = useMemo(() => {
    return topProducts.map((p, index) => ({
      name: p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name,
      revenue: p.revenue,
      sold: p.sold,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [topProducts]);

  // Category performance
  const categoryPerformanceData = useMemo(() => {
    const categoryRevenue: Record<string, number> = {};
    orderItems.forEach((item: any) => {
      const order = orders.find((o: any) => o.id === item.order_id);
      if (order?.status === 'cancelled') return;
      const catId = item.products?.category_id;
      if (!catId) return;
      categoryRevenue[catId] = (categoryRevenue[catId] || 0) + (item.total || 0);
    });
    return Object.entries(categoryRevenue)
      .map(([id, revenue]) => ({
        id,
        name: categories.find((c: any) => c.id === id)?.name || 'Unknown',
        revenue: revenue as number,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [orderItems, orders, categories]);

  // Brand performance
  const brandPerformanceData = useMemo(() => {
    const brandRevenue: Record<string, number> = {};
    orderItems.forEach((item: any) => {
      const order = orders.find((o: any) => o.id === item.order_id);
      if (order?.status === 'cancelled') return;
      const brandId = item.products?.brand_id;
      if (!brandId) return;
      brandRevenue[brandId] = (brandRevenue[brandId] || 0) + (item.total || 0);
    });
    return Object.entries(brandRevenue)
      .map(([id, revenue]) => ({
        id,
        name: brands.find((b: any) => b.id === id)?.name || 'Unknown',
        revenue: revenue as number,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8);
  }, [orderItems, orders, brands]);

  // Order status distribution
  const orderStatusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    orders.forEach((order: any) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
    }));
  }, [orders]);

  // Export handlers
  const handleExportSales = () => {
    const data = salesTrendData.map((d) => ({
      'Period': d.label,
      'Revenue (₹)': d.revenue,
      'Orders': d.orders,
    }));
    exportToCSV(data, `sales-trend-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportProducts = () => {
    const data = topProducts.map((p, i) => ({
      'Rank': i + 1,
      'Product': p.name,
      'Units Sold': p.sold,
      'Revenue (₹)': p.revenue,
    }));
    exportToCSV(data, `top-products-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportCustomers = () => {
    const data = topCustomersData.map((c, i) => ({
      'Rank': i + 1,
      'Customer': c.name,
      'Total Spent (₹)': c.total,
    }));
    exportToCSV(data, `top-customers-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportInventory = () => {
    const data = inventory.map((item: any) => ({
      'Product': item.products?.name || 'Unknown',
      'SKU': item.products?.sku || '',
      'Quantity': item.quantity,
      'Min Quantity': item.min_quantity,
    }));
    exportToCSV(data, `inventory-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportDeadStock = () => {
    const data = deadStockProducts.map((p: any) => ({
      'Product': p.name,
      'SKU': p.sku,
      'Brand': p.brands?.name || '',
      'Category': p.product_categories?.name || '',
    }));
    exportToCSV(data, `dead-stock-${new Date().toISOString().split('T')[0]}.csv`);
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
      value: formatCurrency(stats.totalSales),
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      change: '+12%',
      changeUp: true,
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
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
    {
      title: 'Gross Profit',
      value: formatCurrency(stats.grossProfit),
      icon: BarChart2,
      color: 'bg-indigo-100 text-indigo-600',
      change: stats.grossProfit >= 0 ? '+5%' : '-5%',
      changeUp: stats.grossProfit >= 0,
    },
    {
      title: 'Net Profit',
      value: formatCurrency(stats.netProfit),
      icon: DollarSign,
      color: 'bg-emerald-100 text-emerald-600',
      change: stats.netProfit >= 0 ? '+3%' : '-3%',
      changeUp: stats.netProfit >= 0,
    },
    {
      title: 'Inventory Value',
      value: formatCurrency(stats.inventoryValue),
      icon: Package,
      color: 'bg-cyan-100 text-cyan-600',
    },
    {
      title: 'Dead Stock',
      value: stats.deadStockCount.toString(),
      icon: AlertTriangle,
      color: 'bg-rose-100 text-rose-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-navy-900">{pageTitle}</h1>
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

      {/* Sales Trend Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <BarChart2 className="text-navy-800" size={20} />
            <h2 className="font-semibold text-navy-900">Sales Trend</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Calendar className="text-gray-400" size={16} />
            {(['daily', 'weekly', 'monthly', 'yearly'] as DateRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-navy-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
            <button
              onClick={handleExportSales}
              className="ml-2 flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : value,
                  name === 'revenue' ? 'Revenue' : 'Orders'
                ]}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1a365d"
                strokeWidth={2}
                dot={{ fill: '#1a365d', r: 4 }}
                name="Revenue"
              />
              <Line
                type="monotone"
                dataKey="orders"
                stroke="#c5a047"
                strokeWidth={2}
                dot={{ fill: '#c5a047', r: 4 }}
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Award className="text-navy-800" size={20} />
              <h2 className="font-semibold text-navy-900">Top Products</h2>
            </div>
            <button
              onClick={handleExportProducts}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Download size={14} />
              Export
            </button>
          </div>
          {topProductsChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#1a365d" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmptyState />
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Star className="text-navy-800" size={20} />
              <h2 className="font-semibold text-navy-900">Top Customers</h2>
            </div>
            <button
              onClick={handleExportCustomers}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Download size={14} />
              Export
            </button>
          </div>
          {topCustomersData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCustomersData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Total Spent']} />
                  <Bar dataKey="total" fill="#c5a047" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmptyState />
          )}
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <PieChartIcon className="text-navy-800" size={20} />
              <h2 className="font-semibold text-navy-900">Category Performance</h2>
            </div>
          </div>
          {categoryPerformanceData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#4a5568" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmptyState />
          )}
        </div>

        {/* Brand Performance */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Eye className="text-navy-800" size={20} />
              <h2 className="font-semibold text-navy-900">Brand Performance</h2>
            </div>
          </div>
          {brandPerformanceData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => [formatCurrency(Number(value)), 'Revenue']} />
                  <Bar dataKey="revenue" fill="#68d391" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmptyState />
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <PieChartIcon className="text-navy-800" size={20} />
              <h2 className="font-semibold text-navy-900">Order Status Distribution</h2>
            </div>
          </div>
          {orderStatusData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${percent != null ? (percent * 100).toFixed(0) : 0}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((_entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ChartEmptyState />
          )}
        </div>

        {/* Dead Stock */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-navy-800" size={20} />
              <h2 className="font-semibold text-navy-900">Dead Stock</h2>
            </div>
            <button
              onClick={handleExportDeadStock}
              className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              <Download size={14} />
              Export
            </button>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {deadStockProducts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No dead stock found</div>
            ) : (
              deadStockProducts.map((product: any) => (
                <div key={product.id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-navy-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      {product.brands?.name} • {product.product_categories?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                      No sales (90 days)
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Export Reports Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <Download className="text-navy-800" size={20} />
          <h2 className="font-semibold text-navy-900">Export Reports</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportSales}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 text-white hover:bg-navy-900 transition-colors"
          >
            <Download size={16} />
            Sales Trend
          </button>
          <button
            onClick={handleExportProducts}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 text-white hover:bg-navy-900 transition-colors"
          >
            <Download size={16} />
            Top Products
          </button>
          <button
            onClick={handleExportCustomers}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 text-white hover:bg-navy-900 transition-colors"
          >
            <Download size={16} />
            Top Customers
          </button>
          <button
            onClick={handleExportInventory}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 text-white hover:bg-navy-900 transition-colors"
          >
            <Download size={16} />
            Inventory
          </button>
          <button
            onClick={handleExportDeadStock}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-800 text-white hover:bg-navy-900 transition-colors"
          >
            <Download size={16} />
            Dead Stock
          </button>
        </div>
      </div>
    </div>
  );
}
