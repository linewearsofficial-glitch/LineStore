import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const url = new URL(req.url);
  const provider = url.searchParams.get('provider') || 'unknown';

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const body = await req.text();
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body);
  } catch {
    return new Response('Invalid JSON', { status: 400, headers: corsHeaders });
  }

  console.log(`[webhook] Provider: ${provider}`, JSON.stringify(payload).substring(0, 200));

  // ── PAYSTACK ──
  if (provider === 'paystack') {
    const paystackSecret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (paystackSecret) {
      const signature = req.headers.get('x-paystack-signature');
      const encoder = new TextEncoder();
      const keyData = encoder.encode(paystackSecret);
      const msgData = encoder.encode(body);
      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign']);
      const sig = await crypto.subtle.sign('HMAC', key, msgData);
      const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
      if (hex !== signature) {
        console.log('[webhook] Paystack signature mismatch');
        return new Response('Invalid signature', { status: 401, headers: corsHeaders });
      }
    }

    const event = payload.event as string;
    if (event === 'charge.success') {
      const data = payload.data as Record<string, unknown>;
      const reference = data.reference as string;
      const amount = (data.amount as number) / 100;
      const transId = data.id as string;

      // Idempotency: check if already processed
      const { data: existing } = await supabase
        .from('payment_transactions')
        .select('id')
        .eq('reference', reference)
        .eq('status', 'success')
        .single();

      if (existing) {
        console.log('[webhook] Duplicate webhook, skipping');
        return new Response('OK', { headers: corsHeaders });
      }

      // Update order
      const { data: order } = await supabase
        .from('orders')
        .update({ payment_status: 'paid', payment_verified: true })
        .eq('payment_reference', reference)
        .select()
        .single();

      // Log transaction
      await supabase.from('payment_transactions').upsert({
        order_id: order?.id,
        provider: 'paystack',
        transaction_id: String(transId),
        reference,
        amount,
        currency: (data.currency as string) || 'USD',
        status: 'success',
        webhook_received: true,
        webhook_data: payload,
      }, { onConflict: 'reference' });

      // Trigger fulfillment
      if (order?.id) {
        supabase.functions.invoke('cj-fulfillment', { body: { orderId: order.id } });
        supabase.functions.invoke('send-email', { body: { orderId: order.id, type: 'payment_confirmed' } });
      }
    }
  }

  // ── FLUTTERWAVE ──
  if (provider === 'flutterwave') {
    const fwSecret = Deno.env.get('FLUTTERWAVE_SECRET_HASH');
    if (fwSecret) {
      const verifyHash = req.headers.get('verif-hash');
      if (verifyHash !== fwSecret) {
        return new Response('Invalid hash', { status: 401, headers: corsHeaders });
      }
    }

    const event = payload.event as string;
    if (event === 'charge.completed') {
      const data = payload.data as Record<string, unknown>;
      const txRef = data.tx_ref as string;
      const status = data.status as string;

      if (status === 'successful') {
        const { data: existing } = await supabase
          .from('payment_transactions')
          .select('id')
          .eq('reference', txRef)
          .eq('status', 'success')
          .single();

        if (!existing) {
          const { data: order } = await supabase
            .from('orders')
            .update({ payment_status: 'paid', payment_verified: true })
            .eq('payment_reference', txRef)
            .select()
            .single();

          await supabase.from('payment_transactions').upsert({
            order_id: order?.id,
            provider: 'flutterwave',
            transaction_id: String(data.id),
            reference: txRef,
            amount: data.amount as number,
            currency: (data.currency as string) || 'USD',
            status: 'success',
            webhook_received: true,
            webhook_data: payload,
          }, { onConflict: 'reference' });

          if (order?.id) {
            supabase.functions.invoke('cj-fulfillment', { body: { orderId: order.id } });
            supabase.functions.invoke('send-email', { body: { orderId: order.id, type: 'payment_confirmed' } });
          }
        }
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
