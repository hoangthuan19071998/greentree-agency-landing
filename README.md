# Green Tree Agency — website

Single-page marketing site for Green Tree Agency (Da Nang). React 19 + Vite + Tailwind CSS 4.

```bash
npm install
npm run dev      # dev server (also on LAN via --host)
npm run build    # typecheck + production build to dist/
npm run lint     # oxlint
```

## Structure

```
index.html                     entry for /                 -> src/pages/home
demo/index.html                entry for /demo/            -> src/pages/demo
src/
  pages/
    home/
      main.tsx                 mounts the page
      HomePage.tsx             page composition + scroll mode (horizontal vs stacked)
      components/              Navbar, CustomCursor, TapRipple
      sections/                one file per page section, top to bottom
    demo/                      same layout as home, own copies of every
                               component/section + demo.css
  components/                  UI shared by all pages: FilmHero, RingButton, RingIcon,
                               TreeRingSymbol
  hero-canvas/                 the hero film, drawn on a canvas from code (no images)
    createHeroCanvas.ts        the renderer
    timeline.ts                tempo and choreography; setHeroTiming() sets the speed
    treeData.ts                the tree, traced into vector data (generated)
  hooks/
    useHeroFilm                plays the hero film: copy, pause, reduced motion
    useMediaQuery              live boolean for a media query
    useRevealOnScroll          adds .in to .rv elements as they enter the viewport
    useScrollScene             reading progress, pinned horizontal journey
  config/site.ts               contact details, nav links, logo paths, media queries
  data/                        page copy: services, process steps, selected work
  styles/index.css             design tokens (@theme) and all shared styles
  styles/film-hero.css         the hero film's layout
public/                        images, logos, company profile PDF
```

Imports use the `@/` alias for `src/` (e.g. `@/hooks/useScrollScene`).
Contact details and nav links live in `src/config/site.ts`; most copy changes
happen in `src/data/`.

## Pages

Each page has its own folder in `src/pages/` and its own HTML entry. Components
inside a page folder belong to that page only, so editing
`src/pages/demo/` never changes the homepage. Code shared by every
page lives in `src/components`, `src/hooks`, `src/config`, `src/data` and
`src/styles`.

The demo page root has the class `.page-demo`; scope its CSS in
`src/pages/demo/demo.css` under that class.

To add a page `foo`:

1. Copy a page folder to `src/pages/foo/` and rename its page component.
2. Copy `demo/index.html` to `foo/index.html` and point its script at
   `/src/pages/foo/main.tsx`.
3. Add `foo: 'foo/index.html'` to `pages` in `vite.config.ts` and a rewrite for
   `/foo` in `vercel.json`.

## Styling

- Colours follow `DESIGN.md`. Use the token names (`heartwood`, `canopy`, `moss`,
  `lichen`, `linen`, …) as CSS variables (`var(--color-moss)`) or Tailwind
  utilities (`text-moss`). Don't add new greens.
- Sections use semantic classes in `src/styles/index.css`; the responsive overrides are
  grouped at the end of that file so they win by source order, without `!important`.
- Inline `style` is reserved for values computed at runtime (carousel offsets,
  per-card tone variables).

## Horizontal journey

On viewports at least 1101×800 without reduced motion, the "Who we are" and
"Services" panels are pinned and scroll sideways (`.js-hz` on the root). Everywhere
else the same markup stacks vertically. Breakpoints are in `MEDIA` in
`src/config/site.ts` and must match the `@media` rules in `index.css`.

## Hero film

Both pages open with `<FilmHero />`: a seed is sown, roots spread, the tree
grows, the camera dives into the trunk and the growth rings open with the
services. Change its tempo with the `timing` prop or `setHeroTiming()`:

```tsx
<FilmHero timing={{ speed: 0.8 }} />                     // everything 20% slower
<FilmHero timing={{ phases: { grow: 4.5, hold: 2 } }} />  // seconds per phase
```

Phases: `sow`, `grow`, `hold`, `dive`, `bloom`, `rings`, `fade` (defaults in
`DEFAULT_PHASES`, an 11 s loop).
