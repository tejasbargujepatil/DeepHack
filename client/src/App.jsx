import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/RouteGuards';

// Lazy loaded pages
const HomePage        = lazy(() => import('./pages/HomePage'));
const ProductsPage    = lazy(() => import('./pages/ProductsPage'));
const ProductDetail   = lazy(() => import('./pages/ProductDetailPage'));
const CartPage        = lazy(() => import('./pages/CartPage'));
const CheckoutPage    = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const LoginPage       = lazy(() => import('./pages/LoginPage'));
const RegisterPage       = lazy(() => import('./pages/RegisterPage'));
const AdminRegisterPage  = lazy(() => import('./pages/AdminRegisterPage'));
const OrdersPage         = lazy(() => import('./pages/OrdersPage'));
const WishlistPage       = lazy(() => import('./pages/WishlistPage'));

const AdminLayout     = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts   = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders     = lazy(() => import('./pages/admin/AdminOrders'));
const AdminUsers      = lazy(() => import('./pages/admin/AdminUsers'));
const SuperAdminRetailers = lazy(() => import('./pages/admin/SuperAdminRetailers'));


const Spinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const StoreLayout = ({ children }) => (
  <>
    <Navbar />
    <main className="min-h-screen">{children}</main>
    <Footer />
    <Chatbot />
  </>
);

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' },
                success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
                error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
              }}
            />

            <Suspense fallback={<Spinner />}>
              <Routes>
                {/* Public Store Routes */}
                <Route path="/" element={<StoreLayout><HomePage /></StoreLayout>} />
                <Route path="/products" element={<StoreLayout><ProductsPage /></StoreLayout>} />
                <Route path="/products/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
                <Route path="/cart" element={<StoreLayout><ProtectedRoute><CartPage /></ProtectedRoute></StoreLayout>} />
                <Route path="/checkout" element={<StoreLayout><ProtectedRoute><CheckoutPage /></ProtectedRoute></StoreLayout>} />
                <Route path="/order-success" element={<StoreLayout><ProtectedRoute><OrderSuccessPage /></ProtectedRoute></StoreLayout>} />
                <Route path="/orders"   element={<StoreLayout><ProtectedRoute><OrdersPage /></ProtectedRoute></StoreLayout>} />
                <Route path="/wishlist" element={<StoreLayout><ProtectedRoute><WishlistPage /></ProtectedRoute></StoreLayout>} />

                {/* Auth Routes (Guest Only) */}
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                <Route path="/admin-register" element={<AdminRegisterPage />} />

                                <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  {/* SUPER_ADMIN only routes */}
                  <Route path="retailers" element={<SuperAdminRetailers />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>


                {/* 404 */}
                <Route path="*" element={
                  <StoreLayout>
                    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                      <p className="text-8xl font-black text-gradient">404</p>
                      <p className="text-xl text-gray-500">Page not found</p>
                      <a href="/" className="btn-primary px-8 py-3">Go Home</a>
                    </div>
                  </StoreLayout>
                } />
              </Routes>
            </Suspense>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
