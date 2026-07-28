const FALLBACK_SUPABASE_URL = 'https://sccmgpssfwhgxefbdwbc.supabase.co';
const FALLBACK_SUPABASE_KEY = 'sb_publishable_jLo4bXprbOdVGLsW9Z2QEQ_MNhzC2jW';

function config() {
  return {
    url: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL).replace(/\/$/, ''),
    key: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY
  };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const { url, key } = config();
  const params = new URLSearchParams({
    status: 'eq.active',
    select: 'form_key,form_type,lane,brand_key,brand_label,title,description,public_url,fields,metadata',
    order: 'lane.asc,title.asc'
  });

  try {
    const response = await fetch(`${url}/rest/v1/one11atl_form_definitions?${params.toString()}`, {
      headers: { apikey: key }
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || 'Form directory unavailable');
    const forms = JSON.parse(text || '[]');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ forms });
  } catch (error) {
    return res.status(500).json({ forms: [], error: error.message || 'Form directory unavailable' });
  }
}
