// Builds the company profile PDFs, one per language, from the site's own data:
//
//   npm run profile
//
// writes public/greentree-company-profile.pdf (English) and
// public/greentree-company-profile-vi.pdf (Vietnamese). The pages are HTML
// (8 A4 pages, Georgia + Arial), printed by headless Chrome or Edge; set
// CHROME to the browser's path if it isn't found. PDF-only wording is in
// copy.mjs; services, process, work, stats and contact details come from src/.

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer } from 'vite'
import { copy } from './copy.mjs'

const root = fileURLToPath(new URL('../..', import.meta.url))
const pub = path.join(root, 'public')
const asset = (p) => pathToFileURL(path.join(pub, p)).href

// ---- the site's data -------------------------------------------------------

const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const load = (p) => vite.ssrLoadModule(p)
const [{ servicesByLang }, { processStepsByLang }, { workProjectsByLang }, { statsByLang }, { CONTACT }] =
  await Promise.all([
    load('/src/data/services.ts'),
    load('/src/data/process.ts'),
    load('/src/data/work.ts'),
    load('/src/data/stats.ts'),
    load('/src/config/site.ts'),
  ])
await vite.close()

// ---- helpers ---------------------------------------------------------------

const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])
const TOTAL = 8
const num = (n) => `${String(n).padStart(2, '0')} / ${String(TOTAL).padStart(2, '0')}`
const logo = (cls = '') => `<img class="logo ${cls}" alt="" />`
const eyebrow = (text) => `<p class="eyebrow"><span>—</span>${esc(text)}</p>`
const footer = (n, dark) => `
  <footer class="foot">
    <span class="foot-brand">${logo(dark ? 'logo-light' : '')}Green Tree Agency</span>
    <span>${num(n)}</span>
  </footer>`
/** "+65% Direct Bookings" → ["+65%", "Direct Bookings"] */
const splitHighlight = (h) => {
  const [value, ...rest] = h.split(' ')
  return [value, rest.join(' ')]
}
const rings = (n, r0, step, cls) =>
  Array.from({ length: n }, (_, i) => `<circle r="${r0 + i * step}" class="${cls}" />`).join('')

// ---- pages -----------------------------------------------------------------

function pages(lang) {
  const t = copy[lang]
  const services = servicesByLang[lang]
  const steps = processStepsByLang[lang]
  const work = workProjectsByLang[lang]
  const stats = statsByLang[lang]

  const cover = `
  <section class="page dark cover">
    <svg class="cover-rings" viewBox="-400 -400 800 800" aria-hidden="true">
      ${rings(12, 56, 26, 'ring')}<circle r="21" class="ring-core" />
    </svg>
    <header class="brand">${logo('logo-light logo-lg')}<span>Green Tree Agency</span></header>
    <div class="cover-body">
      <p class="eyebrow lichen">${esc(t.profile)}</p>
      <h1 class="display">${esc(t.cover[0])}<br />${esc(t.cover[1])}</h1>
      <p class="display italic lichen">${esc(t.cover[2])}</p>
      <hr class="short" />
      <p class="label">${esc(t.studio)}</p>
    </div>
    <footer class="foot foot-cover">
      <span>${esc(t.place)}</span>
      <span class="small">Ground / Root / Engage / Elevate / Nurture</span>
    </footer>
  </section>`

  const about = `
  <section class="page light">
    ${eyebrow(t.aboutEyebrow)}
    <h2 class="title">${esc(t.aboutTitle[0])}<br />${esc(t.aboutTitle[1])}</h2>
    <p class="title-sub italic moss">${esc(t.aboutTitle[2])}</p>
    <div class="about">
      <div class="about-text">
        <p class="lead">${esc(t.aboutStatement)}</p>
        <p>${esc(t.aboutLede)}</p>
      </div>
      <figure class="about-photo">
        <img src="${asset('images/about-studio-collab.jpg')}" alt="" />
        <figcaption>${esc(t.aboutBadge)}</figcaption>
      </figure>
    </div>
    <hr />
    <p class="eyebrow moss plain">${esc(t.showUp)}</p>
    <div class="values">
      ${t.values.map(([h, d]) => `<div><h3>${esc(h)}</h3><p>${esc(d)}</p></div>`).join('')}
    </div>
    <blockquote class="quote">${esc(t.quote[0])}<em>${esc(t.quote[1])}</em>${esc(t.quote[2])}</blockquote>
    ${footer(2)}
  </section>`

  const card = (s, i) => `
    <article class="card card-${i}">
      <img src="${asset(s.image.slice(1))}" alt="" />
      <div class="card-body">
        <p class="eyebrow moss plain">${s.num} / ${esc(s.kicker)}</p>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.desc)}</p>
        <ul>${s.tags.map((tag) => `<li>${esc(tag)}</li>`).join('')}</ul>
      </div>
    </article>`

  const servicesA = `
  <section class="page dark">
    ${eyebrow(t.servicesEyebrow)}
    <h2 class="title">${esc(t.servicesTitleA[0])}</h2>
    <p class="title-sub italic lichen tight">${esc(t.servicesTitleA[1])}</p>
    <p class="lede">${esc(t.servicesLedeA)}</p>
    <div class="cards">${services.slice(0, 3).map(card).join('')}</div>
    ${footer(3, true)}
  </section>`

  const row = (s) => `
    <article class="service-row">
      <img src="${asset(s.image.slice(1))}" alt="" />
      <div>
        <p class="eyebrow moss plain">${s.num} / ${esc(s.kicker)}</p>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.desc)}</p>
        <p class="tags">${s.tags.map(esc).join('<span>/</span>')}</p>
      </div>
    </article>`

  const servicesB = `
  <section class="page light">
    ${eyebrow(t.servicesEyebrow)}
    <h2 class="title">${esc(t.servicesTitleB[0])}</h2>
    <p class="title-sub italic moss tight">${esc(t.servicesTitleB[1])}</p>
    <p class="lede">${esc(t.servicesLedeB)}</p>
    <hr />
    ${services.slice(3).map(row).join('<hr />')}
    <div class="band band-dark">
      <svg viewBox="-60 -60 120 120" aria-hidden="true">${rings(5, 10, 11, 'ring')}</svg>
      <div>
        <p class="eyebrow lichen plain">${esc(t.systemEyebrow)}</p>
        <p class="band-text">${esc(t.system)}</p>
      </div>
    </div>
    ${footer(4)}
  </section>`

  const process = `
  <section class="page canopy">
    ${eyebrow(t.processEyebrow)}
    <h2 class="title">${esc(t.processTitle[0])}</h2>
    <p class="title-sub italic lichen tight">${esc(t.processTitle[1])}</p>
    <p class="lede">${esc(t.processLede)}</p>
    <ol class="steps">
      ${steps
        .map(
          (s) => `
        <li>
          <span class="step-num">${esc(t.step)} ${s.num}</span>
          <span class="step-letter">${s.letter}</span>
          <span class="step-name">${esc(s.name)}${s.gloss ? `<small>${esc(s.gloss)}</small>` : ''}</span>
          <p>${esc(s.desc)}</p>
        </li>`,
        )
        .join('')}
    </ol>
    <p class="eyebrow lichen plain">${esc(t.commitmentEyebrow)}</p>
    <p class="band-text">${esc(t.commitment)}</p>
    ${footer(5, true)}
  </section>`

  const project = (p) => {
    const [hv, hl] = splitHighlight(p.highlight)
    return `
    <article class="project">
      <div class="project-logo"><img src="${asset(p.logo.slice(1))}" alt="" /></div>
      <div>
        <p class="eyebrow moss plain small">${esc(p.category)} / ${esc(p.channel)}</p>
        <h3>${esc(p.client)}</h3>
        <p class="project-sub">${esc(p.subtitle)}</p>
        <p class="project-desc">${esc(p.description)}</p>
        <dl class="kpis">
          ${[
            [p.stat1.value, p.stat1.label],
            [p.stat2.value, p.stat2.label],
            [hv, hl],
          ]
            .map(([v, l]) => `<div><dt>${esc(v)}</dt><dd>${esc(l)}</dd></div>`)
            .join('')}
        </dl>
      </div>
    </article>`
  }

  const workA = `
  <section class="page light">
    ${eyebrow(t.workEyebrow)}
    <h2 class="title">${esc(t.workTitleA)}</h2>
    <p class="lede">${esc(t.workLedeA)}</p>
    <div class="projects">${work.slice(0, 3).map(project).join('')}</div>
    ${footer(6)}
  </section>`

  const workB = `
  <section class="page light">
    ${eyebrow(t.workEyebrow)}
    <h2 class="title">${esc(t.workTitleB)}</h2>
    <p class="lede">${esc(t.workLedeB)}</p>
    <div class="projects">${work.slice(3).map(project).join('')}</div>
    <div class="band band-light">
      <p class="eyebrow moss plain">${esc(t.statsEyebrow)}</p>
      <dl class="stats">
        ${stats.map((s) => `<div><dt>${esc(s.value)}</dt><dd>${esc(s.label)}</dd><p>${esc(s.note)}</p></div>`).join('')}
      </dl>
    </div>
    ${footer(7)}
  </section>`

  const site = 'greentreevn.com'
  const contact = `
  <section class="page dark cover">
    <svg class="contact-rings" viewBox="-300 -300 600 600" aria-hidden="true">
      ${rings(9, 20, 13, 'ring')}${rings(6, 150, 26, 'ring faint')}
    </svg>
    <header class="brand">${logo('logo-light logo-lg')}<span>Green Tree Agency</span></header>
    <div class="contact-body">
      <p class="eyebrow lichen plain">${esc(t.contactEyebrow)}</p>
      <h2 class="display">${esc(t.contactTitle[0])}<br /><em class="lichen">${esc(t.contactTitle[1])}</em><br />${esc(t.contactTitle[2])}</h2>
      <p class="contact-lede">${esc(t.contactLede)}</p>
      <hr class="short wide" />
      <dl class="contact">
        <div><dt>${esc(t.email)}</dt><dd><a href="mailto:${CONTACT.email}">${CONTACT.email}</a></dd></div>
        <div><dt>${esc(t.hotline)}</dt><dd><a href="${CONTACT.phoneHref}">${CONTACT.phone}</a></dd></div>
        <div><dt>${esc(t.website)}</dt><dd><a href="https://${site}">${site}</a></dd></div>
      </dl>
    </div>
    <footer class="foot">
      <span class="foot-brand">${logo('logo-light')}${esc(t.studio)} / ${esc(t.place)}</span>
      <span>${num(8)}</span>
    </footer>
  </section>`

  return [cover, about, servicesA, servicesB, process, workA, workB, contact].join('\n')
}

// About copy lives in a React section on the site; these are the same words.
copy.en.aboutStatement =
  "We're a performance-led digital agency in Da Nang that grows brands the way trees grow — patiently, from the roots up."
copy.en.aboutLede =
  'Every campaign starts below the surface: understanding your audience, your market and what growth actually means for your business. Then we plant the right channels and tend them until they bear fruit.'
copy.en.aboutBadge = 'Da Nang Studio • Est. 2026'
copy.vi.aboutStatement =
  'Chúng tôi là agency digital tại Đà Nẵng, tập trung vào hiệu quả, nuôi lớn thương hiệu như cách một cái cây lớn lên — kiên nhẫn, từ gốc rễ.'
copy.vi.aboutLede =
  'Mọi chiến dịch đều bắt đầu từ bên dưới bề mặt: thấu hiểu khách hàng, thị trường và tăng trưởng thực sự có ý nghĩa gì với doanh nghiệp của bạn. Rồi chúng tôi gieo đúng kênh và chăm sóc cho đến khi đơm hoa kết trái.'
copy.vi.aboutBadge = 'Studio Đà Nẵng • Thành lập 2026'

// ---- print -----------------------------------------------------------------

const css = fs.readFileSync(new URL('./profile.css', import.meta.url), 'utf8')
// The logo, recoloured in the page before printing: lichen on dark pages,
// heartwood on light ones. Inlined, so the canvas can read it.
const logoUrl = `data:image/png;base64,${fs.readFileSync(path.join(pub, 'logo_image/gta-symbol-xanh-512.png')).toString('base64')}`
const tintLogos = `
const src = new Image()
src.onload = () => {
  const tint = (colour) => {
    const c = document.createElement('canvas')
    c.width = src.width
    c.height = src.height
    const x = c.getContext('2d')
    x.drawImage(src, 0, 0)
    x.globalCompositeOperation = 'source-in'
    x.fillStyle = colour
    x.fillRect(0, 0, c.width, c.height)
    return c.toDataURL()
  }
  const light = tint('#c9d8b0')
  const dark = tint('#16261f')
  for (const img of document.querySelectorAll('img.logo')) img.src = img.classList.contains('logo-light') ? light : dark
}
src.src = '${logoUrl}'`

const chrome =
  process.env.CHROME ||
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => fs.existsSync(p))
if (!chrome) throw new Error('No Chrome or Edge found: set CHROME to its path')

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'gt-profile-'))
const outputs = { en: 'greentree-company-profile.pdf', vi: 'greentree-company-profile-vi.pdf' }
for (const lang of ['en', 'vi']) {
  const html = `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8" />
<title>${esc(copy[lang].docTitle)}</title>
<style>${css}</style>
</head>
<body>
${pages(lang)}
<script>${tintLogos}</script>
</body>
</html>`
  const file = path.join(tmp, `profile-${lang}.html`)
  fs.writeFileSync(file, html)
  if (process.env.KEEP_HTML) fs.copyFileSync(file, path.join(process.env.KEEP_HTML, `profile-${lang}.html`))
  const out = path.join(pub, outputs[lang])
  execFileSync(chrome, [
    '--headless=new',
    `--user-data-dir=${path.join(tmp, 'chrome')}`,
    '--no-pdf-header-footer',
    '--virtual-time-budget=5000',
    `--print-to-pdf=${out}`,
    pathToFileURL(file).href,
  ], { stdio: 'ignore' })
  console.log(`${outputs[lang]}  ${(fs.statSync(out).size / 1024).toFixed(0)} KB`)
}
fs.rmSync(tmp, { recursive: true, force: true })
