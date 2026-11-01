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
src/
  App.tsx              page composition + scroll mode (horizontal vs stacked)
  index.css            design tokens (@theme) and all component/section styles
  config/site.ts       contact details, nav links, logo paths, media queries
  data/                page copy: services, process steps, selected work
  hooks/
    useMediaQuery      live boolean for a media query
    useRevealOnScroll  adds .in to .rv elements as they enter the viewport
    useScrollScene     reading progress, hero ring, pinned horizontal journey
  components/          shared UI: Navbar, RingButton, RingIcon, cursor, tap ripple
  sections/            one file per page section, top to bottom
public/                images, logos, company profile PDF
```

Contact details and nav links live in `src/config/site.ts`; most copy changes
happen in `src/data/`.

## Styling

- Colours follow `DESIGN.md`. Use the token names (`heartwood`, `canopy`, `moss`,
  `lichen`, `linen`, …) as CSS variables (`var(--color-moss)`) or Tailwind
  utilities (`text-moss`). Don't add new greens.
- Sections use semantic classes in `index.css`; the responsive overrides are
  grouped at the end of that file so they win by source order, without `!important`.
- Inline `style` is reserved for values computed at runtime (carousel offsets,
  per-card tone variables).

## Horizontal journey

On viewports at least 1101×800 without reduced motion, the "Who we are" and
"Services" panels are pinned and scroll sideways (`.js-hz` on the root). Everywhere
else the same markup stacks vertically. Breakpoints are in `MEDIA` in
`src/config/site.ts` and must match the `@media` rules in `index.css`.

## Dev-only pages

`hero-lab.html` and `hero-lab-2d.html` (with `src/hero-*`) are experiments for
an animated hero. They are not part of the production build.
