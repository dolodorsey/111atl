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
    select: 'brand_key,brand_label,category,description,logo_url,site_url,form_key,sort_order,metadata',
    order: 'sort_order.asc,brand_label.asc'
  });

  try {
    const response = await fetch(`${url}/rest/v1/one11atl_entity_links?${params.toString()}`, {
      headers: { apikey: key }
    });
    const text = await response.text();
    if (!response.ok) throw new Error(text || 'Entity directory unavailable');
    const entities = JSON.parse(text || '[]');
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ entities });
  } catch (error) {
    return res.status(500).json({ entities: [], error: error.message || 'Entity directory unavailable' });
  }
}
