const FALLBACK_SUPABASE_URL = 'https://sccmgpssfwhgxefbdwbc.supabase.co';
const FALLBACK_SUPABASE_KEY = 'sb_publishable_jLo4bXprbOdVGLsW9Z2QEQ_MNhzC2jW';

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL
    || FALLBACK_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_PUBLISHABLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || FALLBACK_SUPABASE_KEY;

  return { url: url.replace(/\/$/, ''), key };
}

function authHeaders(key) {
  const headers = { apikey: key };
  if (!key.startsWith('sb_publishable_')) {
    headers.Authorization = `Bearer ${key}`;
  }
  return headers;
}

async function supabaseSelectEvents() {
  const { url, key } = getSupabaseConfig();
  const today = new Date().toISOString().slice(0, 10);
  const fields = [
    'id',
    'event_date',
    'title',
    'subtitle',
    'venue',
    'address',
    'start_time',
    'end_time',
    'flyer_url',
    'ticket_url',
    'rsvp_url',
    'sort_order',
    'metadata'
  ].join(',');

  const params = new URLSearchParams({
    status: 'eq.published',
    event_date: `gte.${today}`,
    select: fields,
    order: 'event_date.asc,sort_order.asc'
  });

  const response = await fetch(`${url}/rest/v1/one11atl_events?${params.toString()}`, {
    headers: authHeaders(key)
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
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    return res.status(200).json({ events });
  } catch (error) {
    console.warn('111ATL event feed unavailable:', error.message);
    return res.status(error.statusCode || 500).json({
      events: [],
      error: error.message || 'Events unavailable'
    });
  }
}
