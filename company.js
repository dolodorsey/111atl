const ASSET='https://dzlmtvodpyhetvektfuo.supabase.co/storage/v1/object/public/brand-graphics/';
const API='https://doctordorsey.com/api/enterprise/brand/';

const aliases={
  'fraternity':'the-fraternity',
  'casper-group':'the-casper-group',
  'umbrella-group':'the-umbrella-group',
  'mind-studio':'the-mind-studio',
  'nation':'the-sovereign-nation',
  'the-nation':'the-sovereign-nation',
  'tribe':'the-tribe-memphis',
  'the-tribe':'the-tribe-memphis',
  'maga':'make-atlanta-great-again',
  'playmakers-sports':'playmakers-sports-association'
};

const fallbacks={
  'the-fraternity':{name:'The Fraternity',eyebrow:'Culture · Entertainment · Global Influence',cover:`${ASSET}dr_dorsey/website/penthouse-skyline.jpg`,about:'A selective, multicultural organization of DJs, cultural architects, entertainment leaders, and global power players.',actions:[['Enterprise Inquiry','https://thekollectivehospitality.com/forms/inquiry?brand=the-fraternity'],['Request NDA','/nda.html']]},
  'the-casper-group':{name:'The Casper Group',eyebrow:'Quick-Service Food Portfolio',cover:`${ASSET}casper_group/logos/logo-full.png`,about:'A portfolio of independent food brands designed for delivery, food halls, licensing, packaged expansion, and multi-location growth.',actions:[['Food & Licensing Inquiry','https://thekollectivehospitality.com/forms/group_pricing'],['Enterprise Inquiry','https://thekollectivehospitality.com/forms/inquiry?brand=casper-group']]},
  'the-umbrella-group':{name:'The Umbrella Group',eyebrow:'Services · One Request, Correct Routing',cover:`${ASSET}good-times-app/umbrella_group/umbrella_group_landscape.png`,about:'A unified services network spanning auto, realty, injury support, wellness, cleaning, branding, automation, people services, travel, and accounting.',actions:[['Start a Service Request','https://thekollectivehospitality.com/forms/inquiry?brand=umbrella-group'],['View All Access','https://thekollectivehospitality.com/access']]},
  'rose-on-piedmont':{name:'Rose on Piedmont',eyebrow:'Atlanta Hospitality · Weekly Programming',cover:`${ASSET}social-dashboard/2026-07-17/dolodorsey/rose-bar-free-hookah.png`,about:'A hospitality and nightlife destination for weekly programming, private celebrations, patio energy, tables, birthdays, art, and current Atlanta experiences.',actions:[['See Current Schedule','/#events'],['Reserve / Birthday','https://111atl.com/forms/table_reservation?brand=rose-on-piedmont']]},
  'grown-ish':{name:'GROWN-ISH',eyebrow:'Friday Nightlife · Rose on Piedmont',cover:`${ASSET}grownish/03_event_flyers/GROWNISH_COMING_SOON.png`,about:'A Friday nightlife experience built around grown energy, birthdays, premium tables, music, and direct access through 111ATL.',actions:[['Current Schedule','/#events'],['Reserve Friday','https://111atl.com/forms/rsvp?brand=grown-ish']]},
  'sole-exchange':{name:'Sole Exchange',eyebrow:'Community · Sneaker Impact',cover:`${ASSET}email-newsletters/sole-exchange-flyer-v3-air-force-1.png`,about:'A year-round community platform centered on sneaker culture, collection, restoration, redistribution, youth access, and measurable impact.',actions:[['Support / Volunteer','https://111atl.com/forms/volunteer?brand=sole-exchange'],['Visit Website','https://soleexchangeworldwide.com']]},
  'taste-of-art':{name:'Taste of Art',eyebrow:'Art · Food · Music · Cultural Experience',cover:`${ASSET}taste_of_art/03_event_flyers/TASTE_ROSE_BAR_0717_v4.png`,about:'An art-forward cultural experience merging visual art, hospitality, music, live programming, creative commerce, and community discovery.',actions:[['Visit Website','https://thatasteofart.com'],['Artist / Vendor Inquiry','https://111atl.com/forms/vendor?brand=taste-of-art']]},
  'pulse':{name:'PULSE',eyebrow:'Athletic · Golf · Lounge · Lifestyle',cover:`${ASSET}pulse/pulse_landing_v1/021_pulse_3d_logo_stage.jpg`,about:'An athletic and lifestyle brand designed around motion, signal, social energy, golf, elevated basics, and everyday uniforms.',actions:[['Visit PULSE','https://yourpulsehq.com'],['Influencer / Partner','https://111atl.com/forms/influencer?brand=pulse']]},
  'the-mind-studio':{name:'The Mind Studio',eyebrow:'Virtual + In-Home Wellness Access',cover:`${ASSET}mind_studio/gt_card_mind_studio.png`,about:'A modern mental-wellness platform providing accessible virtual and in-home support, therapy navigation, and care coordination.',actions:[['Visit Website','https://themindstudioworldwide.com'],['Request Support','https://111atl.com/forms/consultation?brand=mind-studio']]},
  'scented-flowers':{name:'Scented Flowers',eyebrow:'Museum Series · Memory · Culture · Legacy',cover:`${ASSET}dr_dorsey/website/garden-district.jpg`,about:'A museum and luxury-gifting series built to preserve moments, honor people, and give them their flowers while they are here.',actions:[['Museum / Venue Inquiry','https://thekollectivehospitality.com/forms/inquiry?brand=scented-flowers'],['Sponsor an Experience','https://thekollectivehospitality.com/forms/sponsor?brand=scented-flowers']]}
};

const esc=(value='')=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
const safeUrl=(value='')=>{try{const url=new URL(value,location.origin);return ['http:','https:'].includes(url.protocol)?url.href:''}catch{return ''}};
const destinationUrl=(item={})=>safeUrl(item.web_url||item.universal_link||item.fallback_url||item.internal_path||'');

function renderFallback(slug){
  const c=fallbacks[slug]||fallbacks['the-casper-group'];
  document.title=`${c.name} | 111ATL`;
  document.querySelector('#companyPage').innerHTML=`<section class="company-detail"><div class="company-cover"><img src="${esc(c.cover)}" alt="${esc(c.name)}"></div><div class="company-copy"><p class="section-kicker">${esc(c.eyebrow)}</p><h1>${esc(c.name)}</h1><p>${esc(c.about)}</p><div class="intro-actions">${c.actions.map((a,i)=>`<a class="button ${i?'outline':'gold'}" href="${esc(a[1])}">${esc(a[0])}</a>`).join('')}</div></div></section>`;
}

function resourceLabel(type='resource'){
  return ({deck:'View Deck',investor_deck:'Investor Deck',magazine:'Read Magazine',magazine_feature:'Read Feature',blueprint:'View Blueprint',form:'Open Form',timeline:'View Timeline',campaign_plan:'View Plan'}[type]||'Open Resource');
}

function renderBrand(brand){
  document.title=`${brand.name} | 111ATL`;
  const sections=Array.isArray(brand.sections)?brand.sections:[];
  const resources=Array.isArray(brand.resources)?brand.resources.filter(r=>safeUrl(r.public_url)):[];
  const destinations=Array.isArray(brand.destinations)?brand.destinations.filter(d=>destinationUrl(d)):[];
  const lead=sections[0];
  const cover=brand.hero_url||lead?.media_url||`${ASSET}dr_dorsey/website/luxury-venue.jpg`;
  const about=lead?.body||brand.long_description||brand.short_description||'Current official brand information is being organized.';
  const actions=destinations.slice(0,3);
  const social=brand.public_social&&typeof brand.public_social==='object'?Object.entries(brand.public_social).filter(([,v])=>v):[];

  document.querySelector('#companyPage').innerHTML=`
    <section class="company-detail">
      <div class="company-cover"><img src="${esc(cover)}" alt="${esc(brand.name)}"></div>
      <div class="company-copy">
        <p class="section-kicker">${esc(brand.status_label||brand.status||brand.category||'The Kollective')}</p>
        ${brand.logo_url?`<img class="company-logo" src="${esc(brand.logo_url)}" alt="${esc(brand.name)} logo">`:''}
        <h1>${esc(brand.name)}</h1>
        <p>${esc(about)}</p>
        <div class="intro-actions">${actions.map((a,i)=>`<a class="button ${i?'outline':'gold'}" href="${esc(destinationUrl(a))}">${esc(a.action_label||'Open')}</a>`).join('')}</div>
        ${social.length?`<div class="company-social">${social.map(([network,value])=>`<span><b>${esc(network)}</b>${esc(value)}</span>`).join('')}</div>`:''}
      </div>
    </section>
    ${sections.length?`<section class="brand-profile"><header><p class="section-kicker">Official brand profile</p><h2>Everything connected to ${esc(brand.name)}.</h2></header><div class="brand-section-grid">${sections.map((section,index)=>`<article class="brand-section-card">${section.media_url?`<div class="brand-section-media"><img src="${esc(section.media_url)}" alt=""></div>`:''}<div class="brand-section-copy"><small>${String(index+1).padStart(2,'0')}</small><h3>${esc(section.title)}</h3>${section.body?`<p>${esc(section.body)}</p>`:''}${Array.isArray(section.bullets)&&section.bullets.length?`<ul>${section.bullets.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}${safeUrl(section.cta_url)?`<a href="${esc(section.cta_url)}">${esc(section.cta_label||'Open')} ↗</a>`:''}</div></article>`).join('')}</div></section>`:''}
    ${resources.length?`<section class="brand-resources"><header><p class="section-kicker dark">Approved public resources</p><h2>Decks, magazines, forms, and official material.</h2></header><div class="resource-grid">${resources.map(resource=>`<a href="${esc(resource.public_url)}" target="_blank" rel="noopener"><small>${esc(resource.resource_type||'resource')}</small><h3>${esc(resource.title)}</h3><p>${esc(resource.summary||'Official approved brand resource.')}</p><b>${esc(resourceLabel(resource.resource_type))} ↗</b></a>`).join('')}</div></section>`:''}
    <section class="brand-source-note"><p>Public information is supplied by the managed Kollective brand registry. Internal operating files, credentials, investor documents, applicant data, and restricted legal material are not exposed here.</p></section>`;
}

async function init(){
  const requested=new URLSearchParams(location.search).get('brand')||'the-casper-group';
  const slug=aliases[requested]||requested;
  try{
    const response=await fetch(`${API}${encodeURIComponent(slug)}`,{headers:{Accept:'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error(`Brand API ${response.status}`);
    const payload=await response.json();
    if(!payload.brand)throw new Error('Missing brand');
    renderBrand(payload.brand);
  }catch(error){
    console.error('111ATL brand hub error',error);
    renderFallback(slug);
  }
}

init();
