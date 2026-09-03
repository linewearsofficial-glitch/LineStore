import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-5xl md:text-7xl mb-4">TERMS OF SERVICE</h1>
          <p className="font-sans text-xs text-line-gray mb-12">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="font-sans text-sm text-line-gray space-y-8 leading-relaxed">
            {[
              { title: 'Acceptance of Terms', body: 'By accessing and using the Lin°e website, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our site.' },
              { title: 'Products and Pricing', body: 'We reserve the right to modify product descriptions, prices, and availability at any time. Prices are listed in USD. We make every effort to ensure product information is accurate.' },
              { title: 'Order Acceptance', body: 'All orders are subject to acceptance and availability. We reserve the right to cancel orders for any reason, including pricing errors. Payment is charged at the time of purchase.' },
              { title: 'Shipping and Delivery', body: 'Shipping times are estimates and not guaranteed. We are not responsible for delays caused by carriers, customs, or circumstances beyond our control.' },
              { title: 'Returns and Refunds', body: 'Our return policy is outlined on our Returns & Refunds page. By placing an order, you agree to the terms of that policy.' },
              { title: 'Intellectual Property', body: 'All content on this site, including images, text, logos, and design, is the property of Lin°e or its content suppliers and is protected by applicable copyright laws.' },
              { title: 'Limitation of Liability', body: 'Lin°e shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our products or services.' },
              { title: 'Changes to Terms', body: 'We may update these terms at any time. Continued use of the site after changes are posted constitutes your acceptance of the new terms.' },
              { title: 'Contact', body: 'For questions about these terms, contact us at support@linefashion.com.' },
            ].map((section) => (
              <section key={section.title}>
                <h2 className="font-display text-2xl text-line-black mb-3">{section.title}</h2>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
