import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { useAuth } from './contexts/AuthContext';

// Layout
import Layout from './components/layout/Layout';
import AdminLayout from './components/admin/AdminLayout';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BrandsPage from './pages/BrandsPage';
import ServicesPage from './pages/ServicesPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import AISearchPage from './pages/AISearchPage';

// Virtual Try-On
import VirtualTryOnPage from './pages/virtual-tryon/VirtualTryOnPage';

// AI Stylist
import AIStylistPage from './pages/ai-stylist/AIStylistPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminPurchasesPage from './pages/admin/AdminPurchasesPage';
import AdminAlertsPage from './pages/admin/AdminAlertsPage';
import AdminPrescriptionsPage from './pages/admin/AdminPrescriptionsPage';

function ProtectedAdminRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { isAdmin, loading, userRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== 'owner' && userRole !== 'manager') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function InventoryRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, isOwner, isManager, isInventoryStaff } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800"></div>
    </div>
  );
  if (!isAdmin || (!isOwner && !isManager && !isInventoryStaff)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function SalesRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading, isOwner, isManager, isSalesStaff } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy-800"></div>
    </div>
  );
  if (!isAdmin || (!isOwner && !isManager && !isSalesStaff)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <CartProvider>
            <WishlistProvider>
              <Routes>
                {/* Storefront Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="products/:id" element={<ProductDetailPage />} />
                  <Route path="brands" element={<BrandsPage />} />
                  <Route path="services" element={<ServicesPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="wishlist" element={<WishlistPage />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="order-tracking" element={<OrderTrackingPage />} />
                  <Route path="virtual-try-on" element={<VirtualTryOnPage />} />
                  <Route path="ai-stylist" element={<AIStylistPage />} />
                  <Route path="ai-search" element={<AISearchPage />} />
                </Route>

                {/* Admin Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedAdminRoute>
                      <AdminLayout />
                    </ProtectedAdminRoute>
                  }
                >
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="inventory" element={<InventoryRoute><AdminInventoryPage /></InventoryRoute>} />
                  <Route path="orders" element={<SalesRoute><AdminOrdersPage /></SalesRoute>} />
                  <Route path="customers" element={<SalesRoute><AdminCustomersPage /></SalesRoute>} />
                  <Route path="reports" element={<ProtectedAdminRoute requiredRole="manager"><AdminReportsPage /></ProtectedAdminRoute>} />
                  <Route path="purchases" element={<InventoryRoute><AdminPurchasesPage /></InventoryRoute>} />
                  <Route path="alerts" element={<InventoryRoute><AdminAlertsPage /></InventoryRoute>} />
                  <Route path="prescriptions" element={<SalesRoute><AdminPrescriptionsPage /></SalesRoute>} />
                  <Route path="settings" element={<div className="text-center py-20 text-gray-500">Settings page coming soon</div>} />
                  <Route path="notifications" element={<div className="text-center py-20 text-gray-500">Notifications page coming soon</div>} />
                </Route>

                {/* Catch all */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </WishlistProvider>
          </CartProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
