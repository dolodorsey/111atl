const ASSET_BASE = 'https://dzlmtvodpyhetvektfuo.supabase.co/storage/v1/object/public/brand-graphics/';
const state = { events: [], eventFilter: 'all', entityFilter: 'all', entityQuery: '', selectedEvent: null };

const entities = [
  {
    key: 'dr-dorsey', name: 'Dr. Dorsey', category: 'enterprise',
    description: 'Founder, lifestyle specialist, author, speaker, consultant, and cultural operator.',
    logo: `${ASSET_BASE}dr_dorsey/01_logos/DORSEY_LOGO.png`,
    background: `${ASSET_BASE}dr_dorsey/website/penthouse-skyline.jpg`,
    url: 'https://doctordorsey.com', cta: 'Visit Website'
  },
  {
    key: 'kollective', name: 'The Kollective ENT.', category: 'enterprise',
    description: 'The enterprise platform behind independent brands, experiences, products, and public initiatives.',
    logo: `${ASSET_BASE}dr_dorsey/00-brand-assets/logos/kollective-emblem-gold-black.png`,
    background: `${ASSET_BASE}dr_dorsey/website/luxury-venue.jpg`,
    url: '#forms', cta: 'Business Inquiry'
  },
  {
    key: 'university', name: 'The University', category: 'enterprise',
    description: 'A national skills and trade education platform built for practical careers and ownership.',
    background: `${ASSET_BASE}pulse_university/04_social_posts/POSTED_UP_CAMPUS_CITY_GRUNGE.png`,
    url: '#forms', cta: 'Program Inquiry'
  },
  {
    key: 'rose', name: 'Rose on Piedmont', category: 'experience',
    description: 'Atlanta hospitality, nightlife, patio culture, private events, and weekly experiences.',
    background: `${ASSET_BASE}social-dashboard/2026-07-17/dolodorsey/rose-bar-her-night-jcole.png`,
    url: '#events', cta: 'See Events'
  },
  {
    key: 'grownish', name: 'GROWN-ISH', category: 'experience',
    description: 'Atlanta Friday nightlife built around grown energy, music, birthdays, and premium tables.',
    background: `${ASSET_BASE}email-newsletters/grownish-jcole-afterparty-0717-corrected.png`,
    url: '#events', cta: 'Reserve Friday'
  },
  {
    key: 'good-times', name: 'GOOD TIMES', category: 'experience',
    description: 'Curated city experiences, events, nightlife, restaurants, and concierge discovery.',
    logo: `${ASSET_BASE}good_times/00-brand-assets/logos/good-times-logo-gold-black.png`,
    background: `${ASSET_BASE}good_times/atl-nightlife-elevated.png`,
    url: 'https://thegoodtimesworldwide.com', cta: 'Explore'
  },
  {
    key: 'sole-exchange', name: 'Sole Exchange', category: 'culture',
    description: 'Community sneaker drives, cultural activations, and impact through access and giving.',
    logo: `${ASSET_BASE}email-newsletters/sole-exchange-logo.png`,
    background: `${ASSET_BASE}email-newsletters/sole-exchange-flyer-v3-air-force-1.png`,
    url: '#forms', cta: 'Support the Mission'
  },
  {
    key: 'maga', name: 'Make Atlanta Great Again', category: 'culture',
    description: 'An Atlanta-first culture, apparel, event, and civic pride platform.',
    background: `${ASSET_BASE}maga/generated/maga_hero.png`,
    url: 'https://thaoldatlanta.com', cta: 'Visit Website'
  },
  {
    key: 'hakuna-matata', name: 'Hakuna Matata', category: 'products',
    description: 'Dr. Dorsey’s book and lifestyle philosophy on enjoying life while building legacy.',
    background: `${ASSET_BASE}bodega/hakuna-matata/cover-hero.png`,
    url: '#book', cta: 'Book Details'
  },
  {
    key: 'bodega', name: 'Bodega', category: 'products',
    description: 'A culture-forward retail platform for products, creative drops, and lifestyle goods.',
    background: `${ASSET_BASE}bodega/hakuna-matata/stack-of-books.png`,
    url: 'https://bodegabodegabodega.com', cta: 'Shop Bodega'
  },
  {
    key: 'stush', name: 'STUSH', category: 'products',
    description: 'Premium fashion, elevated streetwear, and confident everyday uniforms.',
    background: `${ASSET_BASE}stush/stush_retail/056_stush___retail_rack_with_logo_wall.jpg`,
    url: 'https://stushusa.com', cta: 'Shop STUSH'
  },
  {
    key: 'pulse', name: 'PULSE', category: 'products',
    description: 'Athletic, golf, lounge, and lifestyle apparel driven by movement and signal.',
    background: `${ASSET_BASE}pulse/pulse_landing_v2/040_drive_every_moment___feel_the_power.jpg`,
    url: '#forms', cta: 'PULSE Inquiry'
  },
  {
    key: 'pronto', name: 'Pronto Energy', category: 'products',
    description: 'Energy for nightlife, fitness, festivals, sports, travel, and everyday momentum.',
    logo: `${ASSET_BASE}pronto_energy/logos/pronto-logo.png`,
    background: `${ASSET_BASE}pronto_energy/generated/pronto_gym_hero_v2.png`,
    url: 'https://pronto-energy-website.vercel.app', cta: 'Explore Pronto'
  }
];

const requestTypes = [
  { key: 'general', label: 'General Inquiry', short: 'Route a question', formType: 'general', leadType: 'general', fields: [] },
  { key: 'rsvp', label: 'Event RSVP', short: 'Join the guest list', formType: 'booking', bookingType: 'event_rsvp', fields: ['date','party'] },
  { key: 'vip', label: 'VIP / Table', short: 'Tables and sections', formType: 'booking', bookingType: 'vip_table', fields: ['date','party','budget'] },
  { key: 'birthday', label: 'Birthday / Private Event', short: 'Plan the full experience', formType: 'booking', bookingType: 'birthday', fields: ['date','party','budget'] },
  { key: 'partner', label: 'Partnership / Sponsor', short: 'Collaborate or activate', formType: 'general', leadType: 'partnership', fields: ['budget'] },
  { key: 'vendor', label: 'Vendor / Pop-Up', short: 'Sell or activate', formType: 'general', leadType: 'vendor', fields: ['date','budget'] },
  { key: 'team', label: 'Team / Talent Application', short: 'Work, host, DJ, create', formType: 'host', leadType: 'applicant', fields: [] },
  { key: 'book', label: 'Book / Bulk Order', short: 'Launch, speaking, quantities', formType: 'general', leadType: 'book_interest', fields: ['party'] },
  { key: 'product', label: 'Product / Wholesale', short: 'Retail and distribution', formType: 'general', leadType: 'product_wholesale', fields: ['budget'] }
];

const qs = (selector, scope = document) => scope.querySelector(selector);
const qsa = (selector, scope = document) => [...scope.querySelectorAll(selector)];

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#039;', '"':'&quot;' }[char]));
}

function safeUrl(value = '') {
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function publicLink(url) {
  if (!url || url.startsWith('#')) return url || '#forms';
  return safeUrl(url) || '#forms';
}

function formatEventDate(dateValue, short = false) {
  if (!dateValue) return 'Date TBA';
  const date = new Date(`${dateValue}T12:00:00`);
  return date.toLocaleDateString('en-US', { weekday: short ? 'short' : 'long', month: short ? 'short' : 'long', day: 'numeric' });
}

function daysFromToday(dateValue) {
  if (!dateValue) return Infinity;
  const today = new Date(); today.setHours(0,0,0,0);
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

function eventTime(event) {
  return [event.start_time, event.end_time].filter(Boolean).join(' – ') || 'Time TBA';
}

function eventPoster(event, index = 0, extraClass = '') {
  const flyer = safeUrl(event.flyer_url);
  if (flyer) return `<div class="event-poster ${extraClass}"><img src="${escapeHtml(flyer)}" alt="${escapeHtml(event.title || '111ATL event')} flyer" loading="lazy"></div>`;
  const tone = (index % 3) + 1;
  return `<div class="event-poster ${extraClass}"><div class="generated-poster poster-${tone}">
    <span>111ATL · ${escapeHtml(formatEventDate(event.event_date, true).toUpperCase())}</span>
    <strong>${escapeHtml(event.title || 'ATLANTA EVENT')}</strong>
    <small>${escapeHtml(event.metadata?.brand || event.subtitle || 'Atlanta after dark')}</small>
    <b>${escapeHtml(event.venue || 'ATLANTA')}</b>
  </div></div>`;
}

function eventCard(event, index) {
  const ticket = safeUrl(event.ticket_url);
  return `<article class="event-card">
    <button class="event-poster" type="button" data-open-event="${escapeHtml(event.id || '')}" aria-label="View ${escapeHtml(event.title || 'event')} details">
      ${eventPoster(event, index).replace(/^<div class="event-poster"[^>]*>|<\/div>$/g, '')}
    </button>
    <div class="event-card-body">
      <span>${escapeHtml(formatEventDate(event.event_date, true))}</span>
      <h3>${escapeHtml(event.title || '111ATL Event')}</h3>
      <p class="event-description">${escapeHtml(event.subtitle || event.metadata?.theme || 'Guest list, VIP, and direct access through 111ATL.')}</p>
      <dl><div><dt>Venue</dt><dd>${escapeHtml(event.venue || 'Atlanta')}</dd></div><div><dt>Time</dt><dd>${escapeHtml(eventTime(event))}</dd></div></dl>
      <div class="card-actions">
        <button type="button" data-rsvp-event="${escapeHtml(event.id || '')}">RSVP Direct</button>
        ${ticket ? `<a href="${escapeHtml(ticket)}" target="_blank" rel="noopener">Tickets ↗</a>` : `<button type="button" data-open-event="${escapeHtml(event.id || '')}">Details</button>`}
      </div>
    </div>
  </article>`;
}

function renderEvents() {
  const grid = qs('#eventGrid');
  const filtered = state.events.filter(event => eventMatchesFilter(event, state.eventFilter));
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state"><p class="eyebrow dark-eyebrow">Calendar update</p><h3>No events in this view yet.</h3><p>Switch filters or submit a general RSVP request.</p><a class="button button-dark" href="#forms" data-form-preset="rsvp">Join the List</a></div>`;
    qs('#eventsStatus').textContent = state.events.length ? 'No events match this filter.' : 'The next event drop is being updated.';
    return;
  }
  grid.innerHTML = filtered.map(eventCard).join('');
  qs('#eventsStatus').textContent = `${filtered.length} upcoming event${filtered.length === 1 ? '' : 's'}`;
}

function setHeroEvent(event) {
  if (!event) return;
  const flyer = safeUrl(event.flyer_url);
  qs('#heroEvent').innerHTML = `<div class="mini-poster">${flyer ? `<img src="${escapeHtml(flyer)}" alt="">` : `<span>UP NEXT</span><strong>${escapeHtml(event.title || 'ATLANTA')}</strong><small>${escapeHtml(formatEventDate(event.event_date, true))}</small>`}</div>
    <div><span class="panel-label">Live calendar</span><h3>${escapeHtml(event.title || '111ATL Event')}</h3><p>${escapeHtml([formatEventDate(event.event_date, true), event.venue].filter(Boolean).join(' · '))}</p></div>`;
}

async function loadEvents() {
  try {
    const response = await fetch('/api/events', { headers: { Accept: 'application/json' } });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Event feed unavailable');
    state.events = Array.isArray(result.events) ? result.events : Array.isArray(result) ? result : [];
    renderEvents();
    if (state.events[0]) setHeroEvent(state.events[0]);
    qs('#eventCount').textContent = String(state.events.length || 'Live');
  } catch (error) {
    console.error('111ATL event feed error:', error);
    state.events = [];
    renderEvents();
  }
}

function entityCard(entity) {
  const logo = entity.logo ? `<img class="brand-logo" src="${escapeHtml(entity.logo)}" alt="${escapeHtml(entity.name)} logo" loading="lazy" onerror="this.remove();this.parentElement.querySelector('.wordmark').hidden=false">` : '';
  const target = entity.url?.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
  return `<article class="entity-card" data-category="${escapeHtml(entity.category)}">
    <div class="logo-stage">
      ${entity.background ? `<img class="brand-bg" src="${escapeHtml(entity.background)}" alt="" loading="lazy">` : ''}
      ${logo}
      <span class="wordmark"${entity.logo ? ' hidden' : ''}>${escapeHtml(entity.name)}</span>
    </div>
    <div class="entity-card-body">
      <small>${escapeHtml(entity.category)}</small>
      <h3>${escapeHtml(entity.name)}</h3>
      <p>${escapeHtml(entity.description)}</p>
      <div class="entity-actions">
        <a href="${escapeHtml(publicLink(entity.url))}"${target}>${escapeHtml(entity.cta || 'Open')} ↗</a>
        <button type="button" data-entity-inquiry="${escapeHtml(entity.key)}">Inquire</button>
      </div>
    </div>
  </article>`;
}

function renderEntities() {
  const query = state.entityQuery.toLowerCase().trim();
  const filtered = entities.filter(entity => {
    const categoryMatch = state.entityFilter === 'all' || entity.category === state.entityFilter;
    const queryMatch = !query || `${entity.name} ${entity.description} ${entity.category}`.toLowerCase().includes(query);
    return categoryMatch && queryMatch;
  });
  qs('#entityGrid').innerHTML = filtered.map(entityCard).join('');
  qs('#entityStatus').textContent = `${filtered.length} focus brand${filtered.length === 1 ? '' : 's'} shown.`;
}

function populateForms() {
  qs('#brandSelect').innerHTML = `<option value="111atl">111ATL / General</option>` + entities.map(entity => `<option value="${escapeHtml(entity.key)}">${escapeHtml(entity.name)}</option>`).join('');
  qs('#requestTypeSelect').innerHTML = requestTypes.map(item => `<option value="${escapeHtml(item.key)}">${escapeHtml(item.label)}</option>`).join('');
  qs('#formLaneGrid').innerHTML = requestTypes.map((item, index) => `<button type="button" data-request-key="${escapeHtml(item.key)}"><span>${String(index+1).padStart(2,'0')}</span><b>${escapeHtml(item.label)}</b><small>${escapeHtml(item.short)}</small></button>`).join('');
  applyRequestType('general');
}

function requestType(key) { return requestTypes.find(item => item.key === key) || requestTypes[0]; }

function applyRequestType(key, options = {}) {
  const type = requestType(key);
  qs('#requestTypeSelect').value = type.key;
  qs('#formPanelTitle').textContent = type.label;
  qs('#formKey').value = `111atl.${type.key}`;
  qsa('.conditional-field').forEach(field => {
    field.hidden = !type.fields.includes(field.dataset.fieldGroup);
  });
  qsa('[data-request-key]').forEach(button => button.classList.toggle('is-active', button.dataset.requestKey === type.key));
  if (options.brandKey) qs('#brandSelect').value = options.brandKey;
  if (options.event) {
    qs('#formEventId').value = options.event.id || '';
    qs('#formEventTitle').value = options.event.title || '';
    qs('textarea[name="notes"]').value = `I am interested in ${options.event.title || 'this event'}.`;
  }
}

function scrollToForm(typeKey, options = {}) {
  applyRequestType(typeKey, options);
  qs('#forms').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(() => qs('#universalForm input[name="full_name"]')?.focus(), 500);
}

function findEvent(id) { return state.events.find(event => String(event.id) === String(id)); }

function openEventDialog(event) {
  if (!event) return;
  state.selectedEvent = event;
  qs('#dialogDate').textContent = formatEventDate(event.event_date);
  qs('#dialogTitle').textContent = event.title || '111ATL Event';
  qs('#dialogSubtitle').textContent = event.subtitle || event.metadata?.theme || 'Guest list, VIP, and direct access are available through 111ATL.';
  qs('#dialogVenue').textContent = [event.venue, event.address].filter(Boolean).join(' · ') || 'Atlanta';
  qs('#dialogTime').textContent = eventTime(event);
  qs('#dialogPoster').innerHTML = eventPoster(event, state.events.indexOf(event), 'dialog-poster-inner');
  const ticket = safeUrl(event.ticket_url);
  qs('#dialogTicket').hidden = !ticket;
  qs('#dialogTicket').href = ticket || '#';
  const dialog = qs('#eventDialog');
  if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
}

function closeDialog() {
  const dialog = qs('#eventDialog');
  if (dialog.close) dialog.close(); else dialog.removeAttribute('open');
}

function serializeForm(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  Object.keys(data).forEach(key => {
    if (typeof data[key] === 'string') data[key] = data[key].trim();
    if (data[key] === '') delete data[key];
  });
  const type = requestType(data.request_type);
  const entity = entities.find(item => item.key === data.brand_key);
  return {
    ...data,
    form_type: type.formType,
    booking_type: type.bookingType,
    lead_type: type.leadType,
    event_interest: data.event_title || null,
    message: data.notes,
    source: '111atl.com',
    page: window.location.pathname + window.location.hash,
    brand_name: entity?.name || '111ATL',
    submitted_at: new Date().toISOString()
  };
}

async function submitForm(form) {
  const button = qs('button[type="submit"]', form);
  const original = button.textContent;
  const status = qs('.form-status', form);
  button.disabled = true; button.textContent = 'Sending…'; status.className = 'form-status'; status.textContent = 'Routing your request…';
  try {
    const response = await fetch('/api/leads', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(serializeForm(form)) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Request failed');
    status.classList.add('is-success'); status.textContent = 'Request received. The 111ATL team has it.';
    form.reset(); qs('#brandSelect').value = '111atl'; applyRequestType('general');
  } catch (error) {
    console.error('111ATL form error:', error);
    status.classList.add('is-error'); status.textContent = error.message || 'Something blocked the request. Try again.';
  } finally {
    button.disabled = false; button.textContent = original;
  }
}

function bindInteractions() {
  document.addEventListener('click', event => {
    const filter = event.target.closest('[data-event-filter]');
    if (filter) {
      state.eventFilter = filter.dataset.eventFilter;
      qsa('[data-event-filter]').forEach(button => button.classList.toggle('is-active', button === filter));
      renderEvents(); return;
    }
    const entityFilter = event.target.closest('[data-entity-filter]');
    if (entityFilter) {
      state.entityFilter = entityFilter.dataset.entityFilter;
      qsa('[data-entity-filter]').forEach(button => button.classList.toggle('is-active', button === entityFilter));
      renderEntities(); return;
    }
    const open = event.target.closest('[data-open-event]');
    if (open) { openEventDialog(findEvent(open.dataset.openEvent)); return; }
    const rsvp = event.target.closest('[data-rsvp-event]');
    if (rsvp) { const selected = findEvent(rsvp.dataset.rsvpEvent); scrollToForm('rsvp', { event:selected, brandKey:'grownish' }); closeDialog(); return; }
    const inquiry = event.target.closest('[data-entity-inquiry]');
    if (inquiry) { scrollToForm('general', { brandKey:inquiry.dataset.entityInquiry }); return; }
    const lane = event.target.closest('[data-request-key]');
    if (lane) { applyRequestType(lane.dataset.requestKey); qs('#formPanel').scrollIntoView({behavior:'smooth',block:'center'}); return; }
    const preset = event.target.closest('[data-form-preset]');
    if (preset) { event.preventDefault(); scrollToForm(preset.dataset.formPreset); }
  });

  qs('#entitySearch').addEventListener('input', event => { state.entityQuery = event.target.value; renderEntities(); });
  qs('#requestTypeSelect').addEventListener('change', event => applyRequestType(event.target.value));
  qs('#universalForm').addEventListener('submit', event => { event.preventDefault(); submitForm(event.currentTarget); });
  qs('#dialogClose').addEventListener('click', closeDialog);
  qs('#dialogRsvp').addEventListener('click', () => { if (state.selectedEvent) scrollToForm('rsvp', { event:state.selectedEvent, brandKey:'grownish' }); closeDialog(); });
  qs('#eventDialog').addEventListener('click', event => { if (event.target === event.currentTarget) closeDialog(); });

  const menuButton = qs('#menuButton'), mobileMenu = qs('#mobileMenu');
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('is-open', !open);
  });
  qsa('a', mobileMenu).forEach(link => link.addEventListener('click', () => { mobileMenu.classList.remove('is-open'); menuButton.setAttribute('aria-expanded','false'); }));
  window.addEventListener('scroll', () => qs('#siteHeader').classList.toggle('is-scrolled', window.scrollY > 20), { passive:true });
}

function setClock() {
  const update = () => {
    qs('#atlClock').textContent = new Intl.DateTimeFormat('en-US', { timeZone:'America/New_York', hour:'numeric', minute:'2-digit' }).format(new Date()) + ' ATL';
  };
  update(); setInterval(update, 30000);
}

function setMinimumDates() {
  const today = new Date().toISOString().slice(0,10);
  qsa('input[type="date"]').forEach(input => input.min = today);
}

document.addEventListener('DOMContentLoaded', () => {
  renderEntities();
  populateForms();
  bindInteractions();
  setClock();
  setMinimumDates();
  loadEvents();
});
