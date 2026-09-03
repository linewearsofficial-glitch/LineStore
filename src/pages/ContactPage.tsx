import { useState } from 'react';
import AnnouncementBar from '@/components/layout/AnnouncementBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success('Message sent! We\'ll get back to you within 24–48 hours.');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-sans text-xs uppercase tracking-[0.3em] text-line-gray block mb-2">Get in Touch</span>
            <h1 className="font-display text-6xl md:text-8xl leading-none">CONTACT US</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2 className="font-display text-3xl mb-8">WE'RE HERE</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Mail size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans font-medium text-sm">Email</p>
                    <p className="font-sans text-line-gray text-sm">support@linefashion.com</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-sans font-medium text-sm">Response Time</p>
                    <p className="font-sans text-line-gray text-sm">Within 24–48 hours, Monday–Friday</p>
                  </div>
                </div>
              </div>
              <div className="mt-10 bg-line-light p-6">
                <h3 className="font-display text-xl mb-3">BEFORE YOU REACH OUT</h3>
                <p className="font-sans text-sm text-line-gray">
                  Check our <a href="/faq" className="underline text-line-black">FAQ page</a> — most common questions are answered there. For order tracking, use the <a href="/track/lookup" className="underline text-line-black">Order Tracking</a> page.
                </p>
              </div>
            </div>

            {/* Form */}
            <div>
              {submitted ? (
                <div className="border border-line-border p-8 text-center">
                  <h3 className="font-display text-3xl mb-4">MESSAGE SENT</h3>
                  <p className="font-serif italic text-line-gray">We'll get back to you within 24–48 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest block mb-2">Name *</label>
                    <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-box" />
                  </div>
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest block mb-2">Email *</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-box" />
                  </div>
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest block mb-2">Subject</label>
                    <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-box" />
                  </div>
                  <div>
                    <label className="font-sans text-xs uppercase tracking-widest block mb-2">Message *</label>
                    <textarea
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      rows={5}
                      className="input-box resize-none"
                    />
                  </div>
                  <button type="submit" className="btn-primary w-full">Send Message</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
