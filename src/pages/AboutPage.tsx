import { Link } from 'react-router-dom';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="relative h-[50vh] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=90&fit=crop"
            alt="About Lin°e"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <h1 className="font-display text-7xl md:text-9xl text-white leading-none">OUR STORY</h1>
          </div>
        </div>

        {/* Story */}
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <span className="font-sans text-xs uppercase tracking-[0.3em] text-line-gray block mb-6">Who We Are</span>
          <h2 className="font-display text-5xl md:text-7xl mb-10 leading-none">BUILT FOR THE<br />INTENTIONAL WOMAN</h2>
          <p className="font-serif text-xl text-line-gray leading-relaxed mb-8">
            Lin°e was born from a simple belief: that great style isn't about having more — it's about choosing better. Every piece in our collection is selected with purpose, designed to move with you and last beyond the season.
          </p>
          <p className="font-serif text-xl text-line-gray leading-relaxed mb-12">
            We curate elevated basics and intentional statement pieces for the woman who values her time, her money, and her wardrobe. Less noise. More intention.
          </p>
          <Link to="/shop" className="btn-primary inline-block">Shop the Collection</Link>
        </div>

        {/* Values */}
        <div className="bg-line-black text-white py-20">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8">
            <h2 className="font-display text-5xl md:text-7xl text-center mb-16">WHAT WE STAND FOR</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'QUALITY FIRST', body: 'Every piece is selected for construction, fabric quality, and lasting wear. We refuse to compromise.' },
                { title: 'TIMELESS DESIGN', body: 'We stay out of the trend cycle. Our pieces are chosen to integrate with a wardrobe you build over years.' },
                { title: 'HONEST PRICING', body: 'No fake markups. No manufactured urgency. Just honest pricing for pieces worth owning.' },
              ].map((v) => (
                <div key={v.title} className="border border-white/20 p-8">
                  <h3 className="font-display text-2xl text-line-nude mb-4">{v.title}</h3>
                  <p className="font-serif italic text-white/70 leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
