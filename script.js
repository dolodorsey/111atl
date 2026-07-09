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
    page: window.location.pathname,
    submitted_at: new Date().toISOString()
  };
};

async function submitLead(form) {
  const button = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.form-status');
  const original = button ? button.textContent : '';

  statusClass(status, null, 'Sending...');
  if (button) {
    button.disabled = true;
    button.textContent = 'Sending...';
  }

  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serializeForm(form))
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Request failed');

    statusClass(status, 'ok', 'Request received. The 111ATL team has it.');
    form.reset();
  } catch (error) {
    const fallback = 'Request saved on page, but backend needs final Vercel env setup. Text/call the team if urgent.';
    statusClass(status, 'error', error.message.includes('configured') ? fallback : 'Something blocked the request. Try again or contact the team directly.');
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
    const response = await fetch('/api/events');
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
