import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const FAQS = [
  { q: 'How long does shipping take?', a: 'Standard shipping takes 7–14 business days for US orders. Expedited options may be available at checkout.' },
  { q: 'Do you offer free shipping?', a: 'Yes! All US orders over $75 qualify for free standard shipping. This is automatically applied at checkout.' },
  { q: 'What is your return policy?', a: 'We accept returns within 30 days of delivery for unworn, unwashed items with original tags attached. Contact us to initiate a return.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you will receive a tracking number via email. You can also use our Order Tracking page with your order number and email.' },
  { q: 'Can I change or cancel my order?', a: 'Orders can be cancelled within 12 hours of placement. After that, your order may already be in processing. Contact us immediately if you need to make changes.' },
  { q: 'What sizes do you carry?', a: 'We carry sizes XS through XXL. Check individual product pages for specific size guides and measurements.' },
  { q: 'Are the colors accurate in photos?', a: 'We work hard to represent our products accurately. Minor variations may occur due to screen settings and photography lighting.' },
  { q: 'How do I care for my items?', a: 'Care instructions vary by item. Refer to the product page and the garment\'s care label. When in doubt, cold water gentle cycle and air dry.' },
  { q: 'Do you restock sold-out items?', a: 'Some items are restocked. Follow us on TikTok and subscribe to our newsletter to get notified first when items come back.' },
  { q: 'How do I contact customer support?', a: 'Use our Contact page to reach us. We respond within 24–48 hours, Monday–Friday.' },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-sans text-xs uppercase tracking-[0.3em] text-line-gray block mb-2">Support</span>
            <h1 className="font-display text-6xl md:text-8xl leading-none">FAQ</h1>
          </div>
          <div className="space-y-0">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-line-border">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full text-left py-5 flex items-center justify-between gap-4"
                >
                  <span className="font-sans font-medium text-sm md:text-base">{faq.q}</span>
                  {open === i ? <ChevronUp size={16} className="flex-shrink-0" /> : <ChevronDown size={16} className="flex-shrink-0" />}
                </button>
                {open === i && (
                  <div className="pb-5">
                    <p className="font-sans text-sm text-line-gray leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
