import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!process.env.CHECKIN_STAFF_TOKEN || token !== process.env.CHECKIN_STAFF_TOKEN) return res.status(401).json({ error: 'Staff access required' });
  try {
    const { accessCode, staffName = 'Door Team' } = req.body || {};
    if (!accessCode) return res.status(400).json({ error: 'Access code required' });
    const { data: checked, error: checkError } = await supabase.rpc('ka_check_in_access', { p_access_code: accessCode, p_staff_name: staffName });
    if (checkError) return res.status(409).json({ error: checkError.message });
    const { data: order, error } = await supabase.from('ka_orders').select('*,ka_guests(first_name,last_name,email,phone),ka_events(name,venue,starts_at),ka_ticket_types(name)').eq('id', checked.id).single();
    if (error || !order) return res.status(500).json({ error: 'Check-in completed but confirmation could not be loaded' });
    return res.status(200).json({ ok: true, order });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to complete check-in' });
  }
}
