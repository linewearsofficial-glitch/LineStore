import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const { orderId } = await req.json();
  if (!orderId) return new Response(JSON.stringify({ error: 'orderId required' }), { status: 400, headers: corsHeaders });

  // Get order
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .single();

  if (orderErr || !order) {
    return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: corsHeaders });
  }

  // Guard: only fulfill paid orders
  if (order.payment_status !== 'paid') {
    return new Response(JSON.stringify({ error: 'Order not paid' }), { status: 400, headers: corsHeaders });
  }

  // Idempotency: already submitted
  if (order.cj_order_id) {
    return new Response(JSON.stringify({ success: true, cj_order_id: order.cj_order_id, skipped: true }), { headers: corsHeaders });
  }

  // Get CJ credentials from site_settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', ['cj_access_token', 'cj_api_key']);

  const settingsMap: Record<string, string> = {};
  (settings || []).forEach((s: { key: string; value: string }) => { settingsMap[s.key] = s.value; });
  const cjToken = settingsMap['cj_access_token'];

  if (!cjToken) {
    await supabase.from('orders').update({ cj_error: 'CJ access token not configured', fulfillment_status: 'fulfillment_error' }).eq('id', orderId);
    return new Response(JSON.stringify({ error: 'CJ not configured' }), { status: 400, headers: corsHeaders });
  }

  // Build CJ order payload
  const products = (order.order_items || []).map((item: Record<string, unknown>) => ({
    vid: item.cj_variant_id || item.cj_product_id,
    quantity: item.quantity,
  })).filter((p: Record<string, unknown>) => p.vid);

  if (products.length === 0) {
    await supabase.from('orders').update({ cj_error: 'No CJ variant IDs configured on products', fulfillment_status: 'fulfillment_error' }).eq('id', orderId);
    return new Response(JSON.stringify({ error: 'No CJ product IDs' }), { status: 400, headers: corsHeaders });
  }

  const cjPayload = {
    orderNameList: [order.order_number],
    products,
    shippingInfo: {
      firstName: order.first_name,
      lastName: order.last_name,
      email: order.email,
      phone: order.phone,
      country: order.country || 'US',
      province: order.state,
      city: order.city,
      address: order.address_line1,
      address2: order.address_line2 || '',
      zip: order.zip,
    },
  };

  try {
    const cjRes = await fetch('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'CJ-Access-Token': cjToken,
      },
      body: JSON.stringify(cjPayload),
    });

    const cjData = await cjRes.json();
    console.log('[cj-fulfillment] CJ response:', JSON.stringify(cjData).substring(0, 500));

    if (cjData.result === true && cjData.data?.orderId) {
      const cjOrderId = cjData.data.orderId;
      await supabase.from('orders').update({
        cj_order_id: cjOrderId,
        cj_submitted_at: new Date().toISOString(),
        fulfillment_status: 'sent_to_cj',
        cj_error: null,
      }).eq('id', orderId);

      await supabase.from('fulfillment_records').insert({
        order_id: orderId,
        cj_order_id: cjOrderId,
        status: 'sent_to_cj',
        raw_response: cjData,
      });

      await supabase.functions.invoke('send-email', { body: { orderId, type: 'order_received' } });

      return new Response(JSON.stringify({ success: true, cj_order_id: cjOrderId }), { headers: corsHeaders });
    } else {
      const errMsg = cjData.message || 'CJ API error';
      await supabase.from('orders').update({ cj_error: errMsg, fulfillment_status: 'fulfillment_error' }).eq('id', orderId);
      await supabase.from('fulfillment_records').insert({ order_id: orderId, status: 'error', error_message: errMsg, raw_response: cjData });
      return new Response(JSON.stringify({ error: errMsg }), { status: 500, headers: corsHeaders });
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : 'Network error';
    await supabase.from('orders').update({ cj_error: errMsg, fulfillment_status: 'fulfillment_error' }).eq('id', orderId);
    return new Response(JSON.stringify({ error: errMsg }), { status: 500, headers: corsHeaders });
  }
});
