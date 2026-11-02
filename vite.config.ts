import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import type { Connect, Plugin } from 'vite'

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url))

// One HTML entry per page (src/pages/<name>). A page in a folder is served
// at /<name>/; add new pages here and in vercel.json.
const pages = {
  home: 'index.html',
  demo: 'demo/index.html',
}

// Vite only maps /<name>/ to <name>/index.html; send /<name> there too
// instead of falling back to the homepage.
function pageTrailingSlash(): Plugin {
  const dirs = new Set(
    Object.values(pages)
      .filter((p) => p.includes('/'))
      .map((p) => '/' + p.slice(0, p.lastIndexOf('/')))
  )
  const redirect: Connect.NextHandleFunction = (req, res, next) => {
    const [path, query] = (req.url ?? '').split('?')
    if (!dirs.has(path)) return next()
    res.statusCode = 301
    res.setHeader('Location', `${path}/${query ? `?${query}` : ''}`)
    res.end()
  }
  return {
    name: 'page-trailing-slash',
    configureServer: (server) => void server.middlewares.use(redirect),
    configurePreviewServer: (server) => void server.middlewares.use(redirect),
  }
}

// In development, POST /api/contact runs the Vercel Function in api/contact.ts.
// RESEND_API_KEY and CONTACT_* are read from .env.local; without a key the
// email is only logged.
function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      const env = loadEnv(server.config.mode, process.cwd(), '')
      for (const key of ['RESEND_API_KEY', 'CONTACT_TO', 'CONTACT_FROM']) {
        if (env[key]) process.env[key] = env[key]
      }
      server.middlewares.use('/api/contact', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        const mod = (await server.ssrLoadModule('/api/contact.ts')) as typeof import('./api/contact.ts')
        const reply = await mod.POST(
          new Request('http://localhost/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: Buffer.concat(chunks),
          })
        )
        res.statusCode = reply.status
        reply.headers.forEach((v, k) => res.setHeader(k, v))
        res.end(await reply.text())
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), pageTrailingSlash(), devApi()],
  resolve: {
    alias: { '@': r('./src') },
  },
  build: {
    rollupOptions: {
      input: Object.fromEntries(
        Object.entries(pages).map(([name, html]) => [name, r(`./${html}`)])
      ),
    },
  },
})
