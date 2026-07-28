import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!process.env.CHECKIN_STAFF_TOKEN || token !== process.env.CHECKIN_STAFF_TOKEN) return res.status(401).json({ error: 'Staff access required' });
  try {
    const { accessCode, staffName = 'Door Team' } = req.body || {};
    if (!accessCode) return res.status(400).json({ error: 'Access code required' });
    const { data: order, error } = await supabase.from('ka_orders').select('*,ka_guests(first_name,last_name,email,phone),ka_events(name,venue,starts_at),ka_ticket_types(name)').eq('access_code', accessCode).single();
    if (error || !order) return res.status(404).json({ error: 'Access pass not found' });
    if (!['free','paid'].includes(order.payment_status)) return res.status(409).json({ error: 'Payment is not confirmed', order });
    if (order.checked_in_at) return res.status(409).json({ error: 'Already checked in', order });
    const checkedInAt = new Date().toISOString();
    await supabase.from('ka_orders').update({ checked_in_at: checkedInAt, checked_in_by: staffName }).eq('id', order.id);
    await supabase.from('ka_checkin_log').insert({ order_id: order.id, event_id: order.event_id, scanned_by: staffName, result: 'approved' });
    return res.status(200).json({ ok: true, order: { ...order, checked_in_at: checkedInAt, checked_in_by: staffName } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to complete check-in' });
  }
}
