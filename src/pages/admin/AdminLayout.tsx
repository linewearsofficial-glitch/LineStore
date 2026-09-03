import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Truck,
  RotateCcw, CreditCard, Video, BarChart2, Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import BrandLogo from '@/components/features/BrandLogo';

const NAV = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/fulfillment', icon: Truck, label: 'Fulfillment' },
  { to: '/admin/returns', icon: RotateCcw, label: 'Returns' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/content', icon: Video, label: 'TikTok Content' },
  { to: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-6 border-b border-gray-100">
        <BrandLogo size="sm" />
        <p className="font-sans text-xs text-gray-400 mt-1 tracking-widest">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="admin-nav-link w-full text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-line-light flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-white border-r border-gray-100 fixed left-0 top-0 h-full z-30">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-56 bg-white z-50 md:hidden shadow-xl">
            <Sidebar />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        {/* Mobile topbar */}
        <div className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
          <BrandLogo size="sm" />
          <button onClick={handleLogout} className="text-red-500"><LogOut size={18} /></button>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
