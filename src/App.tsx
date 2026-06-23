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

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();

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
                  <Route path="virtual-try-on" element={<VirtualTryOnPage />} />
                  <Route path="ai-stylist" element={<AIStylistPage />} />
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
                  <Route path="inventory" element={<AdminInventoryPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="customers" element={<AdminCustomersPage />} />
                  <Route path="reports" element={<AdminReportsPage />} />
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
