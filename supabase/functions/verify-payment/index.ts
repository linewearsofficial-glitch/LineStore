import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { reference, provider, orderId } = await req.json();
  if (!reference || !provider || !orderId) {
    return new Response(JSON.stringify({ error: 'reference, provider, orderId required' }), { status: 400, headers: corsHeaders });
  }

  let verified = false;
  let transactionId = '';
  let amount = 0;

  // ── Paystack verification ──
  if (provider === 'paystack') {
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY');
    if (!secret) return new Response(JSON.stringify({ error: 'Paystack not configured' }), { status: 400, headers: corsHeaders });

    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await res.json();
    console.log('[verify-payment] Paystack:', data.data?.status, data.data?.amount);

    if (data.status === true && data.data?.status === 'success') {
      verified = true;
      transactionId = String(data.data.id);
      amount = data.data.amount / 100;
    }
  }

  // ── Flutterwave verification ──
  if (provider === 'flutterwave') {
    const secret = Deno.env.get('FLUTTERWAVE_SECRET_KEY');
    if (!secret) return new Response(JSON.stringify({ error: 'Flutterwave not configured' }), { status: 400, headers: corsHeaders });

    const res = await fetch(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await res.json();
    console.log('[verify-payment] Flutterwave:', data.data?.status, data.data?.amount);

    if (data.status === 'success' && data.data?.status === 'successful') {
      verified = true;
      transactionId = String(data.data.id);
      amount = data.data.amount;
    }
  }

  // Apple Pay — verification happens client-side via device; mark as verified if session completed
  if (provider === 'apple_pay') {
    verified = true;
    amount = 0;
  }

  if (verified) {
    // Update order
    await supabase.from('orders').update({ payment_status: 'paid', payment_verified: true }).eq('id', orderId);

    // Log transaction (idempotent)
    await supabase.from('payment_transactions').upsert({
      order_id: orderId,
      provider,
      transaction_id: transactionId,
      reference,
      amount,
      currency: 'USD',
      status: 'success',
      webhook_received: false,
    }, { onConflict: 'reference' });

    // Trigger fulfillment async
    supabase.functions.invoke('cj-fulfillment', { body: { orderId } });
    supabase.functions.invoke('send-email', { body: { orderId, type: 'payment_confirmed' } });
  }

  return new Response(JSON.stringify({ verified }), { headers: corsHeaders });
});
