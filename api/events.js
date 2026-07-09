async function supabaseSelectEvents() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const schema = process.env.SUPABASE_SCHEMA || 'one11atl';

  if (!supabaseUrl || !serviceKey) {
    const error = new Error('Supabase environment variables are not configured on Vercel.');
    error.statusCode = 503;
    throw error;
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/events?status=eq.published&select=id,event_date,title,subtitle,venue,address,start_time,end_time,flyer_url,ticket_url,rsvp_url,sort_order&order=event_date.asc&order=sort_order.asc`;
  const response = await fetch(endpoint, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Accept-Profile': schema
    }
  });

  const text = await response.text();
  if (!response.ok) {
    const error = new Error(text || `Supabase events fetch failed with ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  return text ? JSON.parse(text) : [];
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const events = await supabaseSelectEvents();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(events);
  } catch (error) {
    console.warn('111ATL event feed unavailable:', error.message);
    return res.status(error.statusCode || 500).json({ error: error.message || 'Events unavailable' });
  }
}
