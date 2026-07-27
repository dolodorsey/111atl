// Current-status build lock v4.1
import fs from 'node:fs';

const replaceAll = (source, replacements, label) => {
  let output = source;
  for (const [from, to] of replacements) {
    if (!output.includes(from)) {
      console.warn(`[111ATL patch] Missing ${label} source: ${from.slice(0, 80)}`);
      continue;
    }
    output = output.replaceAll(from, to);
  }
  return output;
};

const indexPath = 'public/index.html';
let html = fs.readFileSync(indexPath, 'utf8');
html = replaceAll(html, [
  ['<title>111ATL | Atlanta Events, Brands, Forms & Access</title>', '<title>111ATL | Rose on Piedmont, GROWN-ISH, Brands & Access</title>'],
  ["111ATL is Atlanta's public access hub for current events, RSVPs, VIP bookings, official brands, products, applications, partnerships, and Dr. Dorsey's Hakuna Matata book.", "111ATL is the current public gateway for Rose on Piedmont weekly programming, GROWN-ISH, Taste of Art, Dr. Dorsey, The Kollective ENT., products, partnerships, and Hakuna Matata."],
  ['Current events, direct forms, official Atlanta-facing brands, products, and experiences in one place.', 'This week at Rose on Piedmont, current Atlanta-facing brands, direct forms, products, partnerships, and Hakuna Matata.'],
  ['/styles.css?v=4', '/styles.css?v=5'],
  ['>Current Events<', '>Weekly Schedule<'],
  ["Atlanta's public culture gateway", "Rose on Piedmont weekly programming + Atlanta access"],
  ['Current events, direct RSVPs, official brands, products, applications, partnerships, and experiences—organized in one place.', 'This week at Rose on Piedmont, GROWN-ISH Fridays, Taste of Art, current companies, products, applications, partnerships, and Hakuna Matata—organized in one place.'],
  ['>See Current Events<', '>See This Week<'],
  ['<span>Upcoming events</span>', '<span>Weekly experiences</span>'],
  ['<b>Go Out</b><small>Events, RSVP, VIP</small>', '<b>This Week</b><small>Rose, Taste of Art, GROWN-ISH</small>'],
  ['<strong>ATLANTA</strong><small>Loading current event…</small>', '<strong>ROSE</strong><small>Loading this week…</small>'],
  ['<span class="panel-label">Live calendar</span><h3>Current events loading</h3><p>Only active and upcoming events appear.</p>', '<span class="panel-label">Current weekly schedule</span><h3>Rose programming loading</h3><p>Archived themes and inactive events stay off the site.</p>'],
  ['<p class="eyebrow dark-eyebrow">Current calendar</p><h2>No expired flyers.<br><em>Only the next move.</em></h2>', '<p class="eyebrow dark-eyebrow">This week at Rose on Piedmont</p><h2>Current programming.<br><em>No archived themes.</em></h2>'],
  ['The feed is connected to the live 111ATL calendar. Past dates disappear automatically, and each event routes into the correct RSVP or VIP lane.', 'The live schedule now reflects R&amp;B Tuesdays, W.C.W., Throwback Thursdays, Taste of Art, GROWN-ISH Fridays, and Sunset Saturdays. Inactive concepts are removed.'],
  ['<h2>Atlanta-facing brands.<br><em>Correct destinations.</em></h2>', '<h2>Current companies.<br><em>Current priorities.</em></h2>'],
  ['Verified PNG logos are used where they exist. Brands without a confirmed transparent PNG use a clean text treatment instead of a wrong or low-quality file.', 'Every company remains separate, with its own identity, destination, and inquiry path. Only the public-facing companies currently relevant to 111ATL appear here.'],
  ['/script.js?v=4', '/script.js?v=5']
], 'HTML');
fs.writeFileSync(indexPath, html);

const scriptPath = 'public/script.js';
let js = fs.readFileSync(scriptPath, 'utf8');
js = replaceAll(js, [
  ["    background: `${ASSET_BASE}pulse_university/04_social_posts/POSTED_UP_CAMPUS_CITY_GRUNGE.png`,\n", ''],
  ["    description: 'Atlanta hospitality, nightlife, patio culture, private events, and weekly experiences.',\n    background: `${ASSET_BASE}social-dashboard/2026-07-17/dolodorsey/rose-bar-her-night-jcole.png`,", "    description: 'Current weekly home of R&B Tuesdays, W.C.W., Throwback Thursdays, Taste of Art, GROWN-ISH, and Sunset Saturdays.',"],
  ["    description: 'Atlanta Friday nightlife built around grown energy, music, birthdays, and premium tables.',\n    background: `${ASSET_BASE}email-newsletters/grownish-jcole-afterparty-0717-corrected.png`,", "    description: 'Friday nightlife at Rose on Piedmont from 11PM–3AM, built around grown energy, birthdays, and premium tables.',"],
  ["    background: `${ASSET_BASE}bodega/hakuna-matata/stack-of-books.png`,\n", ''],
  ['<span class="panel-label">Live calendar</span>', '<span class="panel-label">Current weekly schedule</span>']
], 'JavaScript');

for (const banned of ['San Tropez', 'Miu Miu’s After Dark', 'grownish-jcole', 'rose-bar-her-night-jcole', 'pulse_university/04_social_posts/POSTED_UP_CAMPUS_CITY_GRUNGE.png']) {
  if (html.includes(banned) || js.includes(banned)) {
    throw new Error(`Archived 111ATL content remained after patch: ${banned}`);
  }
}

fs.writeFileSync(scriptPath, js);
console.log('111ATL current-status patch applied.');
