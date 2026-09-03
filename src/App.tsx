import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { checkAdminAuth } from '@/hooks/useAdminAuth';

// Customer pages
import HomePage from '@/pages/HomePage';
import ShopPage from '@/pages/ShopPage';
import ProductPage from '@/pages/ProductPage';
import CartPage from '@/pages/CartPage';
import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import OrderTrackingPage from '@/pages/OrderTrackingPage';
import AccountPage from '@/pages/AccountPage';
import AboutPage from '@/pages/AboutPage';
import FAQPage from '@/pages/FAQPage';
import ShippingPolicyPage from '@/pages/ShippingPolicyPage';
import ReturnsPage from '@/pages/ReturnsPage';
import ContactPage from '@/pages/ContactPage';
import PrivacyPage from '@/pages/PrivacyPage';
import TermsPage from '@/pages/TermsPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Admin pages
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminProductEditor from '@/pages/admin/AdminProductEditor';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminFulfillment from '@/pages/admin/AdminFulfillment';
import AdminReturns from '@/pages/admin/AdminReturns';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminContent from '@/pages/admin/AdminContent';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminSettings from '@/pages/admin/AdminSettings';

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  if (!checkAdminAuth()) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/product/:slug" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
        <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/shipping" element={<ShippingPolicyPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/*" element={
          <ProtectedAdmin>
            <AdminLayout />
          </ProtectedAdmin>
        }>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductEditor />} />
          <Route path="products/:id/edit" element={<AdminProductEditor />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="fulfillment" element={<AdminFulfillment />} />
          <Route path="returns" element={<AdminReturns />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
