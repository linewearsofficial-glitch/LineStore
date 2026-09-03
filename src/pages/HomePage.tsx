import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/features/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: products = [] } = useProducts();
  const { data: settings } = useSiteSettings();
  const featured = products.slice(0, 4);

  const heroBg = settings?.['hero_bg_image'] || 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&q=90&fit=crop';
  const section1 = settings?.['section1_image'] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80&fit=crop';
  const section2 = settings?.['section2_image'] || 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80&fit=crop';
  const editorialImg = settings?.['editorial_image'] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1400&q=90&fit=crop';
  const lookImg = settings?.['look_image'] || 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&q=80&fit=crop';

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />

      <main className="flex-1">
        {/* ── HERO ── */}
        <section className="relative h-[85vh] md:h-screen max-h-[900px] overflow-hidden">
          <img
            src={heroBg}
            alt="Hero"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="relative z-10 h-full flex items-end md:items-center">
            <div className="px-6 md:px-16 pb-16 md:pb-0">
              <span className="font-sans text-xs tracking-[0.3em] uppercase text-line-nude mb-4 block">
                New Collection
              </span>
              <h1 className="font-display text-[clamp(4rem,12vw,9rem)] text-white leading-none mb-6">
                WEAR THE<br />SILENCE
              </h1>
              <p className="font-serif italic text-white/80 text-lg md:text-xl mb-8 max-w-md">
                Pieces that say everything<br />without saying a word.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/shop')} className="btn-nude">
                  Shop the Collection
                </button>
                <button onClick={() => navigate('/shop')} className="btn-outline border-white text-white hover:bg-white hover:text-line-black">
                  View Lookbook
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURED PRODUCT ── */}
        {featured[0] && (
          <section className="py-16 md:py-24 bg-line-light">
            <div className="max-w-[1400px] mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div className="relative">
                <div className="aspect-[3/4] overflow-hidden">
                  {featured[0].images?.[0]?.url ? (
                    <img
                      src={featured[0].images[0].url}
                      alt={featured[0].name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-line-border flex items-center justify-center">
                      <span className="font-display text-6xl text-white">LIN°E</span>
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-4 -right-4 bg-line-nude text-white font-display text-lg tracking-widest px-4 py-2">
                  FEATURED
                </div>
              </div>
              <div>
                <span className="font-sans text-xs tracking-[0.3em] uppercase text-line-gray">Editor's Pick</span>
                <h2 className="font-display text-5xl md:text-7xl text-line-black mt-2 mb-4 leading-none">
                  {featured[0].name.toUpperCase()}
                </h2>
                <p className="font-serif text-line-gray text-lg leading-relaxed mb-8">
                  {featured[0].description || 'Elevated basics reimagined. Built for the woman who moves with intention.'}
                </p>
                <div className="flex items-center gap-4 mb-8">
                  <span className="font-display text-3xl">${featured[0].price}</span>
                  {featured[0].compare_at_price && (
                    <span className="font-sans text-line-gray line-through">${featured[0].compare_at_price}</span>
                  )}
                </div>
                <Link to={`/product/${featured[0].slug}`} className="btn-primary inline-flex items-center gap-3">
                  Shop Now <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ── EDITORIAL IMAGES ── */}
        <section className="py-0">
          <div className="grid grid-cols-2 md:grid-cols-3 h-[60vw] max-h-[600px]">
            <div className="relative overflow-hidden col-span-2 md:col-span-1 row-span-1">
              <img src={section1} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
            <div className="relative overflow-hidden">
              <img src={editorialImg} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/30 flex items-end p-6">
                <div>
                  <h3 className="font-display text-3xl text-white mb-2">THE EDIT</h3>
                  <Link to="/shop" className="font-sans text-xs text-white/80 uppercase tracking-widest hover:text-white">
                    Shop Now →
                  </Link>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden">
              <img src={section2} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </section>

        {/* ── PRODUCT GRID ── */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="font-sans text-xs tracking-[0.3em] uppercase text-line-gray block mb-2">The Collection</span>
                <h2 className="font-display text-5xl md:text-7xl leading-none">NEW IN</h2>
              </div>
              <Link to="/shop" className="hidden md:flex items-center gap-2 font-sans text-sm uppercase tracking-widest hover:text-line-gray transition-colors">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {featured.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {featured.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-sans text-line-gray text-lg">Collection coming soon.</p>
                <p className="font-sans text-sm text-line-gray mt-2">Products will appear here once added in the admin panel.</p>
              </div>
            )}
            <div className="mt-8 text-center md:hidden">
              <Link to="/shop" className="btn-outline inline-block">View All</Link>
            </div>
          </div>
        </section>

        {/* ── SHOP THE LOOK ── */}
        <section className="py-16 md:py-24 bg-line-black text-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="font-sans text-xs tracking-[0.3em] uppercase text-line-nude block mb-2">Styling</span>
              <h2 className="font-display text-5xl md:text-7xl leading-none mb-6">SHOP<br />THE LOOK</h2>
              <p className="font-serif italic text-white/70 text-lg mb-8 leading-relaxed">
                Style is a language. These are the words that matter.
              </p>
              <Link to="/shop" className="btn-nude inline-flex items-center gap-3">
                Explore All <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative aspect-[4/5] overflow-hidden">
              <img src={lookImg} alt="Shop the look" className="w-full h-full object-cover" />
              {featured[1] && (
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 p-4">
                  <p className="font-sans text-xs uppercase tracking-widest text-line-gray mb-1">Featured</p>
                  <p className="font-sans font-semibold text-sm text-line-black">{featured[1]?.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-sans font-bold">${featured[1]?.price}</span>
                    <Link to={`/product/${featured[1]?.slug}`} className="font-sans text-xs uppercase tracking-widest text-line-black hover:text-line-gray">
                      Shop →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── BRAND STORY ── */}
        <section className="py-20 md:py-32">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8 text-center">
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-line-gray block mb-6">Our Story</span>
            <h2 className="font-display text-6xl md:text-9xl leading-none mb-8">LIN°E</h2>
            <p className="font-serif italic text-xl md:text-2xl text-line-gray max-w-2xl mx-auto leading-relaxed mb-10">
              {settings?.['about_text'] || 'Lin°e was built for women who move with intention. Every piece is chosen for the woman who values quality, effortless fit, and a wardrobe that works harder than trends.'}
            </p>
            <Link to="/about" className="btn-outline inline-block">Our Story</Link>
          </div>
        </section>

        {/* ── TIKTOK SECTION ── */}
        <section className="py-16 bg-line-light">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8 text-center">
            <span className="font-sans text-xs tracking-[0.3em] uppercase text-line-gray block mb-4">As seen on TikTok</span>
            <h2 className="font-display text-4xl md:text-6xl mb-6 leading-none">JOIN THE COMMUNITY</h2>
            <p className="font-sans text-sm text-line-gray mb-8 max-w-md mx-auto">
              Follow us for daily styling content, behind-the-scenes looks, and first access to new drops.
            </p>
            {settings?.['tiktok_url'] ? (
              <a
                href={settings['tiktok_url']}
                target="_blank"
                rel="noreferrer"
                className="btn-primary inline-flex items-center gap-3"
              >
                <Play size={16} fill="white" />
                Follow on TikTok
              </a>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-line-border flex items-center justify-center">
                    <Play size={24} className="text-line-gray" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── NEWSLETTER ── */}
        <section className="py-20 bg-line-black text-white">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8 text-center">
            <h2 className="font-display text-5xl md:text-7xl mb-4 leading-none">
              {settings?.['newsletter_headline'] || 'BE FIRST. ALWAYS.'}
            </h2>
            <p className="font-serif italic text-white/60 text-lg mb-8">
              {settings?.['newsletter_subheadline'] || 'New drops, styling edits, and members-only access.'}
            </p>
            <div className="flex max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-white/10 border border-white/20 px-4 py-4 text-white placeholder-gray-500 font-sans text-sm focus:outline-none focus:border-line-nude"
              />
              <button className="bg-line-nude text-white px-6 font-sans font-semibold text-sm uppercase tracking-widest hover:opacity-90 whitespace-nowrap">
                Join
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
