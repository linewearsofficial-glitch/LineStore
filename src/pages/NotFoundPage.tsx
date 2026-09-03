import { Link } from 'react-router-dom';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <h1 className="font-display text-[12rem] md:text-[16rem] leading-none text-line-light">404</h1>
          <h2 className="font-display text-5xl md:text-7xl -mt-10 mb-6">NOT FOUND</h2>
          <p className="font-serif italic text-line-gray text-lg mb-10">This page stepped out. Permanently.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="btn-primary">Go Home</Link>
            <Link to="/shop" className="btn-outline">Shop Collection</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
