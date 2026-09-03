import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-5xl md:text-7xl mb-12">SHIPPING POLICY</h1>
          <div className="prose font-sans text-line-gray space-y-6 text-sm leading-relaxed">
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">Processing Time</h2>
              <p>Orders are typically processed within 1–3 business days after payment confirmation. During high-volume periods, processing may take up to 5 business days.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">Shipping Times</h2>
              <p><strong className="text-line-black">Standard Shipping (US):</strong> 7–14 business days</p>
              <p>Shipping times are estimates and not guaranteed. Once a package leaves our fulfillment partner, delivery is managed by the carrier.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">Free Shipping</h2>
              <p>All US orders over $75 qualify for free standard shipping. This discount is automatically applied at checkout when your subtotal meets the threshold.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">Tracking</h2>
              <p>Once your order ships, you will receive a tracking number via email. You can track your order using our Order Tracking page or directly on the carrier's website.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">Address Accuracy</h2>
              <p>Please ensure your shipping address is accurate at checkout. We are not responsible for packages delivered to incorrect addresses provided by the customer.</p>
            </section>
            <section>
              <h2 className="font-display text-2xl text-line-black mb-3">Lost or Damaged Packages</h2>
              <p>If your package is lost or arrives damaged, please contact us within 7 days of the expected delivery date. We will work with you to resolve the issue.</p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
