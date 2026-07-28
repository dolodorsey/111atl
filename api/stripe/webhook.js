import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const config = { api: { bodyParser: false } };
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-12-18.acacia' });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function readRaw(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const body = await readRaw(req);
    const event = stripe.webhooks.constructEvent(body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) await supabase.from('ka_orders').update({ payment_status: 'paid', stripe_payment_intent_id: String(session.payment_intent || '') }).eq('id', orderId);
    }
    if (event.type === 'checkout.session.expired') {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) await supabase.from('ka_orders').update({ payment_status: 'failed' }).eq('id', orderId);
    }
    return res.status(200).json({ received: true });
  } catch (error) {
    console.error(error);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }
}
