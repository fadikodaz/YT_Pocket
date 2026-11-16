// Renders every page once at startup from lib/content.js and the templates in
// views/. Text is always HTML-escaped; the only markup allowed inside content
// is [text](/internal-path) links, **bold** and `code`.
//
// Each platform group is a mini-site (see GROUPS in lib/content.js): the
// header menu, footer and related tools only show that group's pages, and the
// other groups appear as "Partner tools".
const fs = require('fs');
const path = require('path');
const { TOOLS, DOCS, GROUPS, BRANDS, FEATURES } = require('./content');

const VIEWS = path.join(__dirname, '..', 'views');

const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

// Escape, then: [text](/path) internal links, **bold**, `code`.
const inline = (s) =>
  esc(s)
    .replace(/\[([^\]]+)\]\((\/[a-z0-9\-/#]*)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');

// Same text without markup (for structured data).
const plain = (s) =>
  String(s ?? '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');

const icon = (id, cls = 'ic') => `<svg class="${cls}" aria-hidden="true"><use href="/icons.svg#${id}"/></svg>`;

const brandOf = (tool) => tool.brand || GROUPS.find((g) => g.id === tool.group)?.brand || 'youtube';

// ------------------------------------------------------------ mini-sites --

const groupOf = (page) => GROUPS.find((g) => g.id === page.group) || GROUPS[0];
const toolsOf = (g) => TOOLS.filter((t) => t.group === g.id);
const homeOf = (g) => toolsOf(g)[0].path;

// Partner link: its own domain when SITE_URL_<ID> is set, else its main page here.
function partnerHref(g) {
  const url = process.env[`SITE_URL_${g.id.toUpperCase()}`];
  return url && /^https:\/\/[^\s"<>]+$/.test(url) ? url : homeOf(g);
}
const partners = (g) => GROUPS.filter((o) => o.id !== g.id);

function sticker(brand, format = '', small = false) {
  const b = BRANDS[brand];
  // Brand colour via a class (brand-*), not a style attribute: the strict
  // CSP blocks inline styles.
  return `<span class="sticker brand-${brand}${small ? ' sm' : ''}" title="${esc(b.name)}">${icon(`b-${brand}`)}${
    format ? `<span class="fmt">${esc(format)}</span>` : ''
  }</span>`;
}

// ----------------------------------------------------------------- header --

function menuItem(tool, current) {
  const cur = tool.path === current ? ' aria-current="page"' : '';
  return `<li><a href="${tool.path}"${cur}>${sticker(brandOf(tool), '', true)}<span><b>${esc(tool.nav)}</b><small>${esc(
    tool.note
  )}</small></span></a></li>`;
}

function partnerItem(g) {
  const ext = /^https:/.test(partnerHref(g));
  return `<li><a href="${esc(partnerHref(g))}"${ext ? ' rel="noopener"' : ''}>${
    g.brand ? sticker(g.brand, '', true) : `<span class="sticker sm brand-more">${icon('i-dots-three')}</span>`
  }<span><b>${esc(g.partner)}</b></span></a></li>`;
}

function header(page) {
  const g = groupOf(page);
  const current = page.path;
  const tools = toolsOf(g);
  const links = tools
    .filter((t) => t.menu !== false)
    .map((t) => `<a href="${t.path}"${t.path === current ? ' aria-current="page"' : ''}>${esc(t.nav)}</a>`)
    .join('');

  return `<header class="topbar">
      <a class="brand" href="${homeOf(g)}">
        <span class="logo">${icon('i-download-simple')}</span>
        YTPocket
      </a>
      <nav class="menu" aria-label="${esc(g.label)} tools">${links}</nav>
      <div class="topbar-end">
        <p class="status" id="health" role="status" hidden></p>
        <button class="icon-btn" id="themeBtn" type="button" aria-label="Switch to dark mode" aria-pressed="false">
          <svg class="ic" aria-hidden="true"><use id="themeIcon" href="/icons.svg#i-moon"/></svg>
        </button>
        <button class="icon-btn menu-btn" id="menuBtn" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">
          ${icon('i-list')}
        </button>
      </div>
    </header>
    <div class="drawer" id="drawer" hidden>
      <div class="drawer-backdrop" data-close></div>
      <div class="drawer-panel" role="dialog" aria-modal="true" aria-label="Menu">
        <div class="drawer-head">
          <a class="brand" href="${homeOf(g)}"><span class="logo">${icon('i-download-simple')}</span>YTPocket</a>
          <button class="icon-btn" type="button" data-close aria-label="Close menu">${icon('i-x')}</button>
        </div>
        <nav aria-label="Menu">
          <p class="drawer-label">${esc(g.label === 'More' ? 'Tools' : `${g.label} tools`)}</p>
          <ul>${tools.map((t) => menuItem(t, current)).join('')}</ul>
          <p class="drawer-label">Partner tools</p>
          <ul>${partners(g).map(partnerItem).join('')}</ul>
        </nav>
      </div>
    </div>`;
}

// ------------------------------------------------------------ breadcrumbs --
// [mini-site home] > this page. Returns { html, items } (items feed the
// BreadcrumbList structured data). The YouTube site's home is "/".

function crumbTrail(page) {
  const g = groupOf(page);
  const home = toolsOf(g)[0];
  const items = [{ name: home.path === '/' ? 'Home' : home.crumb, path: home.path }];
  if (page.path !== home.path) items.push({ name: page.crumb || page.h1, path: page.path });
  return items;
}

function crumbs(page) {
  const items = crumbTrail(page);
  if (items.length < 2) return { html: '', items };
  const html = `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items
    .map((i, n) =>
      n === items.length - 1
        ? `<li><span aria-current="page">${esc(i.name)}</span></li>`
        : `<li><a href="${i.path}">${esc(i.name)}</a>${icon('i-caret-right', 'ic sep')}</li>`
    )
    .join('')}</ol></nav>`;
  return { html, items };
}

// ------------------------------------------------------------ sister tabs --
// Phones only (the header menu shows the same links on wide screens).

function sisterTabs(page) {
  if (page.group === 'more') return '';
  const tools = TOOLS.filter((t) => t.group === page.group);
  if (tools.length < 2) return '';
  return `<nav class="sisters" aria-label="${esc(groupOf(page).label)} tools"><ul>${tools
    .map((t) => `<li><a href="${t.path}"${t.path === page.path ? ' aria-current="page"' : ''}>${esc(t.short)}</a></li>`)
    .join('')}</ul></nav>`;
}

// ------------------------------------------------------------------ hero --

function proof(page) {
  if (!page.proof) return '';
  return `<ul class="proof">${page.proof.map((p) => `<li>${icon('i-check')}${esc(p)}</li>`).join('')}</ul>`;
}

// Example card beside the tool: a real, free-to-share video (Blender open
// movies) with its real sizes. Its shape matches what the page saves: wide
// video, music cover, tall phone video or just the image. "Try this example"
// opens the page with ?url=, which loads it like a pasted link.

// Decorative waveform for the music card (fixed, so pages stay identical).
function musicWave() {
  let bars = '';
  for (let x = 0; x < 200; x += 5) {
    const h = 4 + 9 * Math.abs(Math.sin(x * 0.17) * Math.cos(x * 0.04));
    bars += `<rect class="${x < 70 ? 'played' : ''}" x="${x}" y="${(13 - h).toFixed(1)}" width="3" height="${(h * 2).toFixed(1)}" rx="1.5"/>`;
  }
  return `<svg class="ex-wave" viewBox="0 0 200 26" preserveAspectRatio="none" aria-hidden="true">${bars}</svg>`;
}

function example(page) {
  const e = page.example;
  if (!e) return '';
  const brand = brandOf(page);
  const img = (cls) =>
    `<div class="ex-media ${cls}"><img src="/examples/${esc(e.img)}" alt="" width="${cls === 'tall' ? 405 : cls === 'square' ? 600 : 960}" height="${cls === 'tall' ? 720 : cls === 'square' ? 600 : 540}" loading="lazy" decoding="async" />`;
  const mark = `<span class="ex-mark brand-${brand}">${icon(`b-${brand}`)}</span>`;
  const head = `<p class="ex-title">${esc(e.title)}</p><p class="ex-by">${esc(e.by)}</p>`;
  const rows = (e.rows || []).length
    ? `<ul class="ex-rows">${e.rows
        .map(
          ([name, size]) =>
            `<li><b>${esc(name)}</b><span>${esc(size)}</span><span class="ex-dl">${icon('i-download-simple')}</span></li>`
        )
        .join('')}</ul>`
    : '';
  const tryIt = `<a class="ex-try" href="${page.path}?url=${encodeURIComponent(e.url)}">${icon('i-arrow-up')}Try this example</a>`;
  const open = (cls) =>
    `<aside class="ex box ex-${cls}" aria-label="Example: ${esc(e.title)}"><p class="ex-tag">Example</p>`;

  if (e.kind === 'music') {
    return `${open('music')}
        <div class="ex-head">${img('square')}${mark}</div>
          <div>${head}<p class="ex-tags"><span>Title</span><span>Artist</span><span>Cover art</span></p></div></div>
        <div class="ex-player" aria-hidden="true"><span class="ex-play">${icon('i-play')}</span>${musicWave()}<small>${esc(e.duration)}</small></div>
        ${rows}${tryIt}
      </aside>`;
  }
  if (e.kind === 'tall') {
    return `${open('tall')}
        ${img('tall')}<span class="ex-chip tl">${esc(e.duration)}</span><span class="ex-caption">${esc(e.caption)}</span></div>
        <div>${head}${rows}${tryIt}</div>
      </aside>`;
  }
  if (e.kind === 'thumb') {
    return `${open('thumb')}
        ${img('wide')}</div>
        <div class="ex-thumb-meta"><p class="ex-title">${esc(e.title)}</p><span class="ex-size">${esc(e.size)}</span></div>
        ${tryIt}
      </aside>`;
  }
  return `${open('wide')}
        ${img('wide')}<span class="ex-chip br">${esc(e.duration)}</span>${mark}</div>
        ${head}${rows}${tryIt}
      </aside>`;
}

// ------------------------------------------------------- step "pictures" --
// Small copies of the real interface (decorative: aria-hidden; the step text
// says the same thing). Used by pages without SEO sections yet.

function stagePhone(brand) {
  return `<div class="stage" aria-hidden="true">
            <div class="m-phone">
              <div class="m-video brand-${brand}">${icon(`b-${brand}`)}</div>
              <div class="m-share">
                <div class="hit"><i>${icon('i-link-simple')}</i>Copy link${icon('i-hand-pointing', 'ic hand')}</div>
                <div><i>${icon('i-share-network')}</i>Share</div>
                <div><i>${icon('i-dots-three')}</i>More</div>
              </div>
            </div>
          </div>`;
}

function stagePaste(link, cta) {
  return `<div class="stage" aria-hidden="true">
            <span class="m-pasted">${icon('i-clipboard-text')}Pasted</span>
            <div class="m-intake"><div class="m-field">${icon('i-link-simple')}<span>${esc(link)}</span></div><div class="m-cta">${esc(
              cta
            )}</div></div>
            ${icon('i-hand-pointing', 'ic hand hand-cta')}
          </div>`;
}

function stageFinal(kind, brand) {
  if (kind === 'thumbnail') {
    return `<div class="stage" aria-hidden="true">
            <div class="m-thumb">
              <div class="m-thumb-img brand-${brand}">${icon(`b-${brand}`)}<span>1280×720</span></div>
              <span class="m-pill">${icon('i-image')}Save thumbnail</span>
            </div>
            ${icon('i-hand-pointing', 'ic hand hand-pill')}
          </div>`;
  }
  const audio = kind === 'audio';
  const rows = audio
    ? `<div class="m-row busy"><div class="t">MP3 192 kbps<small>Preparing, 64%</small></div><div class="c">64%</div></div>
               <div class="m-row"><div class="t">MP3 128 kbps<small>About 9.7 MB</small></div><div class="c">${icon(
                 'i-download-simple'
               )}</div></div>`
    : `<div class="m-row"><div class="t">1080p HD<small>Saved</small></div><div class="c done">${icon('i-check')}</div></div>
               <div class="m-row"><div class="t">720p HD<small>About 42 MB</small></div><div class="c">${icon(
                 'i-download-simple'
               )}</div></div>`;
  return `<div class="stage" aria-hidden="true">
            <div class="m-sheet">
              <div class="m-tabs"><span${audio ? '' : ' class="on"'}>Video MP4</span><span${audio ? ' class="on"' : ''}>Audio MP3</span></div>
              ${rows}
            </div>
          </div>`;
}

function steps(page) {
  const s = page.steps;
  const titles = ['Copy the link', 'Paste it here', s.final === 'thumbnail' ? 'Save it' : 'Pick a quality'];
  const stages = [stagePhone(s.brand), stagePaste(s.link, page.cta), stageFinal(s.final, s.brand)];
  return `<section class="box sec" aria-labelledby="stepsTitle">
        <h2 id="stepsTitle">${esc(page.stepsTitle)}</h2>
        <ol class="steps">${stages
          .map(
            (stage, i) => `<li class="step">
          ${stage}
          <div class="step-text"><h3><span class="num">${i + 1}</span>${esc(titles[i])}</h3><p>${esc(s.texts[i])}</p></div>
        </li>`
          )
          .join('')}</ol>
      </section>`;
}

// -------------------------------------------------- classic sections --

function intro(page) {
  return `<section class="box sec prose" aria-labelledby="introTitle">
        <h2 id="introTitle">${esc(page.introTitle)}</h2>
        ${page.intro.map((p) => `<p>${inline(p)}</p>`).join('\n        ')}
      </section>`;
}

function features(page) {
  return `<section class="box sec" aria-labelledby="featTitle">
        <h2 id="featTitle">What you get</h2>
        <ul class="feats">${FEATURES[page.features]
          .map(
            ([ic, tone, t, d]) =>
              `<li class="feat"><span class="tile tone-${tone}">${icon(`d-${ic}`)}</span><span class="feat-text"><b>${esc(
                t
              )}</b><span class="feat-desc">${esc(d)}</span></span></li>`
          )
          .join('')}</ul>
      </section>`;
}

function faq(page) {
  const item = (f) => `<details>
          <summary><span>${esc(f.q)}</span><span class="faq-icon">${icon('i-plus', 'ic plus')}${icon('i-minus', 'ic minus')}</span></summary>
          <p>${inline(f.a)}</p>
        </details>`;
  // SEO pages: two columns on wide screens.
  if (page.sections) {
    const half = Math.ceil(page.faq.length / 2);
    return `<section class="box sec faq" id="faq" aria-labelledby="faqTitle">
        <h2 id="faqTitle">Questions and answers</h2>
        <div class="faq-cols"><div>${page.faq.slice(0, half).map(item).join('')}</div><div>${page.faq
          .slice(half)
          .map(item)
          .join('')}</div></div>
      </section>`;
  }
  return `<section class="box sec faq" aria-labelledby="faqTitle">
        <h2 id="faqTitle">Questions and answers</h2>
        ${page.faq.map(item).join('\n        ')}
      </section>`;
}

// ------------------------------------------------------ SEO sections --

const secOpen = (s, cls = '') =>
  `<section class="box sec${cls ? ` ${cls}` : ''}" id="${s.id}" aria-labelledby="${s.id}-title">
        <h2 id="${s.id}-title">${esc(s.title)}</h2>`;
const paras = (text) =>
  (Array.isArray(text) ? text : [text])
    .filter(Boolean)
    .map((p) => `<p class="sec-lead">${inline(p)}</p>`)
    .join('');

// Four columns split by thin lines (no boxes inside the box).
function devicesSec(s) {
  return `${secOpen(s, 'prose')}
        ${paras(s.text)}
        <ul class="devices">${s.items
          .map(
            (d) => `<li class="dev">
          <h3>${icon(`i-${d.icon}`)}${esc(d.name)}</h3>
          <ol>${d.steps.map((st) => `<li>${inline(st)}</li>`).join('')}</ol>
          <p class="dev-where">${icon('i-download-simple')}${esc(d.where)}</p>
        </li>`
          )
          .join('')}</ul>
      </section>`;
}

// Sizes scale with length, so bar widths are fixed: sqrt keeps small ones visible.
const fmtMB = (mb) =>
  mb >= 1000
    ? `${(mb / 1000).toFixed(1)} GB`
    : mb >= 10
      ? `${Math.round(mb)} MB`
      : `${mb.toFixed(1).replace(/\.0$/, '')} MB`;
const fmtLen = (min) => (min < 60 ? `${min} min` : `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ''}`);

function sizesSec(s) {
  const top = Math.max(...s.rows.map((r) => r[2]));
  const inputId = `${s.id}-len`;
  return `${secOpen(s, 'calc')}
        ${paras(s.text)}
        <div class="len">
          <label for="${inputId}">Video length</label>
          <input type="range" id="${inputId}" min="1" max="${s.max}" step="1" value="${s.minutes}" data-len />
          <output for="${inputId}" class="len-val" data-len-out>${fmtLen(s.minutes)}</output>
        </div>
        <ul class="bars">${s.rows
          .map(([label, note, rate, best]) => {
            const w = Math.max(5, Math.round((Math.sqrt(rate / top) * 100) / 5) * 5);
            return `<li class="bar${best ? ' best' : ''}"><span class="bar-name"><b>${esc(label)}</b><small>${esc(
              note
            )}</small></span><span class="track"><span class="fill w-${w}"></span></span><span class="mb" data-rate="${rate}">≈ ${fmtMB(
              rate * s.minutes
            )}</span></li>`;
          })
          .join('')}</ul>
        <p class="foot-note">${inline(s.note)}</p>
      </section>`;
}

// A drawn sound wave: detail up to a cut-off, flat after it (decorative).
function waveSvg(cut, tone) {
  let d = 'M0 20';
  for (let x = 0; x <= 300; x += 3) {
    const amp = x < cut ? 6 + 12 * Math.abs(Math.sin(x * 0.21) * Math.cos(x * 0.05)) : 1.5;
    d += ` L${x} ${(20 + (x % 6 ? amp : -amp)).toFixed(1)}`;
  }
  return `<svg class="wave-svg" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true"><rect class="wave-bg" width="300" height="40" rx="8"/><path class="wave-${tone}" d="${d}"/><line class="wave-cut" x1="${cut}" y1="2" x2="${cut}" y2="38"/></svg>`;
}

function explainSec(s) {
  const opts = `<ul class="choices${s.wave ? '' : ' wide'}">${s.options
    .map(
      ([name, sub, best]) => `<li class="choice${best ? ' best' : ''}"><b>${esc(name)}</b><span>${esc(sub)}</span></li>`
    )
    .join('')}</ul>`;
  if (!s.wave) return `${secOpen(s, 'prose')}${paras(s.text)}${opts}</section>`;
  return `<section class="box sec prose" id="${s.id}" aria-labelledby="${s.id}-title">
        <div class="two">
          <div>
            <h2 id="${s.id}-title">${esc(s.title)}</h2>
            ${paras(s.text)}
            ${opts}
          </div>
          <figure class="wave">
            ${s.wave.lanes
              .map(
                ([label, sub, tone]) =>
                  `<div class="lane"><p><b>${esc(label)}</b><small>${esc(sub)}</small></p>${waveSvg(210, tone)}</div>`
              )
              .join('')}
            <figcaption>${esc(s.wave.caption)}</figcaption>
          </figure>
        </div>
      </section>`;
}

function tableSec(s) {
  return `${secOpen(s, 'prose')}
        ${paras(s.text)}
        <div class="tbl-wrap"><table class="tbl">
          <thead><tr>${s.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
          <tbody>${s.rows
            .map(
              (r, i) =>
                `<tr${i === s.best ? ' class="best"' : ''}>${r
                  .map((c, j) => (j === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`))
                  .join('')}</tr>`
            )
            .join('')}</tbody>
        </table></div>
        ${s.note ? `<p class="foot-note">${inline(s.note)}</p>` : ''}
      </section>`;
}

function linksSec(s) {
  const [before, id, after] = s.demo;
  return `${secOpen(s, 'prose')}
        ${paras(s.text)}
        <p class="addr" aria-label="Example link">${icon('i-lock-simple')}<span>${esc(before)}<mark>${esc(id)}</mark></span><small>${icon(
          'i-arrow-up',
          'ic up'
        )}${esc(after)}</small></p>
        <div class="link-lists">
          <div><h3>These work</h3><ul class="ok">${s.ok.map((l) => `<li>${icon('i-check')}<span>${inline(l)}</span></li>`).join('')}</ul></div>
          <div><h3>These don’t</h3><ul class="no">${s.no.map((l) => `<li>${icon('i-x')}<span>${inline(l)}</span></li>`).join('')}</ul></div>
        </div>
      </section>`;
}

function fixesSec(s) {
  return `${secOpen(s, 'prose')}
        ${paras(s.text)}
        <ul class="fixes">${s.items
          .map(
            ([msg, fix]) =>
              `<li><span class="fix-ic" aria-hidden="true">!</span><b>${esc(msg)}</b><p>${inline(fix)}</p></li>`
          )
          .join('')}</ul>
      </section>`;
}

function trustSec(s) {
  return `${secOpen(s, 'prose')}
        ${paras(s.text)}
        <ul class="nots">${s.nots.map((n) => `<li>${icon('i-prohibit')}${esc(n)}</li>`).join('')}</ul>
        <p class="allowed">${inline(s.legal)}</p>
      </section>`;
}

const SECTION = {
  devices: devicesSec,
  sizes: sizesSec,
  explain: explainSec,
  table: tableSec,
  links: linksSec,
  fixes: fixesSec,
  trust: trustSec,
};

function content(page) {
  if (!page.sections) return [intro(page), steps(page), features(page), faq(page)].join('\n      ');
  return [...page.sections.map((s) => SECTION[s.type](s)), faq(page)].join('\n      ');
}

// ---------------------------------------------------------- related tools --

function related(page) {
  const g = groupOf(page);
  let tools = toolsOf(g).filter((t) => t.path !== page.path);
  if (!tools.length) tools = TOOLS.filter((t) => t.path !== page.path).slice(0, 4);
  return `<section class="related" aria-labelledby="moreTitle">
        <h2 id="moreTitle">${esc(g.id === 'more' ? 'More tools' : `More ${g.label} tools`)}</h2>
        <ul class="tools">${tools
          .map(
            (t) =>
              `<li><a class="tool" href="${t.path}">${sticker(brandOf(t), t.card.format)}<span class="tool-text"><b>${esc(
                t.card.label
              )}</b><span>${esc(t.card.note)}</span></span><span class="go">${icon('i-arrow-up-right')}</span></a></li>`
          )
          .join('')}</ul>
      </section>`;
}

// ----------------------------------------------------------------- footer --

function footer(page) {
  const g = groupOf(page);
  const col = (title, brand, links, cls = '') =>
    `<div class="fcol${cls}"><p class="fhead">${brand ? icon(`b-${brand}`) : icon('i-download-simple')}${esc(title)}</p><ul>${links
      .map(([p, l, ext]) => `<li><a href="${esc(p)}"${ext ? ' rel="noopener"' : ''}>${esc(l)}</a></li>`)
      .join('')}</ul></div>`;
  return `<footer class="site-foot">
      <div class="foot-inner">
        <div class="fcols">
          <div class="fcol about">
            <a class="brand" href="${homeOf(g)}"><span class="logo">${icon('i-download-simple')}</span>YTPocket</a>
            <p>${esc(g.about)} No sign-up, no app.</p>
          </div>
          ${col(
            g.id === 'more' ? 'Tools' : `${g.label} tools`,
            g.brand,
            toolsOf(g).map((t) => [t.path, t.nav])
          )}
          ${col(
            'YTPocket',
            null,
            DOCS.map((d) => [d.path, d.nav])
          )}
          ${col(
            'Partner tools',
            null,
            partners(g).map((o) => [partnerHref(o), o.partner, /^https:/.test(partnerHref(o))]),
            ' partners'
          )}
        </div>
        <p class="fine">© 2026 YTPocket. Not affiliated with ${esc(g.owners)}. Only download videos you have the right to.</p>
      </div>
    </footer>`;
}

// --------------------------------------------------------- structured data --

function jsonld(page, trail) {
  const graph = [];
  if (trail.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: trail.map((i, n) => ({
        '@type': 'ListItem',
        position: n + 1,
        name: i.name,
        item: `{{origin}}${i.path}`,
      })),
    });
  }
  if (page.faq) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: page.faq.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: plain(f.a) },
      })),
    });
  }
  if (!graph.length) return '';
  // A data block, not a script that runs (allowed by the strict CSP). "<" is
  // escaped so text can never close the tag.
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c');
  return `<script type="application/ld+json">${json}</script>`;
}

// ----------------------------------------------------------------- render --

function fill(template, values, blocks) {
  return template
    .replace(/<!--[\s\S]*?-->\n/, '') // the template's own comment
    .replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => blocks[k] ?? '')
    .replace(/\{\{(\w+)\}\}/g, (m, k) => (k === 'origin' ? m : k in values ? esc(values[k]) : ''));
}

function renderTool(template, page) {
  const { html: crumbHtml, items } = crumbs(page);
  return fill(
    template,
    {
      lang: 'en',
      path: page.path,
      title: page.title,
      description: page.description,
      h1: page.h1,
      lead: page.lead,
      pasteHint: page.pasteHint,
      cta: page.cta,
      tab: page.tab,
      platform: BRANDS[brandOf(page)].name,
      heroClass: page.example ? `hero-row has-example ex-is-${page.example.kind}` : 'hero-row',
      only: page.only || '',
      altPath: page.alt?.path || '',
      altLabel: page.alt?.label || '',
    },
    {
      robots: page.noindex ? '<meta name="robots" content="noindex" />' : '',
      header: header(page),
      crumbs: crumbHtml,
      tabs: sisterTabs(page),
      terms: 'By using YTPocket you accept the <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.',
      proof: proof(page),
      example: example(page),
      content: content(page),
      related: related(page),
      footer: footer(page),
      jsonld: page.noindex ? '' : jsonld(page, items),
    }
  );
}

function renderDoc(template, doc) {
  const site = { path: doc.path, group: 'youtube' };
  const items = [
    { name: 'Home', path: '/' },
    { name: doc.h1, path: doc.path },
  ];
  const crumbHtml = `<nav class="crumbs" aria-label="Breadcrumb"><ol><li><a href="/">Home</a>${icon(
    'i-caret-right',
    'ic sep'
  )}</li><li><span aria-current="page">${esc(doc.h1)}</span></li></ol></nav>`;
  const body = doc.sections
    .map(([h, ps]) => `${h ? `<h2>${esc(h)}</h2>` : ''}${ps.map((p) => `<p>${inline(p)}</p>`).join('')}`)
    .join('\n        ');
  return fill(
    template,
    { lang: 'en', path: doc.path, title: doc.title, description: doc.description, h1: doc.h1 },
    { header: header(site), crumbs: crumbHtml, body, footer: footer(site), jsonld: jsonld({}, items) }
  );
}

const NOT_FOUND = {
  ...TOOLS[0],
  path: '/404',
  noindex: true,
  title: 'Page not found | YTPocket',
  description: 'This page does not exist.',
  h1: 'This page doesn’t exist',
  lead: 'But the downloader works right here: paste a video link below.',
  example: null,
  only: '',
  alt: null,
  sections: null,
  intro: ['The page you were looking for isn’t here. Paste a YouTube link above, or pick a tool below.'],
  introTitle: 'Lost?',
  steps: {
    brand: 'youtube',
    link: 'youtu.be/aqz-KE-bpKQ',
    final: 'video',
    texts: [
      'In YouTube, tap Share, then Copy link.',
      'Paste the link in the box above and tap Get video.',
      'Pick a quality. The video saves to your device by itself.',
    ],
  },
  stepsTitle: 'How to download a YouTube video',
  features: 'video',
};

function buildPages() {
  const toolTpl = fs.readFileSync(path.join(VIEWS, 'page.html'), 'utf8');
  const docTpl = fs.readFileSync(path.join(VIEWS, 'doc.html'), 'utf8');
  const pages = new Map();
  for (const t of TOOLS) pages.set(t.path, renderTool(toolTpl, t));
  for (const d of DOCS) pages.set(d.path, renderDoc(docTpl, d));
  return {
    pages,
    notFound: renderTool(toolTpl, NOT_FOUND).replace(`href="{{origin}}/404"`, 'href="{{origin}}/"'),
    list: [...TOOLS, ...DOCS].map((p) => ({ path: p.path })),
  };
}

// Main page for a site name from ytdlp.normalizeInput ("TikTok" ->
// "/tiktok-downloader"): the first tool page of that platform.
function pageForSite(siteName) {
  const brand = Object.keys(BRANDS).find((b) => BRANDS[b].name === siteName);
  return TOOLS.find((t) => brandOf(t) === brand)?.path || '/';
}

module.exports = { buildPages, pageForSite, TOOLS, DOCS };
