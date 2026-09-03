import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-5xl md:text-7xl mb-4">PRIVACY POLICY</h1>
          <p className="font-sans text-xs text-line-gray mb-12">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <div className="font-sans text-sm text-line-gray space-y-8 leading-relaxed">
            {[
              { title: 'Information We Collect', body: 'We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you place an order. We also collect information about your browsing activity on our website.' },
              { title: 'How We Use Your Information', body: 'We use your information to process and fulfill orders, send order confirmations and updates, respond to customer inquiries, send marketing communications (with your consent), and improve our services.' },
              { title: 'Information Sharing', body: 'We do not sell, trade, or transfer your personal information to outside parties except as necessary to fulfill your order (e.g., shipping carriers, payment processors) or as required by law.' },
              { title: 'Payment Security', body: 'All payment processing is handled by our payment providers (Paystack and Flutterwave). We do not store your raw card information on our servers.' },
              { title: 'Cookies', body: 'We use cookies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can disable cookies in your browser settings, though some features may not function properly.' },
              { title: 'Your Rights', body: 'You have the right to access, correct, or delete your personal information. Contact us at support@linefashion.com to make a request.' },
              { title: 'Contact', body: 'For privacy-related questions, contact us at support@linefashion.com.' },
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
