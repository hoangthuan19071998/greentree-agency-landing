// POST /api/contact: the "Let's grow together" form, emailed to the studio
// through Resend (https://resend.com). A Vercel Function; in development the
// Vite dev server routes the same path here (see vite.config.ts).
//
// Environment:
//   RESEND_API_KEY  required in production; without it the email is only logged
//   CONTACT_TO      recipient (default contact@greentreevn.com)
//   CONTACT_FROM    sender on a domain verified in Resend
//                   (default "Green Tree website <website@greentreevn.com>")

const LIMITS = { name: 120, phone: 40, email: 200, message: 4000 }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Field = keyof typeof LIMITS

const json = (status: number, body: object) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return json(400, { error: 'invalid_json' })
  }

  // the honeypot: people never see it, bots fill it in. Pretend it worked.
  if (typeof body.website === 'string' && body.website.trim()) return json(200, { ok: true })

  const form = {} as Record<Field, string>
  for (const key of Object.keys(LIMITS) as Field[]) {
    const v = body[key]
    form[key] = typeof v === 'string' ? v.trim().slice(0, LIMITS[key]) : ''
  }
  if (!form.name || !form.message || !EMAIL.test(form.email)) {
    return json(422, { error: 'invalid_fields' })
  }
  const lang = body.lang === 'vi' ? 'vi' : 'en'

  const rows: [string, string][] = [
    ['Name', form.name],
    ['Email', form.email],
    ['Phone', form.phone || '—'],
    ['Language', lang],
  ]
  const email = {
    from: process.env.CONTACT_FROM || 'Green Tree website <website@greentreevn.com>',
    to: [process.env.CONTACT_TO || 'contact@greentreevn.com'],
    reply_to: form.email,
    subject: `New enquiry from ${form.name}`,
    text: `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${form.message}`,
    html: `<table cellpadding="4">${rows
      .map(([k, v]) => `<tr><td><b>${k}</b></td><td>${escape(v)}</td></tr>`)
      .join('')}</table><p style="white-space:pre-wrap">${escape(form.message)}</p>`,
  }

  const key = process.env.RESEND_API_KEY
  if (!key) {
    if (process.env.VERCEL_ENV === 'production') {
      console.error('contact: RESEND_API_KEY is not set')
      return json(500, { error: 'not_configured' })
    }
    console.info('contact (dry run, no RESEND_API_KEY):\n' + email.text)
    return json(200, { ok: true, dryRun: true })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(email),
  })
  if (!res.ok) {
    console.error('contact: Resend replied', res.status, await res.text())
    return json(502, { error: 'send_failed' })
  }
  return json(200, { ok: true })
}
