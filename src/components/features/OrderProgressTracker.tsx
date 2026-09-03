import { CheckCircle, Circle, Package, Truck, MapPin, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FulfillmentStatus } from '@/types';

interface Step {
  key: FulfillmentStatus;
  label: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { key: 'awaiting_fulfillment', label: 'Order Confirmed', icon: <CheckCircle size={20} /> },
  { key: 'cj_processing', label: 'Processing', icon: <Package size={20} /> },
  { key: 'shipped', label: 'Shipped', icon: <Truck size={20} /> },
  { key: 'in_transit', label: 'In Transit', icon: <MapPin size={20} /> },
  { key: 'delivered', label: 'Delivered', icon: <Home size={20} /> },
];

const STATUS_INDEX: Record<string, number> = {
  awaiting_fulfillment: 0,
  sent_to_cj: 1,
  cj_processing: 1,
  shipped: 2,
  in_transit: 3,
  delivered: 4,
  fulfillment_error: 1,
  cancelled: -1,
};

interface OrderProgressTrackerProps {
  status: FulfillmentStatus;
}

export default function OrderProgressTracker({ status }: OrderProgressTrackerProps) {
  const currentIndex = STATUS_INDEX[status] ?? 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-line-border z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-line-black z-0 transition-all duration-700"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, i) => {
          const done = i <= currentIndex;
          const active = i === currentIndex;
          return (
            <div key={step.key} className="flex flex-col items-center gap-2 z-10 flex-1">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500',
                  done
                    ? 'bg-line-black text-white border-line-black'
                    : 'bg-white text-line-gray border-line-border'
                )}
              >
                {step.icon}
              </div>
              <span
                className={cn(
                  'font-sans text-[10px] md:text-xs uppercase tracking-wider text-center leading-tight',
                  done ? 'text-line-black font-semibold' : 'text-line-gray'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {status === 'fulfillment_error' && (
        <div className="mt-4 bg-red-50 border border-red-200 p-3 text-center">
          <p className="font-sans text-sm text-red-600">There was an issue processing your order. Our team is on it.</p>
        </div>
      )}
    </div>
  );
}
