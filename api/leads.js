const FALLBACK_SUPABASE_URL = 'https://sccmgpssfwhgxefbdwbc.supabase.co';
const FALLBACK_SUPABASE_KEY = 'sb_publishable_jLo4bXprbOdVGLsW9Z2QEQ_MNhzC2jW';

const VIEW_MAP = {
  leads: 'one11atl_leads',
  bookings: 'one11atl_bookings',
  host_applications: 'one11atl_host_applications',
  ndas: 'one11atl_ndas'
};

const BOOKING_TYPES = new Set([
  'vip',
  'vip_table',
  'birthday',
  'guest_list',
  'private_room',
  'private_event',
  'section',
  'event_rsvp'
]);

const REQUIRED_FIELDS = {
  leads: ['full_name'],
  bookings: ['full_name', 'phone'],
  host_applications: ['full_name', 'phone'],
  ndas: ['full_name', 'email', 'phone', 'signature_name']
};

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
  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
    Prefer: 'return=representation'
  };

  if (!key.startsWith('sb_publishable_')) {
    headers.Authorization = `Bearer ${key}`;
  }

  return headers;
}

function cleanString(value, maxLength = 2000) {
  if (typeof value !== 'string') return value;
  return value.trim().slice(0, maxLength);
}

function sanitizePayload(body = {}) {
  const cleaned = {};
  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) {
      cleaned[key] = value.map((item) => cleanString(item, 500)).filter(Boolean);
      continue;
    }

    const clean = cleanString(value);
    if (clean !== undefined && clean !== null && clean !== '') cleaned[key] = clean;
  }
  return cleaned;
}

function asBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === 'yes';
}

function resolveTable(payload) {
  if (payload.form_type === 'nda') return 'ndas';
  if (payload.form_type === 'host') return 'host_applications';
  if (payload.form_type === 'booking') return 'bookings';
  if (BOOKING_TYPES.has(payload.booking_type) || BOOKING_TYPES.has(payload.lead_type)) return 'bookings';
  return 'leads';
}

function baseMetadata(payload, req) {
  return {
    page: payload.page || null,
    submitted_at: payload.submitted_at || new Date().toISOString(),
    user_agent: req.headers['user-agent'] || null,
    event_id: payload.event_id || null,
    event_title: payload.event_title || payload.event_interest || null,
    utm_source: payload.utm_source || null,
    utm_medium: payload.utm_medium || null,
    utm_campaign: payload.utm_campaign || null,
    referrer: payload.referrer || null,
    sms_consent: asBoolean(payload.sms_consent),
    email_consent: asBoolean(payload.email_consent)
  };
}

function normalizeForTable(table, payload, req) {
  const metadata = baseMetadata(payload, req);
  const source = '111atl.com';

  if (table === 'ndas') {
    return {
      agreement_title: 'Non-Disclosure and Non-Compete Agreement',
      agreement_version: '111atl_nda_non_compete_2026_07',
      disclosing_party: 'Dr. Dolo Dorsey / The Kollective Hospitality Group',
      full_name: payload.full_name,
      title_entity: payload.title_entity || null,
      email: payload.email || null,
      phone: payload.phone || null,
      instagram: payload.instagram || null,
      role_interest: payload.role_interest || null,
      signature_name: payload.signature_name,
      accepted_confidentiality: asBoolean(payload.accepted_confidentiality),
      accepted_non_compete_non_circumvention: asBoolean(payload.accepted_non_compete_non_circumvention),
      accepted_ip_terms: asBoolean(payload.accepted_ip_terms),
      accepted_full_agreement: asBoolean(payload.accepted_full_agreement),
      source,
      ip_address: String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '')
        .split(',')[0]
        .trim()
        .slice(0, 100) || null,
      user_agent: req.headers['user-agent'] || null,
      metadata
    };
  }

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
      source,
      metadata
    };
  }

  if (table === 'bookings') {
    return {
      booking_type: payload.booking_type || payload.lead_type || 'event_rsvp',
      full_name: payload.full_name,
      phone: payload.phone || null,
      email: payload.email || null,
      instagram: payload.instagram || null,
      preferred_date: payload.preferred_date || null,
      party_size: payload.party_size ? Number(payload.party_size) : null,
      budget: payload.budget || null,
      notes: payload.notes || payload.message || payload.event_title || null,
      source,
      metadata
    };
  }

  return {
    full_name: payload.full_name,
    phone: payload.phone || null,
    email: payload.email || null,
    instagram: payload.instagram || null,
    lead_type: payload.lead_type || payload.form_type || 'general',
    event_interest: payload.event_interest || payload.event_title || null,
    party_size: payload.party_size ? Number(payload.party_size) : null,
    preferred_date: payload.preferred_date || null,
    message: payload.message || payload.notes || null,
    source,
    metadata
  };
}

function validate(table, payload) {
  const missing = (REQUIRED_FIELDS[table] || []).filter((field) => !payload[field]);
  if (missing.length) return `Missing required field: ${missing.join(', ')}`;

  if (payload.email && !/^\S+@\S+\.\S+$/.test(payload.email)) return 'Enter a valid email address.';
  if (payload.party_size && (!Number.isFinite(Number(payload.party_size)) || Number(payload.party_size) < 1)) {
    return 'Party size must be at least 1.';
  }

  if (table === 'ndas') {
    const accepted = [
      payload.accepted_confidentiality,
      payload.accepted_non_compete_non_circumvention,
      payload.accepted_ip_terms,
      payload.accepted_full_agreement
    ].every(asBoolean);
    if (!accepted) return 'All agreement acknowledgements are required.';
  }

  return null;
}

async function supabaseInsert(table, record) {
  const { url, key } = getSupabaseConfig();
  const view = VIEW_MAP[table];
  const response = await fetch(`${url}/rest/v1/${view}`, {
    method: 'POST',
    headers: authHeaders(key),
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

    if (payload.company_website) {
      return res.status(200).json({ ok: true });
    }

    const table = resolveTable(payload);
    const validationError = validate(table, payload);
    if (validationError) return res.status(400).json({ error: validationError });

    const record = normalizeForTable(table, payload, req);
    const inserted = await supabaseInsert(table, record);

    return res.status(200).json({
      ok: true,
      table,
      record: inserted?.[0] || null
    });
  } catch (error) {
    console.error('111ATL lead submission error:', error);
    return res.status(error.statusCode || 500).json({
      error: error.message || 'Lead submission failed'
    });
  }
}
