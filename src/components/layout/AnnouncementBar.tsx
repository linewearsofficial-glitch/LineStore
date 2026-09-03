import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function AnnouncementBar() {
  const { data: settings } = useSiteSettings();
  const text = settings?.['announcement_bar'] || 'Free Shipping on Orders $75+';
  const items = Array(8).fill(text);

  return (
    <div className="bg-line-black text-white py-2.5 overflow-hidden">
      <div className="marquee-wrapper">
        <div className="marquee-track">
          {items.map((item, i) => (
            <span key={i} className="font-sans text-xs tracking-widest uppercase mx-8">
              {item}
              <span className="mx-8 text-line-nude">✦</span>
            </span>
          ))}
          {items.map((item, i) => (
            <span key={`dup-${i}`} className="font-sans text-xs tracking-widest uppercase mx-8">
              {item}
              <span className="mx-8 text-line-nude">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
