import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { eventSlug, ticketTypeId, firstName, lastName, email, phone, birthday, city, instagram, quantity = 1, marketingConsent = false, source = '111atl', ambassadorCode } = req.body || {};
    if (!eventSlug || !ticketTypeId || !firstName || !lastName || !email) return res.status(400).json({ error: 'Missing required fields' });
    const { data: event, error: eventError } = await supabase.from('ka_events').select('*').eq('slug', eventSlug).eq('status', 'published').single();
    if (eventError || !event) return res.status(404).json({ error: 'Event unavailable' });

    let query = supabase.from('ka_ticket_types').select('*').eq('event_id', event.id).eq('active', true);
    if (ticketTypeId === 'complimentary') query = query.ilike('name', 'Complimentary%');
    else if (ticketTypeId === 'priority') query = query.ilike('name', 'Priority%');
    else query = query.eq('id', ticketTypeId);
    const { data: ticket, error: ticketError } = await query.limit(1).single();
    if (ticketError || !ticket) return res.status(404).json({ error: 'Access option unavailable' });
    const qty = Math.max(1, Math.min(Number(quantity) || 1, ticket.per_order_limit || 10));

    const { data: guest, error: guestError } = await supabase.from('ka_guests').upsert({ email: String(email).toLowerCase().trim(), phone, first_name: firstName, last_name: lastName, birthday: birthday || null, city, instagram, marketing_consent: Boolean(marketingConsent), updated_at: new Date().toISOString() }, { onConflict: 'email' }).select().single();
    if (guestError) throw guestError;
    const total = ticket.price_cents * qty;
    const { data: order, error: orderError } = await supabase.from('ka_orders').insert({ event_id: event.id, guest_id: guest.id, ticket_type_id: ticket.id, quantity: qty, amount_cents: total, payment_status: total === 0 ? 'free' : 'pending', source, ambassador_code: ambassadorCode || null }).select('id,access_code').single();
    if (orderError) throw orderError;
    if (total === 0) return res.status(200).json({ ok: true, free: true, orderId: order.id, accessCode: order.access_code, redirect: `/success.html?order=${order.id}&code=${order.access_code}` });

    const base = process.env.PUBLIC_SITE_URL || 'https://111atl.com';
    const session = await stripe.checkout.sessions.create({ mode: 'payment', customer_email: guest.email, line_items: [{ quantity: qty, price_data: { currency: ticket.currency || 'usd', unit_amount: ticket.price_cents, product_data: { name: `${event.name} — ${ticket.name}`, description: ticket.description || undefined } } }], success_url: `${base}/success.html?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${base}/event.html?event=${encodeURIComponent(event.slug)}&cancelled=1`, metadata: { order_id: order.id, access_code: order.access_code, event_id: event.id, guest_id: guest.id } });
    await supabase.from('ka_orders').update({ stripe_checkout_session_id: session.id }).eq('id', order.id);
    return res.status(200).json({ ok: true, checkoutUrl: session.url });
  } catch (error) { console.error(error); return res.status(500).json({ error: 'We could not complete access registration.' }); }
}
