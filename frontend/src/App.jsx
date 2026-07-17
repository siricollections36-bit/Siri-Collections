import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';
import Loader from './components/Loader/Loader.jsx';
import ScrollToTop from './components/ScrollToTop';

// Lazy load public pages
const Home = lazy(() => import('./pages/Home/Home.jsx'));
const Shop = lazy(() => import('./pages/Shop/Shop.jsx'));
const Collections = lazy(() => import('./pages/Collections/Collections.jsx'));
const ProductDetails = lazy(() => import('./pages/ProductDetails/ProductDetails.jsx'));
const Cart = lazy(() => import('./pages/Cart/Cart.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist/Wishlist.jsx'));
const Checkout = lazy(() => import('./pages/Checkout/Checkout.jsx'));
const Login = lazy(() => import('./pages/Login/Login.jsx'));
const Signup = lazy(() => import('./pages/Signup/Signup.jsx'));
const Profile = lazy(() => import('./pages/Profile/Profile.jsx'));
const Orders = lazy(() => import('./pages/Orders/Orders.jsx'));
const About = lazy(() => import('./pages/About/About.jsx'));
const Contact = lazy(() => import('./pages/Contact/Contact.jsx'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound.jsx'));
const OrderSuccess = lazy(() => import('./pages/Checkout/OrderSuccess.jsx'));
const OrderDetails = lazy(() => import('./pages/OrderDetails/OrderDetails.jsx'));

// Admin pages
const Dashboard = lazy(() => import('./pages/Admin/Dashboard/Dashboard.jsx'));
const AdminProducts = lazy(() => import('./pages/Admin/Products/AdminProducts.jsx'));
const AdminOrders = lazy(() => import('./pages/Admin/Orders/AdminOrders.jsx'));
const AdminCustomers = lazy(() => import('./pages/Admin/Customers/AdminCustomers.jsx'));
const AdminCategories = lazy(() => import('./pages/Admin/Categories/AdminCategories.jsx'));
const AdminSettings = lazy(() => import('./pages/Admin/Settings/AdminSettings.jsx'));
const ForgotPassword = lazy(() => import('./pages/Login/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/Login/ResetPassword.jsx'));

// Guard to protect Admin routes
function AdminGuard({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) return <Loader fullPage />;
  
  // If no user or user is not admin, send them to login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <Routes>
        {/* PUBLIC ROUTES (Main Website) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/order-success/:orderId" element={<OrderSuccess />} />
          <Route path="/order-details/:id" element={<OrderDetails />} />
          
          {/* Catch-all 404 inside MainLayout */}
          <Route path="/404" element={<NotFound />} />
        </Route>

        {/* ADMIN ROUTES (Dashboard) */}
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          {/* This makes /admin show the dashboard */}
          <Route index element={<Dashboard />} />
          
          {/* This makes /admin/dashboard also show the dashboard (Fixes the 404) */}
          <Route path="dashboard" element={<Dashboard />} />
          
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Global Catch-all: Redirect unknown URLs to /404 */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <BrowserRouter>
    <ScrollToTop /> 
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <AppRoutes />
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}