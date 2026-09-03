import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { ProductImage } from '@/types';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const minSwipeDistance = 50;

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) >= minSwipeDistance) {
      distance > 0 ? next() : prev();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const toggleZoom = () => setZoomed(!zoomed);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setZoomed(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  if (!images.length) {
    return (
      <div className="aspect-[3/4] bg-line-light flex items-center justify-center">
        <span className="font-display text-6xl text-line-border">LIN°E</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Thumbnails (desktop, left side) */}
      <div className="hidden md:flex flex-col gap-2 w-20 flex-shrink-0">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setCurrent(i)}
            className={cn(
              'w-20 h-24 overflow-hidden border-2 transition-all',
              current === i ? 'border-line-black' : 'border-transparent opacity-60 hover:opacity-100'
            )}
          >
            <img src={img.url} alt={img.alt || productName} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="flex-1 relative">
        <div
          className={cn('relative overflow-hidden bg-line-light', zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in')}
          style={{ aspectRatio: '3/4' }}
          onClick={toggleZoom}
          onMouseMove={handleMouseMove}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img
            ref={imgRef}
            src={images[current]?.url}
            alt={images[current]?.alt || productName}
            className="w-full h-full object-cover gallery-image"
            style={
              zoomed
                ? {
                    transform: 'scale(2.5)',
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transition: 'none',
                  }
                : { transform: 'scale(1)', transition: 'transform 0.3s ease' }
            }
          />

          {/* Nav arrows */}
          {images.length > 1 && !zoomed && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 hover:bg-white transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 p-2 hover:bg-white transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* Zoom hint */}
          {!zoomed && (
            <div className="absolute bottom-3 right-3 bg-white/80 p-1.5">
              <ZoomIn size={16} className="text-line-black" />
            </div>
          )}
        </div>

        {/* Mobile dots */}
        {images.length > 1 && (
          <div className="flex justify-center gap-1.5 mt-3 md:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  current === i ? 'bg-line-black w-4' : 'bg-line-border'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
