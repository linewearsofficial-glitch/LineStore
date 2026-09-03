import { Link } from 'react-router-dom';
import { Instagram, Music2 } from 'lucide-react';
import BrandLogo from '@/components/features/BrandLogo';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function Footer() {
  const { data: settings } = useSiteSettings();

  return (
    <footer className="bg-line-black text-white">
      {/* Main footer */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
        {/* Brand */}
        <div className="md:col-span-1">
          <BrandLogo color="white" size="md" linkTo="/" />
          <p className="font-serif italic text-line-nude-light text-sm mt-4 leading-relaxed">
            Minimal. Intentional. Yours.
          </p>
          <div className="flex gap-4 mt-6">
            {settings?.['tiktok_url'] && (
              <a href={settings['tiktok_url']} target="_blank" rel="noreferrer" className="text-white hover:text-line-nude transition-colors">
                <Music2 size={20} />
              </a>
            )}
            {settings?.['instagram_url'] && (
              <a href={settings['instagram_url']} target="_blank" rel="noreferrer" className="text-white hover:text-line-nude transition-colors">
                <Instagram size={20} />
              </a>
            )}
            {settings?.['pinterest_url'] && (
              <a href={settings['pinterest_url']} target="_blank" rel="noreferrer" className="text-white hover:text-line-nude transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-display text-lg tracking-widest mb-4 text-line-nude">SHOP</h4>
          <ul className="space-y-3">
            {[
              { label: 'All Products', to: '/shop' },
              { label: 'New Arrivals', to: '/shop?sort=new' },
              { label: 'Tops', to: '/shop?category=tops' },
              { label: 'Bottoms', to: '/shop?category=bottoms' },
              { label: 'Dresses', to: '/shop?category=dresses' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="font-sans text-sm text-gray-400 hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="font-display text-lg tracking-widest mb-4 text-line-nude">HELP</h4>
          <ul className="space-y-3">
            {[
              { label: 'FAQ', to: '/faq' },
              { label: 'Shipping Policy', to: '/shipping' },
              { label: 'Returns & Refunds', to: '/returns' },
              { label: 'Contact Us', to: '/contact' },
              { label: 'Track Your Order', to: '/track/lookup' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="font-sans text-sm text-gray-400 hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal + Newsletter */}
        <div>
          <h4 className="font-display text-lg tracking-widest mb-4 text-line-nude">STAY CONNECTED</h4>
          <p className="font-sans text-sm text-gray-400 mb-4">New drops and styling edits to your inbox.</p>
          <div className="flex">
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 bg-white/10 border border-white/20 px-3 py-2.5 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-line-nude"
            />
            <button className="bg-line-nude text-white px-4 text-xs tracking-widest uppercase font-semibold hover:opacity-90">
              Join
            </button>
          </div>
          <ul className="mt-6 space-y-2">
            {[
              { label: 'About', to: '/about' },
              { label: 'Privacy Policy', to: '/privacy' },
              { label: 'Terms of Service', to: '/terms' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="font-sans text-xs text-gray-500 hover:text-white transition-colors">{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Payment logos + copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-gray-600">© {new Date().getFullYear()} Lin°e. All rights reserved.</p>
          {/* Payment provider logos */}
          <div className="flex items-center gap-4">
            {/* Paystack */}
            <div className="bg-white rounded px-2 py-1">
              <svg height="18" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="18" fontFamily="Arial" fontSize="14" fontWeight="bold" fill="#00C3F7">Paystack</text>
              </svg>
            </div>
            {/* Flutterwave */}
            <div className="bg-white rounded px-2 py-1">
              <svg height="18" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="18" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#F5A623">Flutterwave</text>
              </svg>
            </div>
            {/* Apple Pay */}
            <div className="bg-white rounded px-2 py-1">
              <svg height="18" viewBox="0 0 50 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <text x="0" y="17" fontFamily="Arial" fontSize="11" fontWeight="600" fill="#000"> Pay</text>
              </svg>
            </div>
            {/* Visa */}
            <div className="bg-white rounded px-2 py-1 flex items-center">
              <svg height="14" viewBox="0 0 38 12" fill="none"><text x="0" y="11" fontFamily="Arial" fontSize="12" fontWeight="bold" fill="#1A1F71">VISA</text></svg>
            </div>
            {/* Mastercard */}
            <div className="flex items-center gap-0">
              <div className="w-5 h-5 rounded-full bg-red-500 opacity-90" />
              <div className="w-5 h-5 rounded-full bg-yellow-400 opacity-90 -ml-2" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
