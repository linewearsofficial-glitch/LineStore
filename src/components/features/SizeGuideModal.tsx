import { X } from 'lucide-react';

interface SizeGuideModalProps {
  onClose: () => void;
  sizeChartImage?: string;
  fitPhoto?: string;
}

const measurements = [
  { size: 'XS', bust: '32"', waist: '25"', hips: '35"', length: '22-24"' },
  { size: 'S', bust: '34"', waist: '27"', hips: '37"', length: '22-24"' },
  { size: 'M', bust: '36"', waist: '29"', hips: '39"', length: '22-24"' },
  { size: 'L', bust: '38"', waist: '31"', hips: '41"', length: '22-24"' },
  { size: 'XL', bust: '41"', waist: '34"', hips: '44"', length: '22-24"' },
  { size: 'XXL', bust: '44"', waist: '37"', hips: '47"', length: '22-24"' },
];

export default function SizeGuideModal({ onClose, sizeChartImage, fitPhoto }: SizeGuideModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-line-border sticky top-0 bg-white z-10">
          <h2 className="font-display text-2xl tracking-widest">SIZE GUIDE</h2>
          <button onClick={onClose} className="p-1 hover:opacity-60">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Fit photo + size chart image */}
          {(fitPhoto || sizeChartImage) && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {fitPhoto && (
                <div>
                  <p className="font-sans text-xs uppercase tracking-widest text-line-gray mb-2">How it fits</p>
                  <img src={fitPhoto} alt="Fit reference" className="w-full aspect-[3/4] object-cover" />
                </div>
              )}
              {sizeChartImage && (
                <div>
                  <p className="font-sans text-xs uppercase tracking-widest text-line-gray mb-2">Size chart</p>
                  <img src={sizeChartImage} alt="Size chart" className="w-full aspect-[3/4] object-contain border border-line-border" />
                </div>
              )}
            </div>
          )}

          {/* How to measure */}
          <div className="mb-6">
            <h3 className="font-sans font-semibold text-sm uppercase tracking-widest mb-3">How to Measure</h3>
            <ul className="space-y-2 font-sans text-sm text-line-gray">
              <li><strong className="text-line-black">Bust:</strong> Measure around the fullest part of your chest.</li>
              <li><strong className="text-line-black">Waist:</strong> Measure around your natural waistline.</li>
              <li><strong className="text-line-black">Hips:</strong> Measure around the fullest part of your hips.</li>
            </ul>
          </div>

          {/* Measurement table */}
          <div className="overflow-x-auto">
            <table className="w-full font-sans text-sm border-collapse">
              <thead>
                <tr className="bg-line-black text-white">
                  <th className="px-4 py-3 text-left text-xs tracking-widest uppercase">Size</th>
                  <th className="px-4 py-3 text-left text-xs tracking-widest uppercase">Bust</th>
                  <th className="px-4 py-3 text-left text-xs tracking-widest uppercase">Waist</th>
                  <th className="px-4 py-3 text-left text-xs tracking-widest uppercase">Hips</th>
                  <th className="px-4 py-3 text-left text-xs tracking-widest uppercase">Length</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((row, i) => (
                  <tr key={row.size} className={i % 2 === 0 ? 'bg-white' : 'bg-line-light'}>
                    <td className="px-4 py-3 font-semibold">{row.size}</td>
                    <td className="px-4 py-3">{row.bust}</td>
                    <td className="px-4 py-3">{row.waist}</td>
                    <td className="px-4 py-3">{row.hips}</td>
                    <td className="px-4 py-3">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-sans text-xs text-line-gray mt-4">
            * Measurements are in inches. If you are between sizes, we recommend sizing up.
          </p>
        </div>
      </div>
    </div>
  );
}
