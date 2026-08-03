import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { eventSlug, ticketTypeId, firstName, lastName, email, phone, birthday, city, instagram, quantity = 1, marketingConsent = false, source = '111atl', ambassadorCode, requestKey } = req.body || {};
    if (!eventSlug || !ticketTypeId || !firstName || !lastName || !email || !requestKey) return res.status(400).json({ error: 'Missing required fields' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email)) || String(firstName).trim().length < 2 || String(lastName).trim().length < 2) return res.status(400).json({ error: 'Enter valid guest details' });
    if (ticketTypeId === 'priority' && (process.env.STRIPE_PAYMENT_ENABLED !== 'true' || !process.env.STRIPE_SECRET_KEY)) return res.status(503).json({ error: 'Paid priority access is temporarily unavailable.' });
    const { data: event, error: eventError } = await supabase.from('ka_events').select('*').eq('slug', eventSlug).eq('status', 'published').single();
    if (eventError || !event) return res.status(404).json({ error: 'Event unavailable' });

    let query = supabase.from('ka_ticket_types').select('*').eq('event_id', event.id).eq('active', true);
    if (ticketTypeId === 'complimentary') query = query.ilike('name', 'Complimentary%');
    else if (ticketTypeId === 'priority') query = query.ilike('name', 'Priority%');
    else query = query.eq('id', ticketTypeId);
    const { data: ticket, error: ticketError } = await query.limit(1).single();
    if (ticketError || !ticket) return res.status(404).json({ error: 'Access option unavailable' });
    const qty = Math.max(1, Math.min(Number(quantity) || 1, ticket.per_order_limit || 10));

    const { data: order, error: orderError } = await supabase.rpc('ka_create_access_order', { p_event_slug: eventSlug, p_ticket_type_id: ticketTypeId, p_first_name: String(firstName).trim(), p_last_name: String(lastName).trim(), p_email: String(email).trim(), p_phone: phone || null, p_birthday: birthday || null, p_city: city || null, p_instagram: instagram || null, p_quantity: qty, p_marketing_consent: Boolean(marketingConsent), p_source: source, p_ambassador_code: ambassadorCode || null, p_request_key: requestKey });
    if (orderError) throw orderError;
    const total = Number(order.amount_cents || 0);
    if (total === 0) return res.status(200).json({ ok: true, free: true, orderId: order.id, accessCode: order.access_code, redirect: `/success.html?order=${order.id}&code=${order.access_code}` });

    const base = process.env.PUBLIC_SITE_URL || 'https://111atl.com';
    const session = await stripe.checkout.sessions.create({ mode: 'payment', customer_email: String(email).toLowerCase().trim(), line_items: [{ quantity: qty, price_data: { currency: ticket.currency || 'usd', unit_amount: ticket.price_cents, product_data: { name: `${event.name} — ${ticket.name}`, description: ticket.description || undefined } } }], success_url: `${base}/success.html?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${base}/event.html?event=${encodeURIComponent(event.slug)}&cancelled=1`, metadata: { order_id: order.id, access_code: order.access_code, event_id: event.id, guest_id: order.guest_id } });
    await supabase.from('ka_orders').update({ stripe_checkout_session_id: session.id }).eq('id', order.id);
    return res.status(200).json({ ok: true, checkoutUrl: session.url });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'We could not complete access registration.' }); }
}
