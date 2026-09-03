import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LN-${ts}-${rand}`;
}

export function generateReference(): string {
  return `LINE_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getStatusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    paid: 'badge-paid',
    pending: 'badge-pending',
    failed: 'badge-failed',
    shipped: 'badge-shipped',
    delivered: 'badge-delivered',
    draft: 'badge-draft',
    active: 'badge-active',
    paused: 'badge-paused',
    refunded: 'badge-refunded',
    testing: 'badge-pending',
    winner: 'badge-paid',
    discontinued: 'badge-draft',
    awaiting_fulfillment: 'badge-pending',
    sent_to_cj: 'badge-shipped',
    cj_processing: 'badge-pending',
    in_transit: 'badge-shipped',
    fulfillment_error: 'badge-failed',
    cancelled: 'badge-draft',
  };
  return map[status] || 'badge-draft';
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
