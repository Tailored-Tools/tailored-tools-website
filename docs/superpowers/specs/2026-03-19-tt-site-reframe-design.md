# Tailored Tools Website Reframe + QR Links Page

**Date:** 2026-03-19
**Status:** Draft
**Repo:** `Tailored-Tools/tailored-tools-website`
**Deployment:** GitHub Pages (static HTML, push to main)
**Domain:** tailored-tools.com

## Overview

Restructure tailored-tools.com from a single AO-focused landing page into a multi-page portfolio-led consultancy site. James front and centre. PI and SS positioned as clients. AO becomes one offering among several. Separate QR linktree page for in-person networking.

## Two Deliverables

1. **Tailored Tools website reframe** — multi-page site with shared nav/footer
2. **QR links page** — standalone linktree-style page at `/links`

---

## Site Architecture (Clean Break)

```
tailored-tools.com/
├── index.html              # Welcome homepage (NEW)
├── projects.html           # PI + SS case studies (NEW)
├── workshops.html          # Community, meetups, ambassador (NEW)
├── about.html              # James's journey, credentials (NEW)
├── links.html              # QR linktree page (NEW, standalone)
├── styles.css              # Shared CSS extracted from inline styles (NEW)
├── privacy.html            # Existing (update nav)
├── robots.txt              # Existing (unchanged)
├── sitemap.xml             # Update with new pages
├── llms.txt                # Update with new structure
├── CNAME                   # Existing (unchanged — GitHub Pages domain)
├── james.jpg               # Existing founder photo
├── favicon.png/svg         # Existing
├── apple-touch-icon.png    # Existing (unchanged)
├── tt-logo-dark.svg        # Existing (nav)
├── tt-logo-light.svg       # Existing (footer)
├── og-image.png            # Update or keep
├── googlef481c3deea8a7266.html  # Existing (unchanged — GSC verification)
├── .gitignore              # NEW — exclude .superpowers/
├── ao/
│   ├── index.html          # Current AO content (MOVED from root index.html)
│   ├── methodology.html    # Existing (MOVED from root)
│   ├── thank-you.html      # Existing (MOVED from root)
│   ├── score-requested.html # Existing (MOVED from root)
│   ├── case-studies/
│   │   └── sonic-sanctuary.html # MOVED from /case-studies/ (AO case study)
│   └── blog/
│       ├── index.html      # Blog index (MOVED from /blog/)
│       └── [11 articles]   # All blog posts (MOVED from /blog/)
```

### URL Migration

| Old URL | New URL | Action |
|---------|---------|--------|
| `/` | `/ao/` | Current homepage moves to AO section |
| `/methodology.html` | `/ao/methodology.html` | Move |
| `/thank-you.html` | `/ao/thank-you.html` | Move |
| `/score-requested.html` | `/ao/score-requested.html` | Move |
| `/blog/*` | `/ao/blog/*` | Move all blog content |
| `/case-studies/*` | `/ao/case-studies/*` | Move AO case studies |
| `/#free-score` | `/ao/#free-score` | Anchor moves with page |

Traffic is low and the site is young. No redirects needed.

### External Link Migration Checklist

These are external system changes that must be updated manually:

- [ ] **Tally form redirect** — free score form currently redirects to `tailored-tools.com/score-requested.html` → update to `/ao/score-requested.html`
- [ ] **Stripe checkout success URL** — currently redirects to `tailored-tools.com/thank-you.html` → update to `/ao/thank-you.html`
- [ ] **Social bios** — any links pointing to old paths (Instagram, LinkedIn, etc.)
- [ ] **Email signatures** — any links to `tailored-tools.com/#free-score` etc.

### Internal Link Migration

All moved files contain hardcoded internal links that must be rewritten:

- **AO page (1 file):** Update nav, footer, internal anchors, blog links, methodology link
- **Blog index + 11 articles (12 files):** Each contains nav links (`../#ao`, `../#about`, `../#contact`), footer links (`/privacy.html`), and cross-article links (`/blog/...`). All must be rewritten to new paths.
- **Methodology page (1 file):** Update nav, footer, links back to AO page
- **Thank-you + Score-requested (2 files):** Update nav, footer, links
- **Case study (1 file):** Update nav, footer, links to `/#free-score`, `/#ao`, `/methodology`
- **Privacy page (1 file):** Update nav, footer

**Total: 18 HTML files need internal link updates.**

---

## Page Designs

### 1. Homepage (`/index.html`)

**Purpose:** Establish James as someone who builds and runs AI-powered business systems. Not a tech consultant — a business owner who found AI useful and now helps others.

**Sections (top to bottom):**

1. **Nav bar** (shared) — Logo | Home | Projects | AO | Workshops | About | [Get in Touch] CTA
2. **Hero** — "I build AI systems that actually run businesses." Subtitle: Three businesses, three live systems, no jargon. Two CTAs: "See My Work" (→ /projects) + "Free AO Score" (→ /ao/#free-score)
3. **What TT Does** — Three cards:
   - **Business Automation** — "Custom platforms that automate your bookings, comms, and operations — built with AI"
   - **Agent Optimisation** — "Make your business the one AI recommends to customers"
   - **Workshops** — "Hands-on AI sessions for local businesses and teams"
4. **Live Projects preview** — Two cards linking to /projects:
   - **Performance Interpreting** — BSL interpretation, booking management OS, staff portal, automated event processing
   - **The Sonic Sanctuary** — Sound therapy, complete business platform, bookings/payments/comms/events
5. **Stats strip** (dark background) — 3 Live AI Systems | 190+ Community Members (140 sound bath + 50 drum circle WhatsApp) | 11 Articles Published (update count as blog grows)
6. **Brief about** — Photo (james.jpg), "I'm James" intro, one-paragraph bio, "More about me →" link
7. **Footer** (shared) — hello@tailored-tools.com, socials, privacy link

### 2. Projects Page (`/projects.html`)

**Purpose:** Showcase PI and SS as Tailored Tools client case studies. Interactive, visual, compelling. This is the "proof" page.

**For each project:**

1. **Before/after diagram** — Visual showing the mess of disconnected tools (Square, Weebly, Carrd, spreadsheets, email threads, manual WhatsApp) vs the unified system. Toggle or side-by-side layout.
2. **Architecture diagram** — Clean visual showing how components connect (e.g., Stripe → Google Sheets → Dashboard → WhatsApp → Website for SS OS)
3. **Interactive feature cards** — Expandable cards (same pattern as AO services) for each major feature. Click to expand details.
4. **Screenshots** — Captured from live PI OS and SS OS dashboards during implementation
5. **Stats strip** — Real numbers per project (events processed, bookings managed, hours saved, etc.)

**PI section covers:** Booking management, staff portal with role-based access, email extractor (AI-powered), Google Sheets integration, interpreter database (379 imported), automated workflows

**SS section covers:** Event management, Stripe payments, pass system, WhatsApp integration, customer comms, B2B booking, public website fed from same data source

**Content note:** Diagrams, screenshots, and copy for this page will be produced during implementation. Screenshots captured from live PI OS (os.performanceinterpreting.co.uk) and SS OS (ss-os.vercel.app) dashboards. Before/after diagrams built as inline HTML/CSS.

### 3. AO Page (`/ao/index.html`)

**Purpose:** The existing AO offering, relocated.

**Content:** Current `index.html` content moved as-is with minimal changes:
- Update nav to shared site nav
- Update footer to shared footer
- Update internal links (blog → /ao/blog/, methodology → /ao/methodology)
- Keep: hero with rotating platforms, quiz, free score (Tally embed), services cards, pricing, FAQ with JSON-LD, IT consultants section, report preview
- Stripe payment link unchanged
- Blog index and all 11 articles move to `/ao/blog/`

### 4. Workshops/Community Page (`/workshops.html`)

**Purpose:** AI meetups, community engagement, ambassador programme.

**Sections:**
1. **Hero** — What the workshops/meetups are about
2. **What we cover** — Practical AI for small businesses, no jargon, hands-on
3. **Who it's for** — Local business owners, teams, anyone curious about AI
4. **Community** — WhatsApp groups, meetup announcements
5. **Ambassador** — Mention of Claude Community Ambassador programme (when confirmed)
6. **Register interest CTA** — Email or form for upcoming sessions

This page will be lighter initially and grow as James does more community work.

### 5. About Page (`/about.html`)

**Purpose:** James's story. The human behind Tailored Tools.

**Sections:**
1. **Hero** — Photo, name, one-line positioning
2. **Journey** — Three businesses, how AI changed how he runs them. "I'm not a tech person selling AI — I'm a business owner who found it useful."
3. **What I've built** — Brief list linking to projects page
4. **Credentials** — Section for certificates/qualifications (Google AI Essentials, DeepLearning.AI, etc. — added as obtained)
5. **Community** — Meetups, ambassador, writing
6. **Contact** — Direct email, social links

### 6. QR Links Page (`/links.html`)

**Purpose:** Linktree-style page for in-person networking. Scanned via QR code on James's phone. Must fit one phone screen. No nav bar — standalone.

**Layout (Categorised — Option B):**

1. **Header** — james.jpg avatar (circular, orange border), "James Edwards", subtitle "Tailored Tools · The Sonic Sanctuary"
2. **"For Your Business" section:**
   - **Free AI Score** — prominent orange-bordered card, links to `/ao/#free-score`. Copy: "Is AI recommending your business?"
3. **"The Sonic Sanctuary" section:**
   - **Upcoming Events** — links to SS website events page
   - **Two side-by-side cards with background images:**
     - **Sound Baths WhatsApp** — sound bath image behind, "140+ members" subtitle
     - **Drum Circle WhatsApp** — drum circle image behind, "50+ members" subtitle
   - Both marked "Announcements only"
4. **Footer link** — subtle "tailored-tools.com →" link to main site

**Design:** Dark theme (matches site palette), no scroll needed, large tap targets, works in a noisy village hall after a glass of wine.

---

## Shared Components

### Navigation
- Sticky dark bar (#0D1B2A)
- Logo (tt-logo-dark.svg) left
- Links: Home | Projects | AO | Workshops | About
- Orange CTA button: "Get in Touch" (mailto:hello@tailored-tools.com)
- **AO page override:** On `/ao/` pages, the nav CTA changes to "Get AO Audit" linking to Stripe payment URL (preserves existing commercial conversion)
- Hamburger menu on mobile
- Current page highlighted

### Footer
- Logo (tt-logo-light.svg)
- Email: hello@tailored-tools.com
- Social: Instagram (@tailored.tools), LinkedIn
- Privacy policy link
- Copyright

### Design System
- **Fonts:** Inter (400-800), Playfair Display (optional serif accent)
- **Colours:** Navy dark #0D1B2A, light navy #203a4c, accent orange #ff6f20, light grey #f4f5f7, white #fff
- **Responsive:** Mobile-first, breakpoint at 768px
- **Interactions:** Expandable cards, smooth transitions (0.2-0.3s)
- **No framework** — static HTML/CSS/JS
- **Shared CSS** — extract common styles (nav, footer, typography, colours, cards, responsive) into `styles.css`. Page-specific styles stay inline in `<style>` blocks.

---

## SEO Meta Tags

Each new page needs `<title>`, `<meta description>`, Open Graph tags, and canonical URL:

| Page | Title | Description |
|------|-------|-------------|
| Homepage | Tailored Tools - AI Integration for Small Businesses | I build AI systems that run businesses. Three live platforms, no jargon. Business automation, agent optimisation, and workshops. |
| Projects | Projects - Tailored Tools | Live AI systems built for real businesses. See how we automated operations for a BSL interpretation agency and a sound therapy practice. |
| Workshops | Workshops & Community - Tailored Tools | Hands-on AI workshops for local businesses and teams. No jargon, no hype - just practical tools that save time. |
| About | About James - Tailored Tools | Business owner turned AI builder. Running three businesses with AI systems, helping others do the same. Based in Maidstone, Kent. |

New pages should include relevant JSON-LD structured data (Organization on homepage, Person on about page) — consistent with the AO offering of making data AI-readable.

---

## Technical Notes

- All pages are static HTML files — no build step, no framework
- Shared CSS in `styles.css` linked from all pages. Page-specific styles in inline `<style>` blocks.
- Nav and footer HTML duplicated per page (no includes on GitHub Pages without Jekyll)
- Tally.so embed stays on AO page only
- Stripe payment link unchanged
- Update sitemap.xml with all new pages
- Update llms.txt with new site structure
- robots.txt unchanged (already welcomes AI crawlers)
- Create `.gitignore` with `.superpowers/` (prerequisite — do this first to avoid committing brainstorm artifacts)

## Out of Scope

- No Jekyll or static site generator — keeping it pure HTML
- No CMS or admin panel
- No contact form beyond existing Tally embed on AO
- No e-commerce beyond existing Stripe link
- PI and SS websites/systems themselves are not changed
- No QR code generation (James will generate separately or we'll add as an image)

## Success Criteria

1. Visitor landing on tailored-tools.com immediately understands James builds AI business systems
2. Projects page with interactive before/after visuals and live system screenshots
3. AO content fully functional at new `/ao/` path with no broken internal links
4. QR links page fits one phone screen and works in a noisy room
5. All pages responsive, consistent nav/footer, same design system
6. Deploys to GitHub Pages with no build step
