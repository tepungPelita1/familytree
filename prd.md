# Family Tree — Product Requirements Document

**Product:** Family Tree
**Tagline:** Your Family. Your Legacy. / *Keluarga Anda. Warisan Anda.*
**Version:** 1.0
**Status:** Development Planning
**Platform:** Web application (static export, self-hosted on homelab)
**Architecture:** Client-side only, no backend
**Languages:** English (default), Bahasa Melayu

> Adapted from the KinTree PRD v1.0. Changes from the source: product renamed, bilingual UI, explicit data model and 3D layout spec, JSON import/export moved into MVP, deployment section added.

---

## 1. Product Overview

Family Tree is an interactive 3D family tree generator. Users enter family members through a guided multi-step form, define relationships, and get an automatically arranged 3D tree they can explore and export as a high-resolution PNG.

Family data is processed locally in the browser and is never sent to or stored on a server. Users can save their work as a JSON file on their own device and load it again later.

## 2. Product Vision

Make family history visualization accessible, beautiful and effortless, turning a traditional family tree into an immersive 3D experience.

## 3. Target Users

- Individuals documenting family history.
- Families building a shared record of their genealogy (initially: the AJAM family).
- Students completing family tree assignments.
- Malay- and English-speaking users.

## 4. Core Product Principles

1. **Simplicity:** No technical knowledge required.
2. **Accuracy:** Relationships are represented correctly.
3. **Visual quality:** The tree feels premium and immersive.
4. **Privacy:** Family data never leaves the user's device unless they export it themselves.
5. **Accessibility:** Works on desktop, tablet and mobile.

---

## 5. Functional Requirements

### FR-01: Landing Page

- Premium dark-themed interface.
- Product name, tagline and short introduction.
- Preview of a 3D family tree (sample data, not user data).
- Primary CTA: **Create Family Tree**. Secondary CTA: **Open saved tree (.json)**.
- "How it works" in three or four steps.
- Privacy statement.
- Language switcher (EN / BM).
- Responsive navigation.

### FR-02: Guided Family Information Input (Wizard)

A multi-step form. Labels in the wizard are relative to the starting person ("Me"), but every entry is stored as a node in a relationship graph (see FR-03).

| Step | Content |
|---|---|
| 1. Starting point | The central person ("Me" or the chosen root of the branch). |
| 2. Grandparents | Paternal grandfather, paternal grandmother, maternal grandfather, maternal grandmother. Each can be left blank. |
| 3. Parents | Father, mother, additional partners where applicable. |
| 4. Children | Add any number of sons, daughters or other children; choose which partner is the other parent. |
| 5. Descendants | Grandchildren, great-grandchildren and further generations, each attached to a parent already in the tree. |
| 6. Other relatives | Uncles, aunts, cousins, siblings and others, each attached to an existing person (e.g. an uncle is a child of a grandparent). |
| 7. Review | Summary of all members and relationships, with validation errors shown inline before generation. |

**Per-member fields**

| Field | Required | Notes |
|---|---|---|
| Full name | Yes | Free text, supports non-Latin characters. |
| Gender | No | `male`, `female`, or unspecified. |
| Birth year | No | Used for sibling ordering only. |
| Death year | No | Shown as a marker on the node. |
| Notes | No | Short free text. |

The relationship type, parent links and partner links are set by where the member is added in the wizard and can be edited afterwards.

**Users must be able to**

- Add, edit and remove members.
- Add multiple spouses or partners.
- Skip unknown information.
- Move between steps without losing data.
- Undo removing a member, at least for the most recent removal.

### FR-03: Relationship Management

The source of truth is a graph, independent of generation numbers and wizard labels.

- Supports parent–child and partner relationships.
- A child has at most two parents.
- Supports multiple branches and incomplete data (e.g. one known parent).
- Rejects references to members that don't exist.
- Rejects circular ancestry (a person cannot be their own ancestor).
- Rejects a person being linked as both partner and parent/child of the same person.
- Removing a member also removes their relationships. The user is warned if this would leave other members disconnected from the tree.

See §8 for the data model.

### FR-04: Tree Generation Engine

- Calculates generation levels from the graph (the root is generation 0, ancestors are negative, descendants positive).
- Arranges nodes automatically and groups partners side by side.
- Connects parents to their children.
- Handles multiple branches and missing members.
- Avoids overlapping nodes.
- **Deterministic:** identical input always produces an identical layout. Sort siblings by birth year, then by insertion order.

See §9 for the layout spec.

### FR-05: Interactive 3D Visualization

Built with Three.js, React Three Fiber and Drei.

**Nodes**
- One 3D node per member showing their name, with an optional gender accent and a deceased marker.
- Profile images come in Phase 2.

**Connections**
- Parent–child: branch lines from the midpoint of the couple down to each child.
- Partner: a short horizontal link between partners.
- The two connection types are visually distinct in color or style.

**Camera**
- Orbit (rotate), zoom and pan using mouse, touch and trackpad.
- Reset camera.
- Fit the whole tree into view.
- Focus on the selected member with a smooth transition.

**Interaction**
- Click or tap a node to open a details panel.
- Highlight the selected member's direct relatives (parents, partners, children).
- Depth, lighting and soft shadows.

### FR-06: Visualization Customization

- Show or hide labels.
- Reset the view or fit it to the tree.
- Theme selection. The MVP ships one theme, **Dark Luxury**, but the theme system must allow more to be added.

### FR-07: PNG Export

- PNG format, high resolution (at least 2× the screen size, up to a 4096px or 8192px long edge depending on GPU limits).
- Rendered offscreen at the target size, not a screenshot of the visible canvas.
- Includes every member and connection, without any app UI.
- Shows a preview before download, then downloads directly.
- Must never produce a blank or cropped image. Check this before offering the download.

### FR-08: Save / Load (JSON) — *moved into MVP*

Without this, users would lose their work on every reload. Saving and loading happen entirely on the user's device:

- **Save:** Download the current tree as `family-tree-<date>.json`.
- **Load:** Open a `.json` file from the landing page or the editor.
- The file has a version (`schemaVersion`) and is validated on load. Invalid files show a clear error and never overwrite the current session.
- No data is written to any server.

### FR-09: Privacy and Data Protection

- No accounts or authentication.
- No database or server-side storage.
- No analytics, trackers or external APIs that could receive family data.
- No web fonts or scripts loaded from third-party CDNs at runtime. Self-host all assets.
- Data lives only in browser memory during the session. Reloading clears it unless the user has saved a JSON file.
- When the user tries to leave with unsaved changes, show a "you have unsaved changes" prompt.

### FR-10: Internationalization

- English is the default. Bahasa Melayu is fully supported.
- All UI text lives in translation files (`/messages/en.json`, `/messages/ms.json`). No hardcoded strings.
- The selected language is stored as a non-personal preference (localStorage is allowed for this only).
- Relationship labels are translated (e.g. Grandfather / Datuk, Aunt / Mak Cik).
- User-entered names are never translated.

---

## 6. User Journey

1. User visits the site.
2. User chooses **Create Family Tree** or **Open saved tree**.
3. User completes the wizard.
4. User reviews the entries and fixes any validation errors.
5. User selects **Generate Family Tree**.
6. The relationship engine validates the graph.
7. The layout engine calculates positions.
8. The 3D renderer draws the tree.
9. User explores, customizes and can go back to edit.
10. User exports a PNG and/or saves a JSON file.

---

## 7. Design System — Dark Luxury

The interface should feel elegant, premium, modern and immersive.

**Color tokens**

| Token | Role | Starting value |
|---|---|---|
| `--bg` | Background, deep charcoal | `#0E0E10` |
| `--surface` | Cards and panels, dark graphite | `#1A1A1E` |
| `--primary` | Warm gold | `#C9A45C` |
| `--secondary` | Muted bronze | `#8C6A43` |
| `--text` | Soft ivory | `#F2EDE4` |
| `--muted` | Supporting text, muted grey | `#8E8A84` |

**Typography**
- Headings: an elegant serif (e.g. Cormorant Garamond or Playfair Display), self-hosted.
- Body and labels: a modern sans-serif (e.g. Inter), self-hosted.

**UI characteristics**
- Subtle glass effects, soft shadows, premium card surfaces.
- Generous spacing, with gold highlights used sparingly.
- Smooth micro-interactions and cinematic 3D lighting.
- Avoid heavy gradients, needless animation and generic dashboard aesthetics.
- Respect `prefers-reduced-motion`.

---

## 8. Data Model

```ts
// types/family.ts
type Gender = 'male' | 'female' | 'unspecified';

interface Person {
  id: string;            // stable unique id (nanoid)
  fullName: string;
  gender: Gender;
  birthYear?: number;
  deathYear?: number;
  notes?: string;
  createdAt: number;     // insertion order, used for deterministic sorting
}

// types/relationship.ts
type Relationship =
  | { id: string; type: 'parent-child'; parentId: string; childId: string }
  | { id: string; type: 'partner'; aId: string; bId: string };

interface FamilyTree {
  schemaVersion: 1;
  rootId: string;        // the "starting point" person
  people: Record<string, Person>;
  relationships: Relationship[];
}
```

Wizard labels such as "paternal grandfather" or "cousin" are **computed** from the graph relative to `rootId`. They are never stored.

---

## 9. 3D Layout Spec

- **Y axis:** generation. Ancestors sit above the root and descendants below, with a fixed spacing between generations.
- **X axis:** order within a generation. Each family unit (a couple and their children) is laid out as a block, and sibling blocks are spread so they don't overlap. A tidy-tree style algorithm is enough for the MVP.
- **Z axis:** depth for visual layering only, e.g. a slight offset per branch or a gentle curve, so the scene reads as 3D when rotated without hurting legibility. Z must not change the logical structure.
- Partners are placed next to each other, with children centered under the couple's midpoint.
- When a person has multiple partners, the person sits between or beside the partners, and each partner's children are grouped under that pair.
- The layout is a pure function `layout(tree) => { nodes: {id, x, y, z}[], edges: [...] }` with unit tests for determinism.

---

## 10. Technical Architecture

| Area | Choice |
|---|---|
| Framework | Next.js (App Router) with `output: 'export'` (static site) |
| Language | TypeScript (strict) |
| UI | React, Tailwind CSS, shadcn/ui, Lucide icons |
| 3D | Three.js, React Three Fiber, Drei |
| State | Zustand (in-memory; no persist middleware for family data) |
| Animation | Framer Motion (UI), R3F / Drei camera controls (3D) |
| i18n | next-intl (or an equivalent that works with static export) |
| Export | Offscreen WebGL render target → PNG blob → download |
| Testing | Vitest for the engine, validator and layout; Playwright for smoke tests |
| Package manager | pnpm |

The 3D visualization is lazy-loaded (`next/dynamic`, `ssr: false`) so the landing page and wizard stay light.

There is no backend or API routes. Every feature must work with static export.

## 11. Application Structure

```
/app
  /[locale]
    page.tsx            # landing
    /create/page.tsx    # wizard
    /preview/page.tsx   # 3D view + export
/components
  /landing
  /wizard
  /family-tree          # member cards, details panel
  /visualization        # R3F scene, nodes, edges, camera
  /export
  /ui                   # shadcn
/lib
  /family-engine        # graph helpers, relative labels
  /relationship-validator
  /tree-layout
  /export-engine        # PNG + JSON
/store
  family-store.ts
/types
  family.ts
  relationship.ts
/hooks
  use-family-tree.ts
/messages
  en.json
  ms.json
/public
  robots.txt
```

---

## 12. Deployment (Homelab)

- `pnpm build` writes a fully static site to `/out`.
- Serve `/out` from the homelab with Nginx (or Caddy), optionally in a Docker container.
- Keep `robots.txt` as `Disallow: /`. The site is private to the family and should not be indexed.
- HTTPS through the homelab reverse proxy.
- Recommended headers: a strict `Content-Security-Policy` with no third-party origins, `Referrer-Policy: no-referrer`, and `Permissions-Policy` disabling unused features.
- Server-specific details (host, proxy, CI or manual deploy) will be defined in a separate deployment phase.

---

## 13. MVP Scope

**Must have**
- Landing page (EN/BM).
- Guided multi-step wizard with review step.
- Dynamic add, edit and remove of members, including multiple partners.
- Explicit relationship graph and validation.
- At least five generations.
- Deterministic automatic layout.
- Real 3D scene with orbit, zoom, pan, reset, fit and focus.
- Member selection, details panel and relative highlighting.
- High-resolution PNG export with preview.
- JSON save and load.
- Client-side only, privacy-first.
- Static export deployable to the homelab.

**Out of scope for MVP**
- User accounts, database, cloud sync.
- Public sharing or collaborative editing.
- AI-generated relationships.
- PDF export.
- Profile images.
- Advanced genealogy research features (GEDCOM, sources, citations).

---

## 14. Non-Functional Requirements

**Performance**
- Landing page JS stays small. Three.js loads only on the preview route.
- Smooth interaction (target 60fps on desktop, ≥30fps on mid-range mobile) for trees of up to 200 members.
- Use instancing or merged geometry for edges once trees get large.

**Compatibility**
- Latest Chrome, Firefox, Safari and Edge on desktop, tablet and mobile.
- Requires WebGL. Show a clear message when it isn't available.

**Privacy**
- No family data persisted or transmitted. No unnecessary permissions.

**Reliability**
- Validate before rendering.
- Handle incomplete data.
- Error messages are meaningful and translated.
- PNG export is never blank or incomplete.

**Accessibility**
- Wizard is fully keyboard-navigable with labeled inputs.
- Meets WCAG AA contrast with the gold-on-charcoal palette.
- The members list offers a text alternative to the 3D view.

---

## 15. Acceptance Criteria

The MVP is complete when:

1. A user can create a family tree without registering.
2. A user can add at least five generations.
3. A user can add multiple children, partners and branches.
4. Parent–child and partner relationships render correctly and distinctly.
5. The tree is rendered in a real 3D scene.
6. Users can rotate, zoom and pan, on mouse and on touch.
7. Users can select a member and see their details and direct relatives.
8. Users can export a high-resolution PNG that contains the whole tree.
9. Users can save to JSON and reload that JSON to get the identical tree and layout.
10. No family data is sent to or stored on any server, verifiable in the browser network tab.
11. The UI is fully usable in both English and Bahasa Melayu.
12. `pnpm build` produces a static site that runs when served from a plain static web server.
13. The app works on desktop and mobile browsers.

---

## 16. Future Roadmap

**Phase 2**
- Profile images (stored only inside the JSON file as data URLs, or as local files).
- More 3D themes, custom backgrounds and tree styling.
- GEDCOM import.

**Phase 3**
- PDF export and printable genealogy posters.
- Advanced layouts (radial, fan chart).
- Further customization options.

---

**End of PRD — Family Tree v1.0**
