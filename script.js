const state = {
  events: [],
  filter: 'all',
  selectedEvent: null
};

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[char]));
}

function safeUrl(value = '') {
  try {
    const url = new URL(value, window.location.origin);
    if (!['http:', 'https:'].includes(url.protocol)) return '';
    return url.href;
  } catch {
    return '';
  }
}

function formatEventDate(dateValue, options = {}) {
  if (!dateValue) return 'Date TBA';
  const date = new Date(`${dateValue}T12:00:00`);
  return date.toLocaleDateString('en-US', {
    weekday: options.short ? 'short' : 'long',
    month: options.short ? 'short' : 'long',
    day: 'numeric'
  });
}

function eventTime(event) {
  if (!event.start_time && !event.end_time) return 'Time TBA';
  return [event.start_time, event.end_time].filter(Boolean).join(' – ');
}

function daysFromToday(dateValue) {
  if (!dateValue) return Number.POSITIVE_INFINITY;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${dateValue}T00:00:00`);
  return Math.round((target - today) / 86400000);
}

function eventMatchesFilter(event, filter) {
  const days = daysFromToday(event.event_date);
  if (filter === 'tonight') return days === 0;
  if (filter === 'week') return days >= 0 && days <= 7;
  if (filter === 'later') return days > 7;
  return true;
}

function eventPoster(event, index, className = '') {
  const flyer = safeUrl(event.flyer_url);
  if (flyer) {
    return `<div class="event-poster ${className}"><img src="${escapeHtml(flyer)}" alt="${escapeHtml(event.title || '111ATL event')} flyer" loading="lazy" /></div>`;
  }

  const tone = (index % 5) + 1;
  return `
    <div class="event-poster poster-placeholder poster-tone-${tone} ${className}">
      <div class="poster-top"><span>111ATL</span><span>${escapeHtml(formatEventDate(event.event_date, { short: true }))}</span></div>
      <div class="poster-center"><small>${escapeHtml(event.venue || 'ATLANTA')}</small><strong>${escapeHtml(event.title || '111ATL EVENT')}</strong></div>
      <div class="poster-bottom">${escapeHtml(event.start_time || 'ATLANTA AFTER DARK')}</div>
    </div>`;
}

function eventCard(event, index) {
  const ticket = safeUrl(event.ticket_url);
  const hasTicket = Boolean(ticket);
  return `
    <article class="event-card" data-event-id="${escapeHtml(event.id || '')}">
      <button class="event-card-open" type="button" data-open-event="${escapeHtml(event.id || '')}" aria-label="View ${escapeHtml(event.title || 'event')} details">
        ${eventPoster(event, index)}
      </button>
      <div class="event-card-body">
        <div class="event-meta"><span>${escapeHtml(formatEventDate(event.event_date, { short: true }))}</span><span>${escapeHtml(event.start_time || 'TBA')}</span></div>
        <h3>${escapeHtml(event.title || '111ATL Event')}</h3>
        <p>${escapeHtml(event.subtitle || event.venue || 'Atlanta nightlife, guest list, and VIP access.')}</p>
        <div class="event-card-footer">
          <button class="event-rsvp-link" type="button" data-rsvp-event="${escapeHtml(event.id || '')}">RSVP Direct</button>
          ${hasTicket ? `<a href="${escapeHtml(ticket)}" target="_blank" rel="noopener">Tickets ↗</a>` : `<button type="button" data-open-event="${escapeHtml(event.id || '')}">Details →</button>`}
        </div>
      </div>
    </article>`;
}

function renderEvents() {
  const grid = qs('#eventGrid');
  const status = qs('#eventsStatus');
  if (!grid) return;

  const filtered = state.events.filter((event) => eventMatchesFilter(event, state.filter));
  if (!filtered.length) {
    grid.innerHTML = `
      <div class="empty-events">
        <span>11:11</span>
        <h3>No events in this view yet.</h3>
        <p>Switch filters or join the weekly signal for the next event drop.</p>
        <a class="button button-outline" href="#rsvp">Join the guest list</a>
      </div>`;
    status.textContent = state.events.length ? 'No events match this filter.' : 'The live event feed is being updated.';
    return;
  }

  grid.innerHTML = filtered.map(eventCard).join('');
  status.textContent = `${filtered.length} upcoming event${filtered.length === 1 ? '' : 's'} loaded.`;
}

function setHeroEvent(event, index = 0) {
  const hero = qs('#heroEvent');
  if (!hero || !event) return;

  hero.innerHTML = `
    ${eventPoster(event, index, 'hero-poster')}
    <div class="hero-event-caption">
      <span class="caption-label">Up next · ${escapeHtml(formatEventDate(event.event_date, { short: true }))}</span>
      <h2>${escapeHtml(event.title || '111ATL Event')}</h2>
      <p>${escapeHtml([event.venue, eventTime(event)].filter(Boolean).join(' · '))}</p>
      <div class="caption-actions">
        <button type="button" data-rsvp-event="${escapeHtml(event.id || '')}">RSVP</button>
        <button type="button" data-open-event="${escapeHtml(event.id || '')}">View details</button>
      </div>
    </div>`;
}

async function loadEvents() {
  const status = qs('#eventsStatus');
  try {
    const response = await fetch('/api/events', { headers: { Accept: 'application/json' } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Event feed unavailable');
    state.events = Array.isArray(result.events) ? result.events : [];
    renderEvents();
    if (state.events[0]) setHeroEvent(state.events[0]);
  } catch (error) {
    console.error('111ATL event feed error:', error);
    state.events = [];
    renderEvents();
    if (status) status.textContent = 'The event feed could not load. Direct RSVP and booking forms are still available.';
  }
}

function findEvent(eventId) {
  return state.events.find((event) => String(event.id) === String(eventId));
}

function selectEvent(event) {
  state.selectedEvent = event || null;
  const title = event?.title || 'General 111ATL Guest List';
  const date = event?.event_date || '';
  const id = event?.id || '';

  qs('#rsvpEventId').value = id;
  qs('#rsvpEventTitle').value = title;
  qs('#rsvpEventDate').value = date;

  const summary = qs('#selectedEventSummary');
  if (summary) {
    summary.innerHTML = event
      ? `<span>Selected event</span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(formatEventDate(date))} · ${escapeHtml(event.venue || 'Atlanta')}</small>`
      : '<span>Selected event</span><strong>General 111ATL Guest List</strong><small>Choose a flyer above to lock in a specific event.</small>';
  }
}

function openEventDialog(event) {
  const dialog = qs('#eventDialog');
  if (!dialog || !event) return;

  qs('#dialogDate').textContent = formatEventDate(event.event_date);
  qs('#dialogTitle').textContent = event.title || '111ATL Event';
  qs('#dialogSubtitle').textContent = event.subtitle || 'Guest list, VIP, and booking requests are available through 111ATL.';
  qs('#dialogVenue').textContent = [event.venue, event.address].filter(Boolean).join(' · ') || 'Atlanta';
  qs('#dialogTime').textContent = eventTime(event);
  qs('#dialogPoster').innerHTML = eventPoster(event, state.events.indexOf(event), 'dialog-poster-inner');

  const ticketLink = qs('#dialogTicket');
  const ticket = safeUrl(event.ticket_url);
  ticketLink.hidden = !ticket;
  ticketLink.href = ticket || '#';
  qs('#dialogRsvp').dataset.rsvpEvent = event.id || '';

  if (typeof dialog.showModal === 'function') dialog.showModal();
  else dialog.setAttribute('open', '');
}

function closeEventDialog() {
  const dialog = qs('#eventDialog');
  if (!dialog) return;
  if (typeof dialog.close === 'function') dialog.close();
  else dialog.removeAttribute('open');
}

function scrollToRsvp(event) {
  selectEvent(event);
  closeEventDialog();
  qs('#rsvp')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  window.setTimeout(() => qs('#rsvp input[name="full_name"]')?.focus(), 500);
}

function serializeForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const params = new URLSearchParams(window.location.search);

  Object.keys(data).forEach((key) => {
    if (typeof data[key] === 'string') data[key] = data[key].trim();
    if (data[key] === '') delete data[key];
  });

  return {
    ...data,
    form_type: form.dataset.formType || 'general',
    booking_type: data.booking_type || form.dataset.bookingType || data.lead_type || undefined,
    source: '111atl.com',
    page: window.location.pathname + window.location.hash,
    referrer: document.referrer || null,
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    submitted_at: new Date().toISOString()
  };
}

function setFormStatus(form, type, message) {
  const status = qs('.form-status', form);
  if (!status) return;
  status.classList.remove('is-success', 'is-error');
  if (type) status.classList.add(type);
  status.textContent = message;
}

async function submitForm(form) {
  const button = qs('button[type="submit"]', form);
  const originalText = button?.textContent || '';
  const payload = serializeForm(form);

  setFormStatus(form, '', 'Sending...');
  if (button) {
    button.disabled = true;
    button.textContent = 'Sending...';
  }

  try {
    const response = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Request failed');

    const success = payload.form_type === 'nda'
      ? 'NDA signed and recorded. The 111ATL team has it.'
      : payload.booking_type === 'event_rsvp'
        ? 'RSVP received. The 111ATL team has your request.'
        : 'Request received. The 111ATL team has it.';

    setFormStatus(form, 'is-success', success);
    form.reset();
    if (payload.booking_type === 'event_rsvp') selectEvent(null);
  } catch (error) {
    console.error('111ATL form error:', error);
    setFormStatus(form, 'is-error', error.message || 'Something blocked the request. Please try again.');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = originalText;
    }
  }
}

function setMinimumDates() {
  const today = new Date().toISOString().slice(0, 10);
  qsa('input[type="date"]').forEach((input) => {
    if (!input.min) input.min = today;
  });
}

function bindInteractions() {
  document.addEventListener('click', (event) => {
    const openButton = event.target.closest('[data-open-event]');
    if (openButton) {
      const selected = findEvent(openButton.dataset.openEvent);
      if (selected) openEventDialog(selected);
      return;
    }

    const rsvpButton = event.target.closest('[data-rsvp-event]');
    if (rsvpButton) {
      const selected = findEvent(rsvpButton.dataset.rsvpEvent);
      scrollToRsvp(selected);
      return;
    }

    const filterButton = event.target.closest('[data-event-filter]');
    if (filterButton) {
      state.filter = filterButton.dataset.eventFilter;
      qsa('[data-event-filter]').forEach((button) => button.classList.toggle('is-active', button === filterButton));
      renderEvents();
    }
  });

  qsa('.lead-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitForm(form);
    });
  });

  const menuButton = qs('#menuButton');
  const mobileMenu = qs('#mobileMenu');
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu?.classList.toggle('is-open', !open);
  });
  qsa('a', mobileMenu).forEach((link) => link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    mobileMenu?.classList.remove('is-open');
  }));

  qs('#dialogClose')?.addEventListener('click', closeEventDialog);
  qs('#eventDialog')?.addEventListener('click', (event) => {
    if (event.target === event.currentTarget) closeEventDialog();
  });

  const header = qs('#siteHeader');
  const updateHeader = () => header?.classList.toggle('is-scrolled', window.scrollY > 20);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
}

setMinimumDates();
bindInteractions();
loadEvents();
