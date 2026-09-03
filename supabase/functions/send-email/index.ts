import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const TEMPLATES: Record<string, { subject: string; html: (order: Record<string, unknown>) => string }> = {
  order_received: {
    subject: 'Your Lin°e order is confirmed',
    html: (o) => `<h1>Order Confirmed</h1><p>Hi ${o.first_name},</p><p>Your order <strong>${o.order_number}</strong> has been received and is being processed.</p><p>Total: $${o.total}</p><p>Track your order: <a href="https://yourstore.com/track/${o.order_number}">Click here</a></p>`,
  },
  payment_confirmed: {
    subject: 'Payment confirmed — Lin°e',
    html: (o) => `<h1>Payment Confirmed</h1><p>Hi ${o.first_name},</p><p>Your payment for order <strong>${o.order_number}</strong> has been confirmed. We're preparing your items.</p>`,
  },
  order_shipped: {
    subject: 'Your order is on its way! — Lin°e',
    html: (o) => `<h1>Your Order is Shipped!</h1><p>Hi ${o.first_name},</p><p>Order <strong>${o.order_number}</strong> has shipped.</p>${o.tracking_number ? `<p>Tracking: <a href="${o.tracking_url}">${o.tracking_number}</a></p>` : ''}`,
  },
  refund_issued: {
    subject: 'Refund processed — Lin°e',
    html: (o) => `<h1>Refund Processed</h1><p>Hi ${o.first_name},</p><p>A refund for order <strong>${o.order_number}</strong> has been processed and should appear in 5–10 business days.</p>`,
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!resendKey) return new Response(JSON.stringify({ error: 'Email not configured' }), { status: 400, headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { orderId, type } = await req.json();
  if (!orderId || !type) return new Response(JSON.stringify({ error: 'orderId and type required' }), { status: 400, headers: corsHeaders });

  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (!order) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: corsHeaders });

  const { data: settings } = await supabase.from('site_settings').select('key, value').eq('key', 'email_from').single();
  const fromEmail = settings?.value || 'orders@linefashion.com';

  const template = TEMPLATES[type];
  if (!template) return new Response(JSON.stringify({ error: 'Unknown email type' }), { status: 400, headers: corsHeaders });

  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: `Lin°e <${fromEmail}>`,
      to: [order.email],
      subject: template.subject,
      html: template.html(order),
    }),
  });

  const emailData = await emailRes.json();

  await supabase.from('email_logs').insert({
    order_id: orderId,
    type,
    recipient: order.email,
    subject: template.subject,
    status: emailRes.ok ? 'sent' : 'failed',
    provider_id: emailData.id,
    error_message: emailRes.ok ? null : JSON.stringify(emailData),
  });

  return new Response(JSON.stringify({ success: emailRes.ok, id: emailData.id }), { headers: corsHeaders });
});
