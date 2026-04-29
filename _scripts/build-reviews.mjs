// Builds the testimonials section markup for index.html from a Google reviews list.
// Re-run this any time you want to add/edit reviews.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const indexPath = path.join(projectRoot, 'index.html');

// truncated=true means the source review ended with "...View full review" — we keep
// the visible text and add "..." rather than fabricating the rest.
// Service tag is optional; falls back to "Verified Google review".
const reviews = [
  // ---- Truncated (will get a "…" suffix) ----
  { name: 'Jonathan Mayo', text: 'We have hired Yard Dog a handful of times now and are always blown away by their knowledge, professionalism and care.', truncated: true, service: 'Repeat client' },
  { name: 'Larry Wade Gardner', text: 'As a new customer to Yard Dog Lawn Service, we have been very pleased with their work. As a senior couple we utilize', truncated: true, service: 'Lawn maintenance' },
  { name: 'Andrea Wheatley', text: 'These guys do a great job. They are in and out quickly, and the yard always look great. They respond quickly to text', truncated: true, service: 'Lawn maintenance' },
  { name: 'Kathy Ritter', text: 'Very polite and accommodating young men! If you ask for other things done in your yards, they will take care of it, and', truncated: true },
  { name: 'Larkin Turner', text: 'I rented a bobcat with an auger to drill holes for a fence. Communication, pricing, delivery service, everything was', truncated: true, service: 'Equipment rental' },
  { name: 'Terra Beswick', text: "I couldn't be happier with my lawn service! Moving into a new home is stressful enough, but a crazy lawn, a million", truncated: true, service: 'Lawn maintenance' },
  { name: 'Karen Wiersig', text: 'We are so thrilled with our Christmas Light installation this holiday season. Yard Dog Lawn & Lights has done an', truncated: true, service: 'Christmas lights' },
  { name: 'Whitney', text: 'Yard Dog Lawn & Lights did an amazing job hanging our Christmas lights! They actually showed up two days earlier than', truncated: true, service: 'Christmas lights' },
  { name: 'Edith Hirth', text: "Yard Dog Lawn Service have proven to provide top quality service. They're very dependable, reliable, and polite", truncated: true, service: 'Lawn maintenance' },
  { name: 'Alicia Ogee', text: 'I am so happy with my new yard service. They are reliable, easy to talk to and', truncated: true, service: 'Lawn maintenance' },
  { name: 'Fernando Gutierrez', text: "I couldn't be happier with the work done on my flower bed! Yard Dog Lawn & Lights were professional, hardworking, and", truncated: true, service: 'Landscaping' },
  { name: 'Becky McCurdy', text: "Yard Dog Lawn care has done an amazing job on my Mom's yard! Miller is always so kind and replies back quickly for", truncated: true },
  { name: 'Ron Boyett', text: 'I contacted Yard Dog Lawn & Lights on a Monday about giving be a quote for a landscaping project in our yard. Within', truncated: true, service: 'Landscaping' },
  { name: 'Rick Higginbotham', text: 'Miller Maines and crew have been terrific. They have been able to work us in to their schedule…sometimes on short', truncated: true, service: 'Lawn maintenance' },
  { name: 'Treyben Letlow', text: 'Yard dog was very responsive, showed up when they said they would, did the work when they scheduled to do the work, had', truncated: true },
  { name: 'Bailee Ash', text: "I've used this service before it was purchased by who owns it now, but I'm not upset over how it's running now! The", truncated: true, service: 'Lawn maintenance' },

  // ---- Full text reviews ----
  { name: 'tony martens', text: 'Give them a call. Great service, great job. Completed quickly. Yard Dog will be my first call.' },
  { name: 'Betty Watkins', text: 'Miller does awesome work!' },
  { name: 'Joel Rainer', text: 'Very professional. Listened to my instructions.' },
  { name: 'Lori "Lulu" Royer', text: 'Yard Dog "guys" are always pleasant, prompt and quick to come back if they miss a spot. I\'ve used them for over a year and a half and have recommended them highly!' },
  { name: 'Cody Speak', text: 'They did a good job.' },
  { name: 'Ashley Riley', text: 'Miller and the 2 young gentleman that did work at my home today were great! Each of them had great manners, respect and worked extremely hard to get the job done. I look forward to using them again in the near future.' },
  { name: 'B. S.', text: "These guys do a terrific job. I've had Yard Dog for about a year at my home in Hallsville, and there's nothing they overlook. They take good care of cutting, trimming and clean up after. I highly recommend!", service: 'Hallsville · Lawn maintenance' },
  { name: 'Richard Boyd', text: 'Always wonderful. Great jobs, very unobtrusive, neat. Nice guys!' },
  { name: 'McCall Hawthorne', text: 'Always on time. Great communication. Care for our property!' },
  { name: 'Patti Glover', text: 'Very nice and courteous workers. They do an excellent job taking care of my yard.' },
  { name: 'Kay Berry', text: 'A really good crew. They work fast and are very thorough in everything they do. I definitely recommend them.' },
  { name: 'Phyllis Jolley', text: 'Always prompt & they do a nice job!!' },
  { name: 'Nikki Seimears Faircloth', text: 'The work requested was done very well, and he got to me the next business day.' },
  { name: 'Andrew Kufahl', text: 'Very knowledgeable in every aspect of lawn care!' },
  { name: 'Melissa Maines', text: 'The team does a great job on my yard.' },
  { name: 'Queen Kong', text: 'Thanks for the much needed lawn revival, Yard Dog! Your crew is professional, punctual, and consistent. Miller, Jacob and Alex are all-stars with an eye for detail.', service: 'Lawn treatment' },
  { name: 'Cade Carter', text: 'Miller and his guys crushed it 🤙🏻' },
  { name: "P-Nut Y'Barbo", text: 'Yard Dog did a great job removing all the leaves in our backyard. We will be using them every year going forward.', service: 'Leaf removal' },
  { name: 'Cathy Hartley', text: 'They have been doing my yard for way over a year. Fantastic job everytime. I highly recommend them!' },
  { name: 'Debbie Schroeder', text: 'My yard looks so good. Thank you!' },
  { name: 'Christi Rankin', text: 'Love Yard Dog Lawn and Lights! They always do a fabulous job and keep my yard looking great!' },
  { name: 'Clint Boggio', text: 'This group is punctual and thorough. They did a great job on my lawn and I am for sure going to contact with them during the spring and summer months to come.' },
  { name: 'Renee Johnson', text: 'Looks great' },
  { name: 'David Dusek', text: 'Yard Dog did a great job cleaning up my backyard full of leaves and pine needles. Saved my back an entire day of raking. And for a reasonable price, too!', service: 'Leaf removal' },
  { name: 'L. Griggs', text: 'Amazing job on our yard! We have tons of trees and I was skeptical at how many leaves they could actually get up but NOW, our yard looks like there was never 1 leaf in it. Thank you, Yard Dog!!', service: 'Leaf removal' },
  { name: 'Joe Murphy', text: 'Jacob and Chris did a great job removing leaves and trimming the crepe myrtles. I wish that I could afford them on a regular basis.', service: 'Leaf removal · Tree trimming' },
  { name: 'Laura Odom', text: 'Very good service and very polite!' },
  { name: 'Jacob Palmer', text: 'Guys did a wonderful job, very clean and neat. Them doing a great job for my elderly neighbor is also very appreciated.' },
  { name: 'Robert Leal', text: 'Really good guys, was on time, very professional, and we will be using his business anytime we need to. Thank you guys 👍' },
  { name: 'John Frazier', text: 'Professional and courteous. The price for the job was reasonable and was better than others I had checked with.' },
  { name: 'S. Log', text: 'Miller was responsive and quick to set a date and install our Christmas lights. The price was outstanding compared to all other quotes. Nice guys to chat with as well. Ours were installed today.', service: 'Christmas lights' },
  { name: 'Tommy', text: 'I use Yard Dog for all of my lawn care needs. The guys on the crew are always professional and courteous. Would definitely recommend to everyone!' },
  { name: 'Aaron Combs', text: 'Very fast to respond, showed up quickly and did a great job, all lights are nice and straight.', service: 'Christmas lights' },
  { name: 'Luke Bueno', text: 'So happy with the Christmas lights that Miller and Chris hung for us last week. They always make it easy and provide exceptional service. Thanks guys!', service: 'Christmas lights' },
  { name: 'Tommie D.', text: 'Did a great job and showed up as scheduled.' },
  { name: 'Mila Breitenberg', text: 'Miller and his team of workers did a great job!' },
  { name: 'Ken Bedsole', text: "Yard Dog's crews arrive when scheduled and complete the job professionally." },
  { name: 'Kaylie Reeves', text: 'Very professional, easy to work with, and do a great job!' },
  { name: 'Anna Dear', text: "These guys did a great job. They were even sweet and brought my trash can up to the house. Glad we switched to Yard Dog. We'd recommend them to anyone in the White Oak area!", service: 'White Oak · Lawn maintenance' },
  { name: 'Katelyn Van Zandt', text: 'Absolutely love! Very professional, efficient, and affordable! Would definitely recommend!' },
  { name: 'Kaitlin Fields', text: 'They were awesome, and were able to get our drainage issue fixed ASAP before it started storming again. Miller was so kind and helpful as well!', service: 'Drainage' },
  { name: 'David Snow', text: 'Yard Dog Lawn & Lights has been great for us and are quick to address any issues.' },
  { name: 'Cody Sheperd', text: 'Very professional and friendly crew. They did great work.' },
  { name: 'S. B.', text: 'Miller and his crew are wonderful. Our yard has never looked better. We have full green grass now. They are always professional and we highly recommend their services.', service: 'Lawn treatment' },
  { name: 'Donna Stockton', text: 'Awesome experience with these guys!' },
  { name: 'Donna Stockton', text: 'What a great group! My yard looks great and they have helped with everything from new sod to the flowerbeds. Would highly recommend.', service: 'Sod · Flowerbeds' },
  { name: 'Steven R.', text: 'Miller at Yard Dog Lawn and Lights knocked out my flower beds, looked great and did what he said. Definitely will hire them back.', service: 'Flowerbeds' },
  { name: 'Kim Harris', text: 'Always does a great job! Very professional!' },
  { name: 'Renee Loose', text: 'I called Yard Dog Lawn and Lights for a quote to mow yard. I received a quote in an hour and what the cost would be. I received a message on Thursday telling me my appointment was on Friday this week. This company I would recommend to anyone! They did such a great job I am truly impressed with how my yard looks. THANK YOU so much, Yard Dog.', service: 'Lawn mowing' },
  { name: 'Bart Tilton', text: 'Thank you for prompt, courteous service. You went above and beyond what we had asked of you. Thanks again.' },
  { name: 'Shelly Johnson', text: 'The crew did a great job. The grass was thick this week and they took extra time to mow it down evenly.' },
  { name: 'Hunter Malensek', text: 'Working with Yard Dog has been a great experience for our commercial property and I would highly recommend them!', service: 'Commercial property' },
  { name: 'Kathy Poynor', text: 'Miller & his crew are top notch. Polite, on time, & diligent professionals. He came recommended to help us re-sod a section of our backyard. He knows what he\'s talking about, & they did a great job. We highly recommend! Thanks, Miller!', service: 'Re-sod' },
  { name: 'Teri Hanes', text: "Great job done. Am going to continue using them bi-weekly. I recommend them if you're looking for great service!" },
  { name: 'Okoye Lawson', text: 'The team did a great job, our yard looks amazing!' },
  { name: 'Floyd Armstrong', text: 'Did an excellent job cleaning up my flower beds. Made the house look very good. Also, they did an excellent job cleaning up after themselves.', service: 'Flowerbeds' },
  { name: 'Travis Martin', text: 'Fantastic service, team has taken great care of our lawn. Always on time and respectful of the land. These guys go the extra mile.' },
  { name: 'Mason Williams', text: 'Did an excellent job for us.' },
  { name: 'Becky Reaves', text: 'Absolutely fantastic!!' },
  { name: 'Amanda B.', text: 'Very professional and would highly recommend!' },
  { name: 'Benjamin Watson', text: 'Have had Yard Dog for a few seasons now. Been very pleased with all the services they offer.' },
  { name: 'Shelly Smith', text: 'I have used Yard Dog at home. They are always reliable and do great work. I highly recommend them for anyone needing yard service or event lights!' },
  { name: 'Melissa Adams', text: 'Miller did a wonderful job! He was quick and thorough, I would recommend Yard Dog highly!' },
  { name: 'Jennifer Newland', text: "We've been using Miller for over a year now. Reliable, punctual, and he does a great job." },
  { name: 'Johnathan Flores', text: "Miller was mowing the neighbor's yard and we were in need of a new lawn care company. He was kind, professional and mowed our yard quickly and it looks great! Thank you!", service: 'Lawn mowing' },
  { name: 'Penny Behan', text: 'Does a great job. Shows up on time. Prices are good. Very friendly. I highly recommend this service.' },
  { name: 'Bianca Johnson', text: 'Driving up my driveway and seeing my home restored to the way it should look made my heart happy and put a smile on my face! Terrific work!', service: 'Landscaping' },
  { name: 'Jason Rumsey', text: 'We absolutely love this company. They have done a wonderful job for us.' },
  { name: 'Sam Davidson', text: 'Awesome service. They have been doing our yard for years now. Highly recommend!' },
  { name: 'Sally Smith', text: 'Yard Dog always does a great job for us! We always know when to expect him and he\'s always good about doing any extras we might need from time to time! We highly recommend him!!' },
  { name: 'Robert Hill', text: 'Been using him for 5 years and always does an amazing job.' },
  { name: 'Brenda L.', text: "Fast and friendly service. We've used them for quite some time." },
  { name: 'Christopher Edmiaston', text: 'Yard Dog: competitive pricing, always on schedule, and great looking jobs.' },
  { name: 'Brandon', text: 'Great service and affordable!' },
  { name: 'Staci Barham', text: "I recently hired Miller to clear out my ditch area, and I couldn't be more impressed with the results. From start to finish, the service was professional and efficient. They cleared the area quickly, removing overgrowth, debris, and ensuring proper drainage. The attention to detail was excellent, and they made sure to leave the space neat and tidy. Not only did they complete the job within the estimated time frame, but they also communicated with me throughout the process to ensure everything met my expectations. The ditch now looks great, and I can already tell it's going to function much better. Overall, highly recommend Miller for any type of lawn care!", service: 'Drainage' },
];

// Color palette for initials avatars — rotates through brand-aligned colors
const avatarColors = [
  { bg: '#21501E', fg: '#F4EFE2' }, // ydg-green-d / cream
  { bg: '#4A7C2F', fg: '#F4EFE2' }, // green-primary
  { bg: '#0F1A0E', fg: '#F4EFE2' }, // night
  { bg: '#C8B89A', fg: '#0F1A0E' }, // tan / dark
  { bg: '#E8B53A', fg: '#0F1A0E' }, // star yellow / dark
  { bg: '#6AAA3A', fg: '#0F1A0E' }, // green-light
];

function escapeHTML(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function initialsOf(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Auto-categorize a review by content keywords. Used when r.service isn't set
// explicitly. Falls back to "Lawn maintenance" since that's the most common
// service Yard Dog provides.
function detectService(text, name) {
  const t = (text || '').toLowerCase();
  // Christmas-specific phrasing only — "lights" alone is ambiguous (could be event lights)
  if (/\bchristmas|holiday|holidays\b/.test(t)) return 'Christmas lights';
  if (/\bleaf|leaves\b/.test(t)) return 'Leaf removal';
  if (/\bditch|drain(age)?|french drain\b/.test(t)) return 'Drainage';
  // Landscape / transformation language — must come before Lawn checks so
  // "yard transformed / home restored / refreshed" goes to Landscaping
  if (/\bflower ?bed|flowerbed|planting|mulch|landscape design|landscaping project|transform(ed)?|restored\b|yard makeover|full yard|backyard makeover\b/.test(t)) return 'Landscaping';
  if (/\bsod\b/.test(t)) return 'Sod install';
  if (/\bpatio|paver|hardscape|retaining wall|flagstone|stacked stone\b/.test(t)) return 'Hardscaping';
  if (/\bbobcat|auger|skid steer\b/.test(t)) return 'Equipment rental';
  if (/\btree|trim(ming)?|crepe myrtle|prune\b/.test(t)) return 'Tree & shrub care';
  if (/\bcommercial property|business property|restaurant\b/.test(t)) return 'Commercial property';
  // Require the actual phrase "event light(s)" rather than the bare word "event"
  if (/\bevent (?:light|lighting)\b/.test(t)) return 'Event lighting';
  // Fertilization / lawn-treatment cues
  if (/\blawn revival|fertili[sz]|aeration|weed control|green lawn|lush lawn|full green grass\b/.test(t)) return 'Lawn treatment';
  if (/\bmow|mowing|edging\b/.test(t)) return 'Lawn mowing';
  return 'Lawn maintenance';
}

function reviewCard(r, idx, ariaHidden = false) {
  const initials = escapeHTML(initialsOf(r.name));
  const palette = avatarColors[idx % avatarColors.length];
  const bg = palette.bg;
  const fg = palette.fg;
  const txt = r.truncated ? r.text.replace(/[\.…]+$/, '') + '…' : r.text;
  // Always show "Service · Verified Google review" per brand pattern
  const service = r.service || detectService(r.text, r.name);
  const subtitle = `${service} · Verified Google review`;
  const label = ariaHidden ? '' : ' aria-label="5 out of 5 stars"';
  const hidden = ariaHidden ? ' aria-hidden="true"' : '';

  return `<article class="t-card p-7"${hidden}>
    <div class="flex text-base leading-none" style="color:#E8B53A;letter-spacing:0.04em;"${label}>★★★★★</div>
    <p class="text-ydg-ink/85 lede mt-3">"${escapeHTML(txt)}"</p>
    <div class="flex items-center gap-3 mt-5">
      <span class="h-10 w-10 rounded-full ring-1 ring-black/5 flex items-center justify-center text-sm font-semibold" style="background:${bg};color:${fg};letter-spacing:0.02em;">${initials}</span>
      <div class="flex flex-col">
        <span class="font-medium text-ydg-ink leading-5 tracking-tight">${escapeHTML(r.name)}</span>
        <span class="text-xs text-ydg-ink/60 leading-5">${escapeHTML(subtitle)}</span>
      </div>
    </div>
  </article>`;
}

// Round-robin distribute reviews across N columns so every column has variety
function distribute(items, cols) {
  const buckets = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => buckets[i % cols].push(item));
  return buckets;
}

const NUM_COLS = 3;
const columns = distribute(reviews, NUM_COLS);
const durations = ['72s', '92s', '82s']; // staggered so columns don't sync up

// Build markup
const colMarkup = columns.map((col, ci) => {
  const visible = col.map((r, i) => reviewCard(r, ci * 100 + i, false)).join('\n          ');
  // Duplicate set for seamless loop
  const dup = col.map((r, i) => reviewCard(r, ci * 100 + i, true)).join('\n          ');

  // First column visible at all viewport sizes; others gated by md/lg
  const colVisibility = ci === 0 ? '' : ci === 1 ? ' hidden md:block' : ' hidden lg:block';

  return `      <div class="t-col${colVisibility} w-full max-w-xs">
        <div class="t-track flex flex-col gap-6 pb-6" style="--t-duration: ${durations[ci]};">
          ${visible}

          <!-- duplicate set for seamless loop -->
          ${dup}
        </div>
      </div>`;
}).join('\n\n');

const newSection = `<!-- ================= REVIEWS (auto-scrolling columns) ================= -->
<section id="reviews" class="relative py-24 lg:py-32 bg-white overflow-hidden">
  <!-- subtle radial wash -->
  <div class="pointer-events-none absolute inset-0 opacity-60"
       style="background:
         radial-gradient(900px 500px at 12% 0%, rgba(74,142,69,0.08), transparent 60%),
         radial-gradient(900px 500px at 88% 100%, rgba(217,199,154,0.18), transparent 60%);">
  </div>

  <div class="relative max-w-7xl mx-auto px-6 lg:px-10">
    <!-- Header -->
    <div class="flex flex-col items-center justify-center max-w-2xl mx-auto text-center">
      <span class="chip-light">Testimonials</span>
      <h2 class="font-display h-display text-ydg-ink text-5xl sm:text-6xl lg:text-7xl mt-5">
        What our <span class="text-ydg-green">neighbors</span> say.
      </h2>
      <p class="lede mt-5 text-ydg-ink/65 max-w-md">
        100+ five-star Google reviews from East Texans who let us treat their yard like our own.
      </p>
      <div class="flex items-center gap-2 mt-5">
        <div class="flex text-base" style="color:#E8B53A;letter-spacing:0.04em;">★★★★★</div>
        <span class="text-ydg-ink/70 text-sm">5.0 average · Google Reviews</span>
      </div>
    </div>

    <!-- Three scrolling columns auto-built from _scripts/build-reviews.mjs -->
    <div class="t-mask flex justify-center gap-6 mt-14 max-h-[740px] overflow-hidden">

${colMarkup}

    </div>
  </div>
</section>`;

// Replace the existing reviews section in index.html
const html = fs.readFileSync(indexPath, 'utf8');

const startMarker = '<!-- ================= REVIEWS (auto-scrolling columns) ================= -->';
const endMarker = '<!-- ================= CTA / CONTACT ================= -->';

const startIdx = html.indexOf(startMarker);
const endIdx = html.indexOf(endMarker);
if (startIdx < 0 || endIdx < 0 || endIdx <= startIdx) {
  console.error('Could not locate review section markers in index.html');
  process.exit(1);
}

const before = html.slice(0, startIdx);
const after = html.slice(endIdx);
const out = before + newSection + '\n\n' + after;

fs.writeFileSync(indexPath, out);
console.log(`Wrote ${reviews.length} reviews into ${indexPath}`);
console.log(`  Truncated entries (consider pasting full text from your Google dashboard):`);
reviews.filter(r => r.truncated).forEach(r => console.log(`    - ${r.name}`));
