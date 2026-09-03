import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Link } from 'react-router-dom';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-5xl md:text-7xl mb-12">RETURNS & REFUNDS</h1>
          <div className="font-sans text-line-gray space-y-8 text-sm leading-relaxed">
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">Return Policy</h2>
              <p>We accept returns within <strong className="text-line-black">30 days</strong> of delivery for items that are:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Unworn and unwashed</li>
                <li>In original condition with all tags attached</li>
                <li>Free from perfume, smoke, pet hair, or other odors</li>
              </ul>
            </section>
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">Non-Returnable Items</h2>
              <p>The following items cannot be returned: Final sale items, items marked as non-returnable on the product page.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">How to Start a Return</h2>
              <ol className="list-decimal pl-5 space-y-2">
                <li>Contact us via our <Link to="/contact" className="underline text-line-black">Contact page</Link> with your order number and reason for return.</li>
                <li>We will provide return instructions within 1–2 business days.</li>
                <li>Ship your item(s) back using a tracked shipping method.</li>
                <li>Once received and inspected, your refund will be processed within 5–7 business days.</li>
              </ol>
            </section>
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">Refunds</h2>
              <p>Approved refunds are issued to the original payment method. Please allow 5–10 business days for the refund to appear depending on your bank or card issuer.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">Damaged or Wrong Items</h2>
              <p>If you received a damaged or incorrect item, contact us within 7 days of delivery with photos. We will issue a full refund or replacement at no additional cost.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
