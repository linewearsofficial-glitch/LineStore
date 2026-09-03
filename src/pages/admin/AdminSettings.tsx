import { useState, useEffect } from 'react';
import { useSiteSettings, useUpdateSettings } from '@/hooks/useSiteSettings';
import ImageUploader from '@/components/features/ImageUploader';
import { Save, Globe, CreditCard, Package, Mail, Image } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSettings();
  const [form, setForm] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => updateSettings.mutate(form);

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'images', label: 'Site Images', icon: Image },
    { id: 'payment', label: 'Payments', icon: CreditCard },
    { id: 'cj', label: 'CJ Dropshipping', icon: Package },
    { id: 'social', label: 'Social Links', icon: Globe },
    { id: 'email', label: 'Email', icon: Mail },
  ];

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-line-black border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl">SETTINGS</h1>
          <p className="font-sans text-sm text-line-gray">Manage your store configuration</p>
        </div>
        <button onClick={handleSave} disabled={updateSettings.isPending} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          <Save size={16} /> {updateSettings.isPending ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-6 border-b border-line-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-sans text-sm border-b-2 transition-colors ${activeTab === tab.id ? 'border-line-black text-line-black font-medium' : 'border-transparent text-line-gray hover:text-line-black'}`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="admin-card space-y-5">
          <h2 className="font-display text-2xl border-b border-line-border pb-3">GENERAL SETTINGS</h2>
          {[
            { key: 'announcement_bar', label: 'Announcement Bar Text', placeholder: 'Free Shipping on Orders $75+' },
            { key: 'hero_headline', label: 'Hero Headline', placeholder: 'WEAR THE SILENCE' },
            { key: 'hero_subheadline', label: 'Hero Subheadline', placeholder: 'Minimal. Intentional. Yours.' },
            { key: 'hero_cta', label: 'Hero CTA Button Text', placeholder: 'Shop Now' },
            { key: 'about_text', label: 'About / Brand Story Text', placeholder: 'Lin°e was built for...' },
            { key: 'newsletter_headline', label: 'Newsletter Headline', placeholder: 'BE FIRST. ALWAYS.' },
            { key: 'newsletter_subheadline', label: 'Newsletter Subheadline', placeholder: 'New drops, styling edits...' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">{label}</label>
              <input value={form[key] || ''} onChange={(e) => set(key, e.target.value)} className="input-box" placeholder={placeholder} />
            </div>
          ))}
        </div>
      )}

      {/* Site Images */}
      {activeTab === 'images' && (
        <div className="admin-card space-y-6">
          <h2 className="font-display text-2xl border-b border-line-border pb-3">SITE IMAGES</h2>
          <p className="font-sans text-xs text-line-gray">Upload images to replace placeholder images across your store.</p>
          <div className="grid grid-cols-2 gap-6">
            {[
              { key: 'hero_bg_image', label: 'Hero Background Image' },
              { key: 'section1_image', label: 'Editorial Section Image 1' },
              { key: 'section2_image', label: 'Editorial Section Image 2' },
              { key: 'editorial_image', label: 'Editorial Center Image' },
              { key: 'look_image', label: '"Shop the Look" Image' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="font-sans text-xs uppercase tracking-widest block mb-2">{label}</label>
                <ImageUploader
                  bucket="site-assets"
                  folder="homepage"
                  currentUrl={form[key]}
                  onUpload={(url) => set(key, url)}
                  label={`Upload ${label}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment */}
      {activeTab === 'payment' && (
        <div className="admin-card space-y-5">
          <h2 className="font-display text-2xl border-b border-line-border pb-3">PAYMENT SETTINGS</h2>
          <div className="bg-yellow-50 border border-yellow-200 p-4 font-sans text-sm text-yellow-800">
            ⚠ Public keys are safe to store here. Never enter secret keys. Secret keys must be set as Edge Function secrets via the OnSpace Cloud dashboard.
          </div>

          <div className="flex items-center gap-3 pb-4 border-b border-line-border">
            <input type="checkbox" checked={form['paystack_enabled'] !== 'false'} onChange={(e) => set('paystack_enabled', e.target.checked ? 'true' : 'false')} id="ps_enabled" />
            <label htmlFor="ps_enabled" className="font-sans text-sm font-medium cursor-pointer">Enable Paystack</label>
          </div>
          <div>
            <label className="font-sans text-xs uppercase tracking-widest block mb-2">Paystack Public Key</label>
            <input value={form['paystack_public_key'] || ''} onChange={(e) => set('paystack_public_key', e.target.value)} className="input-box font-mono text-xs" placeholder="pk_live_..." />
          </div>

          <div className="flex items-center gap-3 pb-4 border-b border-line-border pt-4">
            <input type="checkbox" checked={form['flutterwave_enabled'] !== 'false'} onChange={(e) => set('flutterwave_enabled', e.target.checked ? 'true' : 'false')} id="fw_enabled" />
            <label htmlFor="fw_enabled" className="font-sans text-sm font-medium cursor-pointer">Enable Flutterwave</label>
          </div>
          <div>
            <label className="font-sans text-xs uppercase tracking-widest block mb-2">Flutterwave Public Key</label>
            <input value={form['flutterwave_public_key'] || ''} onChange={(e) => set('flutterwave_public_key', e.target.value)} className="input-box font-mono text-xs" placeholder="FLWPUBK_TEST-..." />
          </div>
        </div>
      )}

      {/* CJ Dropshipping */}
      {activeTab === 'cj' && (
        <div className="admin-card space-y-5">
          <h2 className="font-display text-2xl border-b border-line-border pb-3">CJ DROPSHIPPING</h2>
          <div className="bg-blue-50 border border-blue-200 p-4 font-sans text-sm text-blue-800">
            Your CJ API credentials are used server-side only in the Edge Function. The access token entered here is stored in site settings and read by the cj-fulfillment edge function.
          </div>
          <div>
            <label className="font-sans text-xs uppercase tracking-widest block mb-2">CJ API Email</label>
            <input value={form['cj_api_key'] || ''} onChange={(e) => set('cj_api_key', e.target.value)} className="input-box" placeholder="your@email.com" />
          </div>
          <div>
            <label className="font-sans text-xs uppercase tracking-widest block mb-2">CJ Access Token</label>
            <input value={form['cj_access_token'] || ''} onChange={(e) => set('cj_access_token', e.target.value)} className="input-box font-mono text-xs" placeholder="CJ access token from your developer dashboard" />
          </div>
          <div className="bg-line-light p-4 font-sans text-xs text-line-gray">
            <p className="font-semibold mb-1">To get your CJ Access Token:</p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>Log in to CJ Dropshipping → Developer Center</li>
              <li>Create or copy your Access Token</li>
              <li>Paste it above and save</li>
            </ol>
          </div>
        </div>
      )}

      {/* Social Links */}
      {activeTab === 'social' && (
        <div className="admin-card space-y-5">
          <h2 className="font-display text-2xl border-b border-line-border pb-3">SOCIAL LINKS</h2>
          <p className="font-sans text-xs text-line-gray">Add your social media links. They will appear in the footer and TikTok sections automatically.</p>
          {[
            { key: 'tiktok_url', label: 'TikTok URL', placeholder: 'https://tiktok.com/@yourhandle' },
            { key: 'instagram_url', label: 'Instagram URL', placeholder: 'https://instagram.com/yourbrand' },
            { key: 'pinterest_url', label: 'Pinterest URL', placeholder: 'https://pinterest.com/yourbrand' },
            { key: 'twitter_url', label: 'Twitter/X URL', placeholder: 'https://x.com/yourbrand' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="font-sans text-xs uppercase tracking-widest block mb-2">{label}</label>
              <input value={form[key] || ''} onChange={(e) => set(key, e.target.value)} className="input-box" placeholder={placeholder} />
            </div>
          ))}
        </div>
      )}

      {/* Email */}
      {activeTab === 'email' && (
        <div className="admin-card space-y-5">
          <h2 className="font-display text-2xl border-b border-line-border pb-3">EMAIL SETTINGS</h2>
          <div className="bg-blue-50 border border-blue-200 p-4 font-sans text-sm text-blue-800">
            Email notifications are sent via the send-email Edge Function. Add your Resend API key as a secret named <code className="font-mono bg-blue-100 px-1">RESEND_API_KEY</code> in the OnSpace Cloud Secrets panel.
          </div>
          <div>
            <label className="font-sans text-xs uppercase tracking-widest block mb-2">From Email Address</label>
            <input value={form['email_from'] || ''} onChange={(e) => set('email_from', e.target.value)} className="input-box" placeholder="orders@yourdomain.com" />
          </div>
          <div>
            <label className="font-sans text-xs uppercase tracking-widest block mb-2">Email Provider</label>
            <select value={form['email_provider'] || 'resend'} onChange={(e) => set('email_provider', e.target.value)} className="select-line w-full max-w-xs">
              <option value="resend">Resend</option>
              <option value="sendgrid">SendGrid</option>
            </select>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button onClick={handleSave} disabled={updateSettings.isPending} className="btn-primary flex items-center gap-2 disabled:opacity-50">
          <Save size={16} /> {updateSettings.isPending ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
