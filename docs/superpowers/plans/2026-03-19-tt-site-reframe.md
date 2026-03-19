# Tailored Tools Site Reframe Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure tailored-tools.com from an AO-only landing page into a multi-page portfolio consultancy site with a QR linktree page for in-person networking.

**Architecture:** Static HTML/CSS/JS site on GitHub Pages. Shared `styles.css` for common components (nav, footer, typography, design system). Individual pages for homepage, projects, AO, workshops, about, and standalone links page. AO content migrated from root to `/ao/` subdirectory.

**Tech Stack:** HTML, CSS, vanilla JS. No framework, no build step. GitHub Pages deployment.

**Spec:** `docs/superpowers/specs/2026-03-19-tt-site-reframe-design.md`

---

## Chunk 1: Prerequisites & Shared Foundation

### Task 1: Create .gitignore

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Create .gitignore**

```
.superpowers/
.DS_Store
```

- [ ] **Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore to exclude brainstorm artifacts"
```

---

### Task 2: Extract shared CSS into styles.css

**Files:**
- Create: `styles.css`
- Reference: `index.html` (read existing CSS variables and nav/footer/typography styles)

Extract these shared patterns from the current `index.html`:
- CSS custom properties (`:root` block)
- Reset (`* { margin: 0; ... }`)
- Body typography
- Nav styles (`.nav-inner`, `.nav-logo`, `.nav-links`, `.nav-cta`, hamburger, mobile)
- Footer styles
- Responsive breakpoints for nav/footer
- Utility classes: section padding, max-width container, cards grid, expandable cards, stats strip

- [ ] **Step 1: Read current index.html CSS** — identify all shared styles vs page-specific styles (hero rotation, quiz, AO cards, chat demo are page-specific)

- [ ] **Step 2: Create styles.css** with:
  - `:root` variables (--primary, --accent, --dark, --white, --light, --text, --text-light, --max-width)
  - Reset and body
  - Nav component: `tt-logo-light.svg` (light logo on dark nav), links: Home (`/`) | Projects (`/projects`) | AO (`/ao/`) | Workshops (`/workshops`) | About (`/about`), CTA button. Note: AO pages override CTA to "Get AO Audit" with Stripe link.
  - Footer component: `tt-logo-light.svg`, email `hello@tailored-tools.com`, social links (Instagram: `https://www.instagram.com/tailored.tools`, LinkedIn: copy from existing footer), privacy link (`/privacy.html`), copyright
  - Common typography (h1-h3, p, a, section containers)
  - Common interactive patterns (expandable cards, stats strip)
  - Responsive breakpoints (768px)
  - `.active` nav link highlighting

- [ ] **Step 3: Verify** — open index.html in browser, confirm nothing has changed yet (styles.css is not linked yet)

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "feat: extract shared CSS into styles.css"
```

---

### Task 3: Migrate AO content to /ao/ subdirectory

**Files:**
- Move: `index.html` → `ao/index.html`
- Move: `methodology.html` → `ao/methodology.html`
- Move: `thank-you.html` → `ao/thank-you.html`
- Move: `score-requested.html` → `ao/score-requested.html`
- Move: `blog/` → `ao/blog/`
- Move: `case-studies/` → `ao/case-studies/`

- [ ] **Step 1: Create directories**

```bash
mkdir -p ao/blog ao/case-studies
```

- [ ] **Step 2: Move files using git mv** (preserves history)

```bash
# Remove any .DS_Store files first (will cause rmdir failures otherwise)
find . -name '.DS_Store' -delete

git mv index.html ao/index.html
git mv methodology.html ao/methodology.html
git mv thank-you.html ao/thank-you.html
git mv score-requested.html ao/score-requested.html

# Move directories (not contents) to avoid .DS_Store issues
git mv blog ao/blog
git mv case-studies ao/case-studies
```

- [ ] **Step 3: Commit the move** (before editing, so git tracks the rename)

```bash
git add -A
git commit -m "refactor: move AO content to /ao/ subdirectory"
```

---

### Task 4: Update internal links in all moved files

**Files (18 total):**
- Modify: `ao/index.html`
- Modify: `ao/methodology.html`
- Modify: `ao/thank-you.html`
- Modify: `ao/score-requested.html`
- Modify: `ao/case-studies/sonic-sanctuary.html`
- Modify: `ao/blog/index.html`
- Modify: `ao/blog/*.html` (11 article files)
- Modify: `privacy.html`

**Link update rules:**

For files now in `ao/`:
- Logo `url('tt-logo-light.svg')` → `url('/tt-logo-light.svg')`
- Logo `url('../tt-logo-light.svg')` → `url('/tt-logo-light.svg')`
- `href="/favicon.png"` stays as-is (absolute paths to root assets are fine)
- Nav links: replace old section anchors with new page URLs
- `href="/blog/"` → `href="/ao/blog/"`
- `href="/methodology.html"` → `href="/ao/methodology.html"`
- `href="/privacy.html"` stays (privacy stays at root)
- Blog article cross-links: update relative paths within `/ao/blog/`
- Case study: update links to `/#free-score` → `/ao/#free-score`, `/#ao` → `/ao/`, `/methodology` → `/ao/methodology.html`

For files now in `ao/blog/`:
- Nav logo: `url('../tt-logo-light.svg')` → `url('/tt-logo-light.svg')`
- **IMPORTANT: Blog articles use TWO link conventions — catch both:**
  - Some use absolute: `/#ao`, `/#about`, `/#contact` → update to `/ao/`, `/about`, `/about#contact`
  - Some use relative: `../#ao`, `../#about` → update to `/ao/`, `/about`
- Blog index link: stays relative
- Blog index article links: `href="/blog/..."` → `href="/ao/blog/..."`
- **Canonical URLs:** update from `https://tailored-tools.com/blog/...` to `https://tailored-tools.com/ao/blog/...`

For `ao/case-studies/sonic-sanctuary.html`:
- **Canonical URL:** update to `https://tailored-tools.com/ao/case-studies/sonic-sanctuary.html`

For `ao/methodology.html`:
- **Canonical URL:** update to `https://tailored-tools.com/ao/methodology.html`

For `privacy.html` (stays at root):
- Update nav links only (currently links to `/#ao` etc.)

**Nav logo clarification:** The nav uses `tt-logo-light.svg` (light/white logo on dark nav background). This is correct. The spec's reference to `tt-logo-dark.svg` in nav is a naming error — `tt-logo-dark.svg` is the dark-coloured logo for light backgrounds.

- [ ] **Step 1: Update ao/index.html** — replace nav with new shared nav (Home | Projects | AO | Workshops | About), update footer, fix blog/methodology links. AO nav CTA stays as "Get AO Audit" with Stripe link.

- [ ] **Step 2: Update ao/methodology.html** — new nav, new footer, fix links back to AO page

- [ ] **Step 3: Update ao/thank-you.html and ao/score-requested.html** — new nav, new footer

- [ ] **Step 4: Update ao/case-studies/sonic-sanctuary.html** — new nav, new footer, fix links to `/ao/#free-score`, `/ao/methodology.html`

- [ ] **Step 5: Update ao/blog/index.html** — new nav, new footer, fix canonical URL, fix article links

- [ ] **Step 6: Update all 11 blog articles** — new nav, new footer, fix relative paths, update canonical URLs from `/blog/...` to `/ao/blog/...`

- [ ] **Step 7: Update privacy.html** — new nav, new footer

- [ ] **Step 8: Link styles.css** — add `<link rel="stylesheet" href="/styles.css">` to all modified files. Remove duplicated CSS that's now in styles.css. Keep page-specific styles inline.

- [ ] **Step 9: Verify** — open ao/index.html locally, click through nav, check blog links, check methodology link, verify quiz and AO cards still work, verify Tally embed loads

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "refactor: update all internal links for /ao/ migration"
```

---

## Chunk 2: New Pages

### Task 5: Create homepage (index.html)

**Files:**
- Create: `index.html`

**Sections:**
1. Nav (shared, Home highlighted)
2. Hero — gradient background (#0D1B2A → #1a2d42), headline "I build AI systems that actually run businesses", subtitle, two CTAs
3. What TT Does — three cards on light grey background: Business Automation, Agent Optimisation, Workshops
4. Live Projects — two bordered cards: Performance Interpreting, The Sonic Sanctuary, each with sector label, description, "View project →" link
5. Stats strip — dark background: 3 Live AI Systems | 190+ Community Members | 11 Articles Published
6. Brief about — james.jpg circular, "I'm James" intro, short bio, "More about me →"
7. Footer (shared)

SEO: title "Tailored Tools - AI Integration for Small Businesses", meta description, OG tags, canonical, Organization JSON-LD.

**JSON-LD note:** The new homepage gets Organization JSON-LD. Strip Organization/LocalBusiness JSON-LD from `ao/index.html` during Task 4 (keep only Service and FAQPage schemas on the AO page) to avoid duplication.

- [ ] **Step 1: Create index.html** with full HTML structure, link styles.css, add page-specific hero/cards/stats styles inline

- [ ] **Step 2: Verify** — open in browser, check responsive (resize to mobile), check all links point to correct pages

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: create new homepage with portfolio positioning"
```

---

### Task 6: Create QR links page (links.html)

**Files:**
- Create: `links.html`

**Layout (categorised, standalone):**
- No nav bar, no footer — standalone page
- Dark theme throughout (#0D1B2A)
- Header: james.jpg avatar (circular, orange border), name, subtitle
- "For Your Business" section label → Free AI Score card (orange border, links to /ao/#free-score)
- "The Sonic Sanctuary" section label → Upcoming Events link, then two side-by-side cards with background images: Sound Baths WhatsApp (140+ members) + Drum Circle WhatsApp (50+ members), both "Announcements only"
- Subtle footer: "tailored-tools.com →"
- Must fit one phone screen — compact padding, no scroll
- Large tap targets for noisy environments
- WhatsApp links and SS events URL as placeholders until James provides them

- [ ] **Step 1: Create links.html** — self-contained, all CSS inline (does not use styles.css since it's standalone)

- [ ] **Step 2: Source/create background images** for WhatsApp cards — check existing SS assets first, generate if needed. Save to `images/` directory (create if needed). Small, optimised for mobile (compress to <50KB each).

- [ ] **Step 3: Verify on mobile** — open on phone or use Safari responsive mode, confirm single screen, test tap targets

- [ ] **Step 4: Commit**

```bash
git add links.html
git commit -m "feat: create QR linktree page for parish council networking"
```

---

### Task 7: Create projects page (projects.html)

**Files:**
- Create: `projects.html`

**Structure:**
- Nav (shared, Projects highlighted)
- Hero — "Live Projects" headline, subtitle about real businesses running on AI systems
- **SS section:**
  - Before/after diagram (HTML/CSS) — Before: icons for Square + Weebly + Carrd + Spreadsheets + Manual WhatsApp + Email (scattered, disconnected). After: single "SS OS" hub connecting Stripe, Google Sheets, Dashboard, WhatsApp, Website, Email
  - Architecture diagram — flow showing: Customer books on website → Stripe payment → Google Sheets updated → Dashboard reflects → WhatsApp confirms → Event day check-in
  - Expandable feature cards: Event management, Stripe payments, Intro pass system, WhatsApp integration, Customer comms, B2B booking, Public website
  - Stats (placeholder numbers until James confirms)
- **PI section:**
  - Before/after diagram — Before: Email chains + spreadsheets + manual booking + phone calls. After: PI OS dashboard
  - Architecture diagram — flow showing: Client enquiry → PI OS booking → Staff assigned → Email extractor (AI) → Google Sheets dashboards → Invoicing (FreeAgent)
  - Expandable feature cards: Booking management, Staff portal, Email extractor (AI), Google Sheets integration, Interpreter database (379), Automated workflows
  - Stats (placeholder numbers)
- Footer (shared)

SEO: title "Projects - Tailored Tools", meta description, OG tags, canonical

- [ ] **Step 1: Create projects.html** — full page with before/after diagrams as inline HTML/CSS (no images needed — built with styled divs, lines, and icons)

- [ ] **Step 2: Add expandable card JavaScript** — reuse the pattern from AO page (`.ao-card` toggle)

- [ ] **Step 3: Capture screenshots** — **Requires human intervention.** Use browser automation to screenshot PI OS (os.performanceinterpreting.co.uk) and SS OS (ss-os.vercel.app) dashboards, or ask James to provide screenshots. Save to `images/` directory, optimise for web.

- [ ] **Step 4: Verify** — check diagrams render correctly, cards expand/collapse, responsive layout works

- [ ] **Step 5: Commit**

```bash
git add projects.html
git commit -m "feat: create projects page with PI and SS case studies"
```

---

### Task 8: Create workshops page (workshops.html)

**Files:**
- Create: `workshops.html`

**Sections:**
- Nav (shared, Workshops highlighted)
- Hero — headline about practical AI workshops for local businesses
- What we cover — cards or list: practical AI tools, automation, AI discoverability, no jargon
- Who it's for — local business owners, teams, curious individuals
- Community — WhatsApp groups info, meetup announcements
- Ambassador — brief mention of Claude Community Ambassador programme (soft, "coming soon" tone until confirmed)
- Register interest CTA — mailto:hello@tailored-tools.com or simple CTA
- Footer (shared)

This page is intentionally lighter — content grows as James does more community work.

SEO: title "Workshops & Community - Tailored Tools", meta description, OG tags, canonical

- [ ] **Step 1: Create workshops.html** — link styles.css, page-specific styles inline

- [ ] **Step 2: Verify** — check layout, responsive, nav highlighting

- [ ] **Step 3: Commit**

```bash
git add workshops.html
git commit -m "feat: create workshops and community page"
```

---

### Task 9: Create about page (about.html)

**Files:**
- Create: `about.html`

**Sections:**
- Nav (shared, About highlighted)
- Hero — james.jpg large, "James Edwards", one-line positioning
- Journey — narrative: runs three businesses, found AI useful, built systems, now helps others. "I'm not a tech person selling AI — I'm a business owner who found it useful."
- What I've built — brief cards linking to /projects
- Credentials — empty section with placeholder text ("Currently pursuing..." or similar). Ready for certificates to be added.
- Community — meetups, writing, ambassador
- Contact — hello@tailored-tools.com, social links, prominent CTA
- Footer (shared)

SEO: title "About James - Tailored Tools", meta description, OG tags, canonical, Person JSON-LD

- [ ] **Step 1: Create about.html** — link styles.css, page-specific styles inline

- [ ] **Step 2: Verify** — check layout, photo renders, responsive, nav highlighting

- [ ] **Step 3: Commit**

```bash
git add about.html
git commit -m "feat: create about page with James's story"
```

---

## Chunk 3: Site Infrastructure & Polish

### Task 10: Update sitemap.xml

**Files:**
- Modify: `sitemap.xml`

- [ ] **Step 1: Update sitemap** — add new pages, update moved pages to `/ao/` paths:

New URLs to add:
- `https://tailored-tools.com/` (homepage)
- `https://tailored-tools.com/projects`
- `https://tailored-tools.com/workshops`
- `https://tailored-tools.com/about`
- `https://tailored-tools.com/links`

Update existing URLs (if present in sitemap):
- `/` → becomes `/ao/` (AO landing page)
- `/methodology.html` → `/ao/methodology.html`
- `/blog/` → `/ao/blog/`
- All 11 blog article URLs → `/ao/blog/...`
- `/case-studies/sonic-sanctuary.html` → `/ao/case-studies/sonic-sanctuary.html`

Add if not currently in sitemap (check first):
- `/ao/` (AO landing page)
- `/ao/methodology.html`
- `/ao/thank-you.html`
- `/ao/score-requested.html`
- `/ao/case-studies/sonic-sanctuary.html`

- [ ] **Step 2: Commit**

```bash
git add sitemap.xml
git commit -m "chore: update sitemap with new site structure"
```

---

### Task 11: Update llms.txt

**Files:**
- Modify: `llms.txt`

- [ ] **Step 1: Rewrite llms.txt** to reflect new site structure — homepage is portfolio/consultancy, AO is one section, projects showcases PI + SS, workshops for community

- [ ] **Step 2: Commit**

```bash
git add llms.txt
git commit -m "chore: update llms.txt with new site structure"
```

---

### Task 12: Cross-page verification & link check

**Files:**
- All HTML files

- [ ] **Step 1: Manual link walk-through** — open homepage in browser, click every nav link, verify each page loads with correct highlighted nav item

- [ ] **Step 2: Check AO section** — verify quiz works, expandable cards work, Tally embed loads, Stripe link works, blog articles load, methodology page loads

- [ ] **Step 3: Check QR links page** — open links.html directly, verify it renders standalone without nav, fits one screen on mobile

- [ ] **Step 4: Check mobile responsive** — resize browser to 375px width, check all pages: nav hamburger works, content stacks properly, no horizontal scroll

- [ ] **Step 5: Fix any broken links or layout issues found**

- [ ] **Step 6: Final commit if any fixes made**

```bash
git add -A
git commit -m "fix: resolve broken links and layout issues from site restructure"
```

---

### Task 13: External link migration (manual steps for James)

These cannot be automated — James needs to do these after deployment:

- [ ] **Tally form redirect** — log into Tally, update free score form redirect URL from `tailored-tools.com/score-requested.html` to `tailored-tools.com/ao/score-requested.html`
- [ ] **Stripe checkout** — log into Stripe, update success URL from `tailored-tools.com/thank-you.html` to `tailored-tools.com/ao/thank-you.html`
- [ ] **Social bios** — update any Instagram/LinkedIn bio links
- [ ] **Email signatures** — update any links to old paths
- [ ] **QR code** — generate QR code pointing to `tailored-tools.com/links`

---

## Execution Order & Dependencies

```
Task 1 (.gitignore)          → independent, do first
Task 2 (styles.css)          → independent, do first
Task 3 (move files)          → do before Task 4
Task 4 (update links)        → depends on Task 2 + Task 3
Task 5 (homepage)            → depends on Task 2
Task 6 (QR links page)       → independent (standalone page)
Task 7 (projects page)       → depends on Task 2
Task 8 (workshops page)      → depends on Task 2
Task 9 (about page)          → depends on Task 2
Task 10 (sitemap)            → do after Tasks 3-9
Task 11 (llms.txt)           → do after Tasks 3-9
Task 12 (verification)       → do last
Task 13 (external links)     → manual, post-deploy
```

**Parallelisable groups:**
- Wave 1: Tasks 1, 2, 6 (all independent)
- Wave 2: Task 3 (move files — sequential, needs clean working tree) + Tasks 5, 7, 8, 9 in parallel (only depend on Task 2, don't touch AO files)
- Wave 3: Task 4 (update links in moved files — depends on Tasks 2 + 3)
- Wave 4: Tasks 10, 11 (infrastructure updates)
- Wave 5: Task 12 (verification)

**Note:** Tasks 5, 7, 8, 9 create NEW files and don't modify any AO content, so they can run in parallel with Task 3 (which only moves existing files). Task 4 must wait for both Task 2 and Task 3 since it modifies the moved files and links styles.css. If using subagents, Task 3 must run in the main worktree (git mv), while Tasks 5/7/8/9 can run in isolated worktrees.
