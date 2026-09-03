import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/features/ProductCard';
import { useProducts } from '@/hooks/useProducts';

const SORT_OPTIONS = [
  { value: 'new', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function ShopPage() {
  const { data: products = [], isLoading } = useProducts();
  const [sort, setSort] = useState('new');
  const [filterOpen, setFilterOpen] = useState(false);

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price_asc') return a.price - b.price;
    if (sort === 'price_desc') return b.price - a.price;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  });

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        {/* Page header */}
        <div className="py-14 text-center border-b border-line-border">
          <span className="font-sans text-xs tracking-[0.3em] uppercase text-line-gray block mb-2">Browse</span>
          <h1 className="font-display text-6xl md:text-8xl leading-none">THE COLLECTION</h1>
        </div>

        {/* Controls */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-4 flex items-center justify-between border-b border-line-border">
          <p className="font-sans text-sm text-line-gray">{sorted.length} pieces</p>
          <div className="flex items-center gap-4">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="select-line w-48"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 py-8">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-line-light" />
                  <div className="mt-3 h-4 bg-line-light w-3/4" />
                  <div className="mt-2 h-3 bg-line-light w-1/4" />
                </div>
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="py-32 text-center">
              <h2 className="font-display text-5xl mb-4">COMING SOON</h2>
              <p className="font-sans text-line-gray">The collection is being curated. Check back shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {sorted.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
