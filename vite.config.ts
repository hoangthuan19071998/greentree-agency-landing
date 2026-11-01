import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), pageTrailingSlash()],
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
