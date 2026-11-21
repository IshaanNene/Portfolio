# A Developer's Diary — portfolio

A neo-brutalist, scrapbook-style portfolio. The home page is a procedural 3D diary with turnable pages; every other page is a different kind of paper object (receipts, passport stamps, newspaper clippings, a filing cabinet…).

Built with Next.js 16 (App Router, static export), React 19, Tailwind v4, three.js / React Three Fiber / drei, GSAP and Framer Motion.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000  (use -- --port 3417 if 3000 is busy)
npm run build      # static export into out/
npm run lint
```

## Deploy (GitHub Pages)

Every push to `main` runs `.github/workflows/pages.yml`. It builds a static export with `PAGES_BASE_PATH=/<repo>` and publishes `out/` to https://ishaannene.github.io/Portfolio/.

To try the Pages build locally:

```bash
PAGES_BASE_PATH=/Portfolio npx next build
```

On a host that serves from the domain root (Vercel, Netlify, a custom domain), leave `PAGES_BASE_PATH` unset and update `site.url`.

## Make it yours — content lives in two places

| File | What it controls |
| --- | --- |
| `src/config/site.ts` | Name, role, tagline, intro, location, timezone, availability status, contact email / form endpoint, socials, photo, site URL |
| `src/config/nav.ts` | Bookmark ribbons (labels, colours, page numbers) |
| `src/data/projects.ts` | Projects + case studies (`/projects`, `/projects/[slug]`, newspaper) |
| `src/data/experience.ts` | Receipt timeline + career milestones |
| `src/data/milestones.ts` | Passport stamps |
| `src/data/skills.ts` | Filing-cabinet drawers (`/stack`) |
| `src/data/updates.ts` | Sticky-note wall on `/now` |
| `src/data/learning.ts` | To-do notebook on `/learning` |
| `src/data/scribbles.ts` | Scribble page on `/about` |
| `src/data/lab.ts` | Lab experiments |
| `src/data/desk.ts` | Objects on the 3D About desk |
| `src/data/diary.ts` | Text painted onto the 3D diary pages |

**Everything that is not real yet is marked.** Strings containing `[PLACEHOLDER]`, and entries with `sample: true` (rendered with a "SAMPLE" stamp), are stand-ins — replace them with your own facts. Nothing in the data invents real employers, achievements or metrics.

Search for what still needs replacing:

```bash
grep -rn "PLACEHOLDER\|sample: true\|SAMPLE —" src/config src/data
```

Also:
- Replace `public/images/photo-placeholder.svg` with your photo and update `site.photo`.
- Set `site.url` (used for metadata, sitemap and robots).
- Set `site.contact.formEndpoint` (e.g. Formspree) to post the contact form; when empty it falls back to `mailto:`.

## Architecture

```
src/
  app/                 routes (/, now, projects, projects/[slug], experience, about,
                       lab, stack, learning, contact, back-page), sitemap, robots,
                       error + not-found boundaries, page-transition template
  config/              site + navigation config
  data/                all content
  components/
    3d/                procedural diary (cover, curling pages, band, ribbon),
                       canvas-painted textures, desk props, About desk scene
    home/              HomeExperience (lazy 3D + controls), CSS DiaryFallback, status pill
    navigation/        bookmark ribbons, mobile tab bar, footer
    diary/ now/ projects/ experience/ about/ lab/ stack/ learning/ contact/
                       the paper objects for each page
    eggs/              sticker layer, egg watcher, back page
    ui/                buttons, typography, decor (tape, pins, stamps), error boundary
  hooks/               useWebGL (capability tier), usePersistentState
  lib/                 utils, synthesized WebAudio sound, easter-egg registry
```

### 3D diary
- All geometry and textures are generated in code — no downloaded models or images, so no licensing to track.
- Pages bend on the CPU along a curl profile; clicking a painted link on a page navigates to that route.
- The 3D bundle is loaded with `next/dynamic` (`ssr: false`); the CSS diary renders first and stays as the fallback.
- WebGL tiers: no WebGL → CSS diary; low tier → fewer segments and lower DPR. Add `?no3d` to force the fallback.
- `prefers-reduced-motion` skips the page animations and camera drift.
- Desktop shows full spreads; on phones the camera frames one page at a time and you swipe.

### Accessibility
- Skip link, real `<nav>` landmarks and focus-visible outlines.
- Keyboard controls for the diary (← → keys).
- Every 3D page has a DOM equivalent (the contents index below the diary).
- Sound is off by default.

## Easter eggs (12)

Progress is stored in `localStorage` and shown on the hidden back page.

1. **The Old Code** — Konami code anywhere → opens `/back-page`
2. **Root Access** — `sudo` (or `secret`) in the Lab terminal
3. **Sticker Bomber** — peel a sticker from the sheet and drop it anywhere
4. **Button Pusher** — the "DO NOT PRESS" sticker on the diary cover
5. **Caffeinated** — type `coffee` anywhere outside an input
6. **Margin Artist** — draw on the doodle pad on `/about`
7. **Time Traveller** — click the flip clock on `/now` five times
8. **Tear Here** — tear off the coupon on the experience receipt
9. **Clearance Granted** — open the classified folder in the Lab (`unlock` or code `1337`)
10. **Note Flipper** — flip a sticky note
11. **Clip Collector** — the loose paperclip in the footer
12. **Back Page** — reach `/back-page` (not linked in navigation; `noindex`, disallowed in robots)
