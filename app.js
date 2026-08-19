const SUPABASE_URL = 'https://wfkohcwxxsrhcxhepfql.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zKej0f4ql6VSR9rtHXaU0w_0yhVNAGL';

const FALLBACK_EVENTS = [
  { slug:'taste-of-art', title:'Taste of Art', series:'Labor Day Weekend', event_date:'2026-09-04', date_label:'Friday · September 4, 2026', location_text:'Atlanta, GA', description:'A curated Friday night where art, sound, style and Atlanta culture meet.', status:'upcoming', ticket_url:null, sort_order:10 },
  { slug:'project-x-pool-party', title:'Project X', series:'Labor Day Weekend', event_date:'2026-09-05', date_label:'Saturday · September 5, 2026', location_text:'Atlanta, GA', description:'The Saturday pool-party takeover for Labor Day Weekend.', status:'upcoming', ticket_url:null, sort_order:20 },
  { slug:'seven-midtown', title:'Seven Midtown', series:'Labor Day Weekend', event_date:'2026-09-06', date_label:'Sunday · September 6, 2026', location_text:'Atlanta, GA', description:'Sunday in Midtown — a full 111ATL Labor Day Weekend experience.', status:'upcoming', ticket_url:null, sort_order:30 },
  { slug:'tea-time-golf-tournament', title:'Tea Time Golf Tournament', series:'Labor Day Weekend', event_date:'2026-09-07', date_label:'Monday · September 7, 2026', location_text:'Atlanta, GA', description:'Labor Day golf, competition and connection — built around a full day on the course.', status:'upcoming', ticket_url:null, sort_order:40 },
  { slug:'greek-ball', title:'Greek Ball', series:'Ball Series', event_date:'2026-10-17', date_label:'October 17, 2026', location_text:'Atlanta, GA', description:'The Ball Series opens with a polished celebration of Greek culture, legacy and Atlanta energy.', status:'upcoming', ticket_url:null, sort_order:50 },
  { slug:'monsters-ball', title:'Monster’s Ball', series:'Ball Series', event_date:'2026-10-31', date_label:'October 31, 2026', location_text:'Atlanta, GA', description:'Halloween night, elevated into a formal 111ATL Ball Series experience.', status:'upcoming', ticket_url:null, sort_order:60 },
  { slug:'black-ball', title:'Black Ball', series:'Ball Series', event_date:'2026-11-28', date_label:'November 28, 2026', location_text:'Atlanta, GA', description:'An all-black Ball Series night built around style, presence and celebration.', status:'upcoming', ticket_url:null, sort_order:70 },
  { slug:'snow-ball', title:'Snow Ball', series:'Ball Series', event_date:'2026-12-12', date_label:'December 12, 2026', location_text:'Atlanta, GA', description:'An all-white winter Ball Series experience in Atlanta.', status:'upcoming', ticket_url:null, sort_order:80 },
  { slug:'winter-wonderland', title:'Winter Wonderland', series:'Seasonal', event_date:null, date_label:'Winter 2026 · Date Announcing', location_text:'Atlanta, GA', description:'A holiday-season 111ATL experience. Full details will be announced soon.', status:'announcing', ticket_url:null, sort_order:90 },
  { slug:'new-years-eve', title:'New Year’s Eve', series:'Seasonal', event_date:'2026-12-31', date_label:'December 31, 2026', location_text:'Atlanta, GA', description:'111ATL closes the year with a New Year’s Eve experience built for the city.', status:'upcoming', ticket_url:null, sort_order:100 },
  { slug:'champagne-ball', title:'Champagne Ball', series:'Ball Series', event_date:'2027-01-02', date_label:'January 2, 2027', location_text:'Atlanta, GA', description:'A celebration of success, momentum and the new year.', status:'upcoming', ticket_url:null, sort_order:110 },
  { slug:'rose-ball', title:'Rose Ball', series:'Ball Series', event_date:'2027-02-13', date_label:'February 13, 2027', location_text:'Atlanta, GA', description:'A Valentine’s weekend Ball Series experience in shades of red.', status:'upcoming', ticket_url:null, sort_order:120 },
  { slug:'juneteenth-atl', title:'Juneteenth ATL', series:'Seasonal', event_date:'2027-06-19', date_label:'June 19, 2027', location_text:'Atlanta, GA', description:'A Juneteenth celebration centered on culture, community and Atlanta.', status:'upcoming', ticket_url:null, sort_order:130 }
];

const state = {
  events: [],
  selectedEventSlug: null,
  countdownTimer: null
};

const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

const eventDialog = qs('#eventDialog');
const listDialog = qs('#listDialog');
const siteHeader = qs('#siteHeader');

function normalizeEvent(raw) {
  return {
    slug: String(raw.slug || ''),
    title: String(raw.title || ''),
    series: String(raw.series || ''),
    event_date: raw.event_date || null,
    date_label: String(raw.date_label || 'Date announcing'),
    location_text: String(raw.location_text || 'Atlanta, GA'),
    description: String(raw.description || ''),
    status: String(raw.status || 'upcoming'),
    ticket_url: raw.ticket_url || null,
    sort_order: Number(raw.sort_order || 0)
  };
}

async function loadEvents() {
  const endpoint = `${SUPABASE_URL}/rest/v1/one_eleven_events?select=slug,title,series,event_date,date_label,location_text,description,status,ticket_url,sort_order&published=eq.true&order=sort_order.asc`;
  try {
    const response = await fetch(endpoint, {
      headers: { apikey: SUPABASE_KEY },
      cache: 'no-store'
    });
    if (!response.ok) throw new Error(`Events request failed: ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data) || !data.length) throw new Error('No published events returned');
    state.events = data.map(normalizeEvent);
  } catch (error) {
    console.warn('111ATL event backend unavailable; using launch-safe event cache.', error);
    state.events = FALLBACK_EVENTS.map(normalizeEvent);
  }

  renderAll();
  openDeepLinkedEvent();
}

function renderAll() {
  renderLaborDay();
  renderBallSeries();
  renderSeasonal();
  renderNextUp();
  qs('#year').textContent = new Date().getFullYear();
}

function renderLaborDay() {
  const target = qs('#laborGrid');
  const events = state.events.filter(event => event.series === 'Labor Day Weekend');
  target.innerHTML = '';

  events.forEach((event, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'event-card';
    button.dataset.event = event.slug;
    button.dataset.index = String(index + 1).padStart(2, '0');
    button.setAttribute('aria-label', `View ${event.title} details`);

    const day = event.date_label.includes('·') ? event.date_label.split('·')[0].trim() : 'Labor Day Weekend';
    button.innerHTML = `
      <div class="card-top">
        <span class="card-day">${escapeHtml(day)}</span>
        <span class="card-arrow" aria-hidden="true">↗</span>
      </div>
      <div class="card-main">
        <small>${escapeHtml(event.date_label)}</small>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description)}</p>
      </div>`;
    target.appendChild(button);
  });
}

function renderBallSeries() {
  const target = qs('#ballGrid');
  const events = state.events.filter(event => event.series === 'Ball Series');
  target.innerHTML = '';

  events.forEach((event, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ball-row';
    button.dataset.event = event.slug;
    button.setAttribute('aria-label', `View ${event.title} details`);
    button.innerHTML = `
      <span class="ball-num">${String(index + 1).padStart(2, '0')}</span>
      <h3>${escapeHtml(event.title)}</h3>
      <span class="ball-meta"><b>${escapeHtml(event.date_label)}</b><span>${escapeHtml(event.location_text)}</span></span>
      <span class="ball-arrow" aria-hidden="true">↗</span>`;
    target.appendChild(button);
  });
}

function renderSeasonal() {
  const target = qs('#seasonalGrid');
  const events = state.events.filter(event => event.series === 'Seasonal');
  target.innerHTML = '';

  events.forEach(event => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'season-card';
    button.dataset.event = event.slug;
    button.setAttribute('aria-label', `View ${event.title} details`);
    button.innerHTML = `
      <span class="season-date">${escapeHtml(event.date_label)}</span>
      <span class="card-arrow" aria-hidden="true">↗</span>
      <div>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description)}</p>
      </div>`;
    target.appendChild(button);
  });
}

function renderNextUp() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dated = state.events
    .filter(event => event.event_date)
    .map(event => ({ event, date: dateFromISO(event.event_date) }))
    .filter(item => item.date >= today)
    .sort((a, b) => a.date - b.date);

  if (!dated.length) {
    qs('#nextTitle').textContent = 'More coming soon';
    qs('#nextDate').textContent = '111ATL';
    qs('#countdown').innerHTML = '';
    return;
  }

  const next = dated[0];
  qs('#nextTitle').textContent = next.event.title;
  qs('#nextDate').textContent = next.event.date_label;
  updateCountdown(next.date);
  if (state.countdownTimer) clearInterval(state.countdownTimer);
  state.countdownTimer = setInterval(() => updateCountdown(next.date), 60000);
}

function updateCountdown(date) {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  let diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000);
  diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000);
  diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000);
  diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);

  qs('#countdown').innerHTML = [
    ['DAYS', days],
    ['HRS', hours],
    ['MIN', minutes],
    ['SEC', seconds]
  ].map(([label, value]) => `<div><b>${String(value).padStart(2, '0')}</b><small>${label}</small></div>`).join('');
}

function openEvent(slug, changeRoute = true) {
  const event = state.events.find(item => item.slug === slug);
  if (!event) return;

  qs('#dialogSeries').textContent = event.series;
  qs('#dialogTitle').textContent = event.title;
  qs('#dialogDate').textContent = event.date_label;
  qs('#dialogLocation').textContent = event.location_text;
  qs('#dialogDescription').textContent = event.description;
  qs('#dialogPosterSeries').textContent = event.series;
  qs('#dialogPosterTitle').textContent = event.title;

  const action = qs('#dialogAction');
  action.innerHTML = '';

  if (event.ticket_url) {
    const link = document.createElement('a');
    link.className = 'dialog-action-button';
    link.href = event.ticket_url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = '<span>Get tickets</span><span>↗</span>';
    action.appendChild(link);
  } else {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'dialog-action-button';
    button.dataset.eventNotify = event.slug;
    button.innerHTML = `<span>${event.status === 'announcing' ? 'Notify me when announced' : 'Get event updates'}</span><span>↗</span>`;
    action.appendChild(button);
  }

  state.selectedEventSlug = event.slug;
  document.title = `${event.title} — 111ATL`;
  document.body.classList.add('dialog-open');
  if (!eventDialog.open) eventDialog.showModal();

  if (changeRoute && location.pathname !== `/events/${event.slug}`) {
    history.pushState({ event: event.slug }, '', `/events/${event.slug}`);
  }
}

function closeEventDialog(updateRoute = true) {
  if (eventDialog.open) eventDialog.close();
  document.body.classList.remove('dialog-open');
  document.title = '111ATL — Atlanta Events';
  if (updateRoute && location.pathname.startsWith('/events/')) {
    history.pushState({}, '', '/');
  }
}

function openList(slug = null) {
  const event = slug ? state.events.find(item => item.slug === slug) : null;
  state.selectedEventSlug = event?.slug || null;
  qs('#listDialogCopy').textContent = event
    ? `Get the ticket drop, location and updates for ${event.title}.`
    : 'Dates, locations, ticket releases and major 111ATL announcements.';
  qs('#eventFormMessage').textContent = '';
  if (!listDialog.open) listDialog.showModal();
  document.body.classList.add('dialog-open');
  setTimeout(() => qs('#eventEmail')?.focus(), 50);
}

function closeListDialog() {
  if (listDialog.open) listDialog.close();
  if (!eventDialog.open) document.body.classList.remove('dialog-open');
}

async function submitLead(form, messageNode, eventSlug = null) {
  const input = qs('input[type="email"]', form);
  const button = qs('button[type="submit"]', form);
  const email = input.value.trim();

  if (!input.checkValidity() || !email) {
    messageNode.textContent = 'Enter a valid email address.';
    input.focus();
    return;
  }

  button.disabled = true;
  messageNode.textContent = 'Adding you…';

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/one_eleven_event_leads`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify({
        event_slug: eventSlug || null,
        email,
        source: '111atl.com',
        consent: true
      })
    });

    if (!response.ok) throw new Error(`Lead request failed: ${response.status}`);
    form.reset();
    messageNode.textContent = eventSlug ? 'Locked in. We’ll send the drop.' : 'You’re on the 111ATL list.';
  } catch (error) {
    console.error(error);
    messageNode.textContent = 'Could not save that right now. Please try again.';
  } finally {
    button.disabled = false;
  }
}

function openDeepLinkedEvent() {
  const match = location.pathname.match(/^\/events\/([^/]+)\/?$/);
  if (match) openEvent(decodeURIComponent(match[1]), false);
}

function dateFromISO(value) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function bindEvents() {
  document.addEventListener('click', event => {
    const eventButton = event.target.closest('[data-event]');
    if (eventButton) {
      openEvent(eventButton.dataset.event);
      return;
    }

    const notifyButton = event.target.closest('[data-event-notify]');
    if (notifyButton) {
      const slug = notifyButton.dataset.eventNotify;
      closeEventDialog(false);
      openList(slug);
      return;
    }

    const listButton = event.target.closest('[data-open-list]');
    if (listButton) openList(null);
  });

  qs('#dialogClose').addEventListener('click', () => closeEventDialog(true));
  qs('#listDialogClose').addEventListener('click', closeListDialog);

  eventDialog.addEventListener('click', event => {
    if (event.target === eventDialog) closeEventDialog(true);
  });
  listDialog.addEventListener('click', event => {
    if (event.target === listDialog) closeListDialog();
  });

  eventDialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeEventDialog(true);
  });
  listDialog.addEventListener('cancel', event => {
    event.preventDefault();
    closeListDialog();
  });

  qs('#mainSignup').addEventListener('submit', event => {
    event.preventDefault();
    submitLead(event.currentTarget, qs('#mainFormMessage'), null);
  });
  qs('#eventSignup').addEventListener('submit', event => {
    event.preventDefault();
    submitLead(event.currentTarget, qs('#eventFormMessage'), state.selectedEventSlug);
  });

  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  window.addEventListener('popstate', () => {
    const match = location.pathname.match(/^\/events\/([^/]+)\/?$/);
    if (match) openEvent(decodeURIComponent(match[1]), false);
    else closeEventDialog(false);
  });
}

bindEvents();
loadEvents();