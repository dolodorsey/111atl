const SUPABASE_URL = 'https://wfkohcwxxsrhcxhepfql.supabase.co';
const SUPABASE_KEY = 'sb_publishable_zKej0f4ql6VSR9rtHXaU0w_0yhVNAGL';
const MOTION_BASE = 'https://dzlmtvodpyhetvektfuo.supabase.co/storage/v1/object/public/brand-graphics/motion';

const FALLBACK_EVENTS = [
  { slug:'taste-of-art', title:'Taste of Art', series:'Labor Day Weekend', event_date:'2026-09-04', date_label:'Friday · September 4, 2026', location_text:'Atlanta, GA', description:'A curated Friday night where art, sound, style and Atlanta culture meet.', status:'upcoming', ticket_url:null, sort_order:10, motion_video_url:`${MOTION_BASE}/taste-of-art.mp4`, motion_poster_url:`${MOTION_BASE}/taste-of-art.jpg` },
  { slug:'project-x-pool-party', title:'Project X', series:'Labor Day Weekend', event_date:'2026-09-05', date_label:'Saturday · September 5, 2026', location_text:'Atlanta, GA', description:'The Saturday pool-party takeover for Labor Day Weekend.', status:'upcoming', ticket_url:null, sort_order:20, motion_video_url:`${MOTION_BASE}/project-x-animation.mp4`, motion_poster_url:`${MOTION_BASE}/project-x-animation.jpg` },
  { slug:'seven-midtown', title:'Seven Midtown', series:'Labor Day Weekend', event_date:'2026-09-06', date_label:'Sunday · September 6, 2026', location_text:'Atlanta, GA', description:'Sunday in Midtown — a full 111ATL Labor Day Weekend experience.', status:'upcoming', ticket_url:null, sort_order:30, motion_video_url:null, motion_poster_url:null },
  { slug:'tea-time-golf-tournament', title:'Tea Time Golf Tournament', series:'Labor Day Weekend', event_date:'2026-09-07', date_label:'Monday · September 7, 2026', location_text:'Atlanta, GA', description:'Labor Day golf, competition and connection — built around a full day on the course.', status:'upcoming', ticket_url:null, sort_order:40, motion_video_url:null, motion_poster_url:null },
  { slug:'greek-ball', title:'Greek Ball', series:'Ball Series', event_date:'2026-10-17', date_label:'October 17, 2026', location_text:'Atlanta, GA', description:'The Ball Series opens with a polished celebration of Greek culture, legacy and Atlanta energy.', status:'upcoming', ticket_url:null, sort_order:50, motion_video_url:null, motion_poster_url:null },
  { slug:'monsters-ball', title:'Monster’s Ball', series:'Ball Series', event_date:'2026-10-31', date_label:'October 31, 2026', location_text:'Atlanta, GA', description:'Halloween night, elevated into a formal 111ATL Ball Series experience.', status:'upcoming', ticket_url:null, sort_order:60, motion_video_url:null, motion_poster_url:null },
  { slug:'black-ball', title:'Black Ball', series:'Ball Series', event_date:'2026-11-28', date_label:'November 28, 2026', location_text:'Atlanta, GA', description:'An all-black Ball Series night built around style, presence and celebration.', status:'upcoming', ticket_url:null, sort_order:70, motion_video_url:null, motion_poster_url:null },
  { slug:'snow-ball', title:'Snow Ball', series:'Ball Series', event_date:'2026-12-12', date_label:'December 12, 2026', location_text:'Atlanta, GA', description:'An all-white winter Ball Series experience in Atlanta.', status:'upcoming', ticket_url:null, sort_order:80, motion_video_url:null, motion_poster_url:null },
  { slug:'winter-wonderland', title:'Winter Wonderland', series:'Seasonal', event_date:null, date_label:'Winter 2026 · Date Announcing', location_text:'Atlanta, GA', description:'A holiday-season 111ATL experience. Full details will be announced soon.', status:'announcing', ticket_url:null, sort_order:90, motion_video_url:null, motion_poster_url:null },
  { slug:'new-years-eve', title:'New Year’s Eve', series:'Seasonal', event_date:'2026-12-31', date_label:'December 31, 2026', location_text:'Atlanta, GA', description:'111ATL closes the year with a New Year’s Eve experience built for the city.', status:'upcoming', ticket_url:null, sort_order:100, motion_video_url:null, motion_poster_url:null },
  { slug:'champagne-ball', title:'Champagne Ball', series:'Ball Series', event_date:'2027-01-02', date_label:'January 2, 2027', location_text:'Atlanta, GA', description:'A celebration of success, momentum and the new year.', status:'upcoming', ticket_url:null, sort_order:110, motion_video_url:null, motion_poster_url:null },
  { slug:'rose-ball', title:'Rose Ball', series:'Ball Series', event_date:'2027-02-13', date_label:'February 13, 2027', location_text:'Atlanta, GA', description:'A Valentine’s weekend Ball Series experience in shades of red.', status:'upcoming', ticket_url:null, sort_order:120, motion_video_url:null, motion_poster_url:null },
  { slug:'juneteenth-atl', title:'Juneteenth ATL', series:'Seasonal', event_date:'2027-06-19', date_label:'June 19, 2027', location_text:'Atlanta, GA', description:'A Juneteenth celebration centered on culture, community and Atlanta.', status:'upcoming', ticket_url:null, sort_order:130, motion_video_url:null, motion_poster_url:null }
];

const state = { events: [], selectedEventSlug: null, countdownTimer: null };
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
    sort_order: Number(raw.sort_order || 0),
    motion_video_url: raw.motion_video_url || null,
    motion_poster_url: raw.motion_poster_url || null
  };
}

async function loadEvents() {
  const endpoint = `${SUPABASE_URL}/rest/v1/one_eleven_events?select=slug,title,series,event_date,date_label,location_text,description,status,ticket_url,sort_order,motion_video_url,motion_poster_url&published=eq.true&order=sort_order.asc`;
  try {
    const response = await fetch(endpoint, { headers: { apikey: SUPABASE_KEY }, cache: 'no-store' });
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
  renderGroup('#laborGrid', 'Labor Day Weekend');
  renderGroup('#ballGrid', 'Ball Series');
  renderGroup('#seasonalGrid', 'Seasonal');
  renderNextUp();
  qs('#year').textContent = new Date().getFullYear();
  activateMotion();
  activateReveal();
}

function renderGroup(selector, series) {
  const target = qs(selector);
  const events = state.events.filter(event => event.series === series);
  target.innerHTML = '';
  events.forEach((event, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'event-card';
    button.dataset.event = event.slug;
    button.style.setProperty('--delay', `${Math.min(index * 65, 325)}ms`);
    button.setAttribute('aria-label', `View ${event.title} details`);
    const topLabel = series === 'Labor Day Weekend' && event.date_label.includes('·')
      ? event.date_label.split('·')[0].trim()
      : series;
    button.innerHTML = `
      ${motionMarkup(event)}
      <div class="card-top">
        <span class="card-day">${escapeHtml(topLabel)}</span>
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

function motionMarkup(event, { fill = false } = {}) {
  if (event.motion_video_url && event.motion_poster_url) {
    const poster = escapeAttr(event.motion_poster_url);
    const video = escapeAttr(event.motion_video_url);
    return `<div class="motion-cover${fill ? ' fill' : ''}">
      <img class="motion-backdrop" src="${poster}" alt="" aria-hidden="true" loading="lazy" />
      <img class="motion-still" src="${poster}" alt="${escapeAttr(event.title)}" loading="lazy" />
      <video class="motion-video" muted loop playsinline preload="none" poster="${poster}" data-motion-src="${video}" aria-hidden="true"></video>
      <span class="motion-veil"></span>
    </div>`;
  }
  return `<div class="motion-cover motion-fallback${fill ? ' fill' : ''}" data-fallback="${escapeAttr(event.slug)}">
    <div class="fallback-mark"><b>111</b><span>ATL</span></div>
    <span class="motion-veil"></span>
  </div>`;
}

function activateMotion(root = document) {
  const videos = qsa('video[data-motion-src]:not([data-motion-bound])', root);
  if (!videos.length) return;
  const start = (video) => {
    if (!video.src) video.src = video.dataset.motionSrc;
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') attempt.catch(() => undefined);
  };
  const prepare = (video) => {
    video.dataset.motionBound = 'true';
    const ready = () => video.classList.add('ready');
    video.addEventListener('loadeddata', ready, { once: true });
    video.addEventListener('canplay', ready, { once: true });
  };
  videos.forEach(prepare);
  if (typeof IntersectionObserver === 'undefined') {
    videos.forEach(start);
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) start(video); else video.pause();
    });
  }, { rootMargin: '300px 0px', threshold: .01 });
  videos.forEach(video => observer.observe(video));
}

function activateReveal() {
  const nodes = qsa('.event-card:not([data-reveal-bound]), .reveal:not([data-reveal-bound])');
  nodes.forEach(node => { node.dataset.revealBound = 'true'; });
  if (typeof IntersectionObserver === 'undefined') {
    nodes.forEach(node => node.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '70px 0px' });
  nodes.forEach(node => observer.observe(node));
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
    qs('#heroMedia').innerHTML = motionMarkup({ slug:'111atl', title:'111ATL' }, { fill:true });
    return;
  }
  const next = dated[0];
  qs('#nextTitle').textContent = next.event.title;
  qs('#nextDate').textContent = next.event.date_label;
  qs('#nextEventButton').dataset.event = next.event.slug;
  qs('#heroMedia').innerHTML = motionMarkup(next.event, { fill:true });
  updateCountdown(next.date);
  if (state.countdownTimer) clearInterval(state.countdownTimer);
  state.countdownTimer = setInterval(() => updateCountdown(next.date), 60000);
}

function updateCountdown(date) {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
  let diff = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(diff / 86400000); diff -= days * 86400000;
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000;
  const minutes = Math.floor(diff / 60000); diff -= minutes * 60000;
  const seconds = Math.floor(diff / 1000);
  qs('#countdown').innerHTML = [['DAYS',days],['HRS',hours],['MIN',minutes],['SEC',seconds]]
    .map(([label,value]) => `<div><b>${String(value).padStart(2,'0')}</b><small>${label}</small></div>`).join('');
}

function openEvent(slug, changeRoute = true) {
  const event = state.events.find(item => item.slug === slug);
  if (!event) return;
  qs('#dialogSeries').textContent = event.series;
  qs('#dialogTitle').textContent = event.title;
  qs('#dialogDate').textContent = event.date_label;
  qs('#dialogLocation').textContent = event.location_text;
  qs('#dialogDescription').textContent = event.description;
  qs('#dialogVisual').innerHTML = motionMarkup(event);
  activateMotion(qs('#dialogVisual'));
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
  if (changeRoute && location.pathname !== `/events/${event.slug}`) history.pushState({ event:event.slug }, '', `/events/${event.slug}`);
}

function closeEventDialog(updateRoute = true) {
  if (eventDialog.open) eventDialog.close();
  document.body.classList.remove('dialog-open');
  document.title = '111ATL — Atlanta Events';
  if (updateRoute && location.pathname.startsWith('/events/')) history.pushState({}, '', '/');
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
      method:'POST',
      headers:{ apikey:SUPABASE_KEY, 'Content-Type':'application/json', Prefer:'return=minimal' },
      body:JSON.stringify({ event_slug:eventSlug || null, email, source:'111atl.com', consent:true })
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
function dateFromISO(value) { const [y,m,d] = value.split('-').map(Number); return new Date(y,m-1,d); }
function escapeHtml(value) { return String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;'); }
function escapeAttr(value) { return escapeHtml(value).replaceAll('`','&#096;'); }

siteHeader && window.addEventListener('scroll', () => siteHeader.classList.toggle('scrolled', window.scrollY > 20), { passive:true });
document.addEventListener('click', event => {
  const eventButton = event.target.closest('[data-event]');
  if (eventButton) { openEvent(eventButton.dataset.event); return; }
  const notifyButton = event.target.closest('[data-event-notify]');
  if (notifyButton) { openList(notifyButton.dataset.eventNotify); return; }
  if (event.target.closest('[data-open-list]')) { openList(); }
});
qs('#dialogClose')?.addEventListener('click', () => closeEventDialog());
qs('#listDialogClose')?.addEventListener('click', closeListDialog);
eventDialog?.addEventListener('click', event => { if (event.target === eventDialog) closeEventDialog(); });
listDialog?.addEventListener('click', event => { if (event.target === listDialog) closeListDialog(); });
qs('#mainSignup')?.addEventListener('submit', event => { event.preventDefault(); submitLead(event.currentTarget, qs('#mainFormMessage')); });
qs('#eventSignup')?.addEventListener('submit', event => { event.preventDefault(); submitLead(event.currentTarget, qs('#eventFormMessage'), state.selectedEventSlug); });
window.addEventListener('popstate', () => {
  const match = location.pathname.match(/^\/events\/([^/]+)\/?$/);
  if (match) openEvent(decodeURIComponent(match[1]), false); else closeEventDialog(false);
});
window.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (listDialog?.open) closeListDialog(); else if (eventDialog?.open) closeEventDialog();
});

loadEvents();