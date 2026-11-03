# Family Tree

Build a family tree in the browser and look at it in three dimensions.

Enter the relatives you remember, and the app works out the generations, pairs the
couples, spreads the branches and hands back a tree you can turn around, explore
and export. Nothing is uploaded and nothing is stored on a server: the tree lives
in the tab until you save a file.

The full specification is in [`prd.md`](./prd.md).

---

## Getting started

Requires Node 18.18 or newer.

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:3000>.

The first build downloads the Spectral and Archivo webfonts, so it needs network
access once. After that everything is served from this origin.

### Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Static export into `out/` |
| `npm run serve` | Serve the built `out/` folder locally, to check the export |
| `npm test` | Run the engine tests once |
| `npm run test:watch` | Run them on change |
| `npm run typecheck` | `tsc --noEmit` |

---

## How it is put together

| Area | Choice |
| --- | --- |
| Framework | Next.js 15 App Router, `output: 'export'` |
| Language | TypeScript, strict |
| Styling | Tailwind plus CSS custom properties in `app/globals.css` |
| State | Zustand, in memory only |
| Tests | Vitest |
| 3D (not wired up yet) | Three.js, React Three Fiber, Drei |

There is no backend and no API route. Every feature has to work as static files.

### Three rules the code keeps

**The graph is the source of truth.** A person is a `Person` record and nothing
more. Relationships live separately as `parent-child` and `partner` links. Terms
like "paternal grandfather" or "cousin" are never stored; `relativeLabel()`
computes them from the graph relative to `tree.rootId`, so renaming or re-rooting
never leaves a stale label behind.

**The layout is deterministic.** `layoutTree()` is a pure function of the tree.
Every graph accessor returns ids sorted, so traversal order never depends on the
order relationships happen to sit in the array. Enter the same family twice and
you get the same arrangement twice, which the tests assert directly.

**Family data is never persisted.** The Zustand store has no `persist`
middleware. The only thing in `localStorage` is the chosen language, which is a
display preference rather than family data.

### Project layout

```
app/
  layout.tsx          Fonts, metadata, locale provider
  globals.css         Dark Luxury tokens, type scale, the lineage rule
  page.tsx            Landing page
  create/page.tsx     Wizard, step 1
components/
  family-tree/        Tree rendering shared by the landing page and preview
  landing/            Wordmark, language toggle
lib/
  family-engine/      Graph helpers, ancestry checks, relative labels
  relationship-validator/  Ten checks run before anything is drawn
  tree-layout/        Generations, ordering, placement, plus its tests
  i18n/               Message catalogue and the locale provider
  sample-tree.ts      The example family used on the landing page
store/
  family-store.ts     The working tree
types/
  family.ts           Person, FamilyTree
  relationship.ts     ParentChild, Partnership, RelativeLabel
public/
  robots.txt          Disallow: / — this site is not meant to be indexed
```

### The layout engine

`Y` carries the generation (0 at the root, negative upwards), `X` the order
within a generation, and `Z` only adds a little depth per branch so the scene
reads as 3D when rotated. `Z` never changes the structure.

Generations come from a breadth-first walk out from the root over parents,
children and partners. Within each generation, people are ordered by their
parents key, then birth year, then insertion order, which keeps siblings
together, and partners are pulled in beside each other. Positions are then
relaxed over fourteen passes: each person is drawn towards their parents,
children and partners, then the row is pushed apart again to keep its order and
stop anyone overlapping.

### Validation

`validateTree()` returns errors that block generation and warnings that merely
describe gaps. Errors cover unknown references, a person as their own parent,
circular ancestry, more than two parents, duplicate links, someone who is both a
partner and a parent, and empty names. Warnings cover a child with only one known
parent, and anyone no chain of links connects to the root.

### Design

The palette, type roles and feel are fixed by the PRD: a near-black ground, warm
gold, muted bronze, soft ivory, a serif for headings and a grotesque for the
interface. Bronze is only ever a line or border colour, never type, because it
fails contrast against the ground.

Two things are worth knowing before editing the styling. The page is laid out as
a lineage: a hairline descends the left edge and every section hangs off it at a
node, the same grammar the tree uses to join a parent to a child. And the four
steps on the landing page are marked `G-2 / G-1 / G0 / G+1`, the tree's own
generation notation, because they genuinely are a generational sequence.

---

## Internationalisation

English and Bahasa Melayu, both complete. Every string lives in
`lib/i18n/messages.ts`; nothing is hardcoded in a component. English is the
reference shape, and TypeScript rejects any other locale that does not match it
key for key, so a missing translation is a build error rather than a blank label.

The language is a client-side toggle rather than a URL segment, which keeps a
single set of static routes. The choice is remembered in `localStorage`.

---

## Deploying to the homelab

```bash
npm run build     # writes out/
```

Copy `out/` to the server and point a static web server at it. No Node process
runs in production.

```nginx
server {
    listen 443 ssl;
    server_name tree.example.lan;

    root /srv/family-tree/out;
    index index.html;

    add_header Referrer-Policy "no-referrer" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }
}
```

`trailingSlash` is on, so `/create/` resolves to `out/create/index.html`.

Keep `public/robots.txt` as `Disallow: /`. This is a private family site and
should not be indexed.

---

## Status

| Built | Not built yet |
| --- | --- |
| Landing page, EN and BM | Wizard steps 2 to 7 |
| Wizard step 1, writes to the real store | The WebGL scene and camera controls |
| Graph engine and relative labels | Member selection and details panel |
| Relationship validation | PNG export |
| Deterministic layout, with tests | JSON save and load |
| Static export configured | |

The landing page renders real `layoutTree()` output rather than a picture, so
what it shows is the arrangement an actual tree gets.

Next up, in order: the remaining wizard steps, then the 3D scene, then export.
