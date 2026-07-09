const SUPABASE_URL = 'https://sccmgpssfwhgxefbdwbc.supabase.co';
const SUPABASE_KEY = 'sb_publishable' + '_jLo4bXprbOdVGLsW9Z2QEQ_MNhzC2jW';
const SUPABASE_SCHEMA = 'one11atl';

const statusClass = (el, type, message) => {
  if (!el) return;
  el.classList.remove('ok', 'error');
  if (type) el.classList.add(type);
  el.textContent = message;
};

const serializeForm = (form) => {
  const data = Object.fromEntries(new FormData(form).entries());
  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'string') data[key] = data[key].trim();
    if (data[key] === '') delete data[key];
  });

  return {
    ...data,
    form_type: form.dataset.formType || 'general',
    booking_type: data.booking_type || form.dataset.bookingType || data.lead_type || 'general',
    source: '111atl.com',
    page: window.location.pathname + window.location.hash,
    user_agent: navigator.userAgent,
    submitted_at: new Date().toISOString()
  };
};

const asBoolean = (value) => value === true || value === 'true' || value === 'on' || value === 'yes';

function tableForPayload(payload) {
  if (payload.form_type === 'nda') return 'ndas';
  if (payload.form_type === 'host') return 'host_applications';
  if (payload.form_type === 'booking' || payload.lead_type === 'vip' || payload.booking_type) return 'bookings';
  return 'leads';
}

function normalizeForTable(table, payload) {
  const metadata = {
    page: payload.page,
    submitted_at: payload.submitted_at,
    user_agent: payload.user_agent || null
  };

  if (table === 'ndas') {
    return {
      agreement_title: 'Non-Disclosure and Non-Compete Agreement',
      agreement_version: 'uploaded_nda_non_compete_pdf_2026_07_09',
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
      source: '111atl.com',
      user_agent: payload.user_agent || null,
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
      source: '111atl.com',
      metadata
    };
  }

  if (table === 'bookings') {
    return {
      booking_type: payload.booking_type || payload.lead_type || 'vip_table',
      full_name: payload.full_name,
      phone: payload.phone || null,
      email: payload.email || null,
      instagram: payload.instagram || null,
      preferred_date: payload.preferred_date || null,
      party_size: payload.party_size ? Number(payload.party_size) : null,
      budget: payload.budget || null,
      notes: payload.notes || payload.message || null,
      source: '111atl.com',
      metadata
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
    source: '111atl.com',
    metadata
  };
}

async function submitDirectToSupabase(payload) {
  const table = tableForPayload(payload);
  const record = normalizeForTable(table, payload);

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      'Content-Profile': SUPABASE_SCHEMA,
      'Accept-Profile': SUPABASE_SCHEMA
    },
    body: JSON.stringify(record)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Supabase rejected ${table} submission`);
  }

  return { ok: true, table };
}

async function submitViaApi(payload) {
  const response = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'API request failed');
  return result;
}

async function submitLead(form) {
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.form-status');
  const original = button ? button.textContent : '';
  const payload = serializeForm(form);

  statusClass(status, null, 'Sending...');
  if (button) {
    button.disabled = true;
    button.textContent = 'Sending...';
  }

  try {
    try {
      await submitViaApi(payload);
    } catch (apiError) {
      await submitDirectToSupabase(payload);
    }
    const successMessage = payload.form_type === 'nda'
      ? 'NDA signed and recorded. The 111ATL team has it.'
      : 'Request received. The 111ATL team has it.';
    statusClass(status, 'ok', successMessage);
    form.reset();
  } catch (error) {
    statusClass(status, 'error', 'Something blocked the request. Try again or contact the team directly.');
    console.error('111ATL form error:', error);
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = original;
    }
  }
}

async function loadEvents() {
  const grid = document.getElementById('eventGrid');
  if (!grid) return;

  try {
    const endpoint = `${SUPABASE_URL}/rest/v1/events?status=eq.published&select=id,event_date,title,subtitle,venue,address,start_time,end_time,flyer_url,ticket_url,rsvp_url,sort_order&order=event_date.asc&order=sort_order.asc`;
    const response = await fetch(endpoint, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Accept-Profile': SUPABASE_SCHEMA
      }
    });
    if (!response.ok) return;
    const events = await response.json();
    if (!Array.isArray(events) || events.length === 0) return;

    grid.innerHTML = events.map((event) => {
      const date = event.event_date ? new Date(event.event_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Upcoming';
      const cta = event.ticket_url || event.rsvp_url || '#vip';
      return `
        <article class="event-card">
          <p class="event-date">${escapeHtml(date)}</p>
          <h3>${escapeHtml(event.title || '111ATL Event')}</h3>
          <p>${escapeHtml(event.subtitle || event.venue || 'VIP, guest list, and booking requests available.')}</p>
          <a href="${escapeAttr(cta)}">${event.ticket_url ? 'Tickets' : 'Request access'}</a>
        </article>`;
    }).join('');
  } catch (error) {
    console.warn('111ATL event feed unavailable:', error);
  }
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[char]));
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#096;');
}

document.querySelectorAll('.lead-form').forEach((form) => {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitLead(form);
  });
});

loadEvents();
