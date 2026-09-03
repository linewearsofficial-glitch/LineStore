import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import BrandLogo from '@/components/features/BrandLogo';
import CartDrawer from '@/components/features/CartDrawer';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const itemCount = useCartStore((s) => s.getItemCount());
  const { openCart } = useCartStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 bg-line-white transition-shadow duration-300',
          scrolled ? 'shadow-sm' : ''
        )}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 -ml-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Desktop nav left */}
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="font-sans text-sm tracking-widest uppercase text-line-black hover:text-line-gray transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Logo center */}
            <div className="absolute left-1/2 -translate-x-1/2">
              <BrandLogo size="md" />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-4 ml-auto">
              <button
                className="p-2 hover:opacity-60 transition-opacity hidden md:block"
                onClick={() => navigate('/shop')}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <button
                className="p-2 hover:opacity-60 transition-opacity hidden md:block"
                onClick={() => navigate('/account')}
                aria-label="Account"
              >
                <User size={20} />
              </button>
              <button
                className="p-2 hover:opacity-60 transition-opacity relative"
                onClick={openCart}
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-line-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-line-border absolute w-full z-50">
            <div className="px-6 py-6 flex flex-col gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="font-display text-3xl text-line-black"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-line-border pt-4 flex flex-col gap-4">
                <Link to="/account" className="font-sans text-sm uppercase tracking-widest text-line-gray" onClick={() => setMobileOpen(false)}>Account</Link>
                <Link to="/shop" className="font-sans text-sm uppercase tracking-widest text-line-gray" onClick={() => setMobileOpen(false)}>Search</Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <CartDrawer />
    </>
  );
}
