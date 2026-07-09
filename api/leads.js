const TABLE_MAP = {
  host: 'host_applications',
  booking: 'bookings',
  vip: 'bookings',
  birthday: 'bookings',
  general: 'leads'
};

const required = {
  leads: ['full_name'],
  bookings: ['full_name'],
  host_applications: ['full_name']
};

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

function sanitizePayload(body = {}) {
  const cleaned = {};
  for (const [key, value] of Object.entries(body)) {
    const clean = cleanString(value);
    if (clean !== undefined && clean !== null && clean !== '') cleaned[key] = clean;
  }
  return cleaned;
}

function normalizeForTable(table, payload) {
  const baseMeta = {
    page: payload.page,
    submitted_at: payload.submitted_at,
    user_agent: payload.user_agent || null
  };

  if (table === 'host_applications') {
    return {
      full_name: payload.full_name,
      phone: payload.phone || null,
      email: payload.email || null,
      instagram: payload.instagram || null,
      city: payload.city || 'Atlanta',
      audience_size: payload.audience_size || null,
      role_interest: payload.role_interest || null,
      experience: payload.experience || null,
      source: payload.source || '111atl.com',
      metadata: baseMeta
    };
  }

  if (table === 'bookings') {
    return {
      booking_type: payload.booking_type || payload.lead_type || payload.form_type || 'general_booking',
      full_name: payload.full_name,
      phone: payload.phone || null,
      email: payload.email || null,
      instagram: payload.instagram || null,
      preferred_date: payload.preferred_date || null,
      party_size: payload.party_size ? Number(payload.party_size) : null,
      budget: payload.budget || null,
      notes: payload.notes || payload.message || null,
      source: payload.source || '111atl.com',
      metadata: baseMeta
    };
  }

  return {
    full_name: payload.full_name,
    phone: payload.phone || null,
    email: payload.email || null,
    instagram: payload.instagram || null,
    lead_type: payload.lead_type || payload.form_type || 'general',
    event_interest: payload.event_interest || null,
    party_size: payload.party_size ? Number(payload.party_size) : null,
    preferred_date: payload.preferred_date || null,
    message: payload.message || payload.notes || null,
    source: payload.source || '111atl.com',
    metadata: baseMeta
  };
}

async function supabaseInsert(table, record) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  const schema = process.env.SUPABASE_SCHEMA || 'one11atl';

  if (!supabaseUrl || !serviceKey) {
    const error = new Error('Supabase environment variables are not configured on Vercel.');
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      'Content-Profile': schema,
      'Accept-Profile': schema
    },
    body: JSON.stringify(record)
  });

  const text = await response.text();
  if (!response.ok) {
    const error = new Error(text || `Supabase insert failed with ${response.status}`);
    error.statusCode = response.status;
    throw error;
  }

  return text ? JSON.parse(text) : [];
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = sanitizePayload(req.body || {});
    const formType = payload.form_type || payload.lead_type || 'general';
    const table = TABLE_MAP[formType] || TABLE_MAP[payload.booking_type] || 'leads';

    const missing = (required[table] || []).filter((field) => !payload[field]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing required field: ${missing.join(', ')}` });
    }

    payload.user_agent = req.headers['user-agent'] || null;
    const record = normalizeForTable(table, payload);
    const inserted = await supabaseInsert(table, record);

    return res.status(200).json({ ok: true, table, record: inserted?.[0] || null });
  } catch (error) {
    console.error('111ATL lead submission error:', error);
    return res.status(error.statusCode || 500).json({ error: error.message || 'Lead submission failed' });
  }
}
