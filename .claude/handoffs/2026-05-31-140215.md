---
type: wrap-up
project: /Users/james/Projects/Tailored-Tools/tailored-tools-website
project_name: Tailored Tools website
timestamp: 2026-05-31T02:15:00+01:00
trigger: manual
---

## What We Did
- Repositioned the entire Tailored Tools site from "AI Integration for Small Businesses" to "platforms for specialist businesses" — new hero, meta, services, JSON-LD all updated
- Restructured the homepage Live Projects cards: PI now leads with three-property framing (Main Website + Academy + Events App, 800+ downloads in month one); SS reframed around "run remotely from a phone"
- Bumped PI Events App stats from the older 750+/first-2-weeks figure to the current 800+/first-month figure across homepage, /projects teaser, and /projects/performance-interpreting
- Added new "The wider PI estate" section to /projects/performance-interpreting that explicitly features PI Academy (it was completely missing from the dedicated PI page)
- Reordered /projects so PI teaser leads, SS follows (was the other way round)
- Removed the false "PI OS live" before/after toggle that over-claimed an unbuilt platform — replaced with honest three-property portfolio framing
- Removed the homepage newsletter email-capture section (Kent AI callout already covers community signup)
- Moved "I'm James" brief-about up to sit between testimonial and Kent AI callout, breaking the previous four-dark-sections-in-a-row run
- Drafted the full Claude Design exploration brief and walked James through setup (skip generic Design System, attach Frontend design skill, Hi-fi mode only)
- Answered all six Claude Design clarifying questions (retire orange entirely, mix James photo + placeholders, single page with switcher, characterful fonts per direction, full footer details, build all four to full fidelity)

## Decisions Made
- **Reposition direction**: "I build the platforms specialist businesses run on" — first-person, "platform" framing, "specialist businesses" segmentation. Beats both "agent optimisation" (no leads from it) and "product studio" (too crowded a category)
- **AO survives as a service line**, not the masthead — kept in nav, JSON-LD offerings, schema. Demoted to third service card on homepage
- **PI presented as a portfolio of three live properties**, not a single unified OS — because PI-OS isn't live yet and the earlier site was over-claiming
- **Onizion omitted** from the public site until commercial conversation lands; will add a fourth property card when ready
- **Onizion confidentiality**: not yet named publicly; James doesn't want them on the site
- **Numbers to quote**: 800+ downloads (current truth, replacing the older 750+ in the May 20 commit); 50+ interpreter requests carried forward
- **Claude Design exploration approach**: pure exploration, no commitment, no codebase link, no existing Design System bound — to escape the dated dark-navy + orange + glassmorphism template entirely
- **Drop the orange entirely** in the Claude Design exploration so directions truly differ — can re-introduce later if a winning direction wants it back
- **Build all four directions to full fidelity** for fair comparison rather than two-fully + two-sketches

## Files Changed
- `index.html` — positioning rewrite + service grid reorder + Live Projects card rewrite + stats strip "4 Live Platforms" + JSON-LD description + removed newsletter capture + moved brief-about up
- `projects.html` — meta + hero subtitle + section order swap (PI first, SS second) + new PI teaser stats (800+/Month 1) + SS intro mentions phone framing
- `projects/performance-interpreting.html` — title/meta/og/twitter/JSON-LD all repositioned to "Client Portfolio" + lead broadened + 800+/first-month stats + new "wider PI estate" section featuring PI Academy + Main Website

## Current State
- Site is live at tailored-tools.com with the new positioning. Two commits pushed (6f31aa5 + 5af1104) by Tailored-Tools GitHub account
- Local working tree clean except untracked `.claude/handoffs/` files (older session artefacts)
- Backup branch `backup-local-positioning` still exists locally with a6c55c9 — safe to delete now that the work landed cleanly via the rebased approach
- Claude Design project open at https://claude.ai/design/p/985cb3aa-4ac2-45c4-8b75-94c62ea0df69 — James was about to hit Continue on the six-question clarifier. Generation should be running by the time he picks this back up
- GitHub auth: had to switch from `performinterp` to `Tailored-Tools` account (gh auth switch). Switch resets between commands, may need to re-switch next session

## Blockers
- Waiting on Claude Design to generate the four homepage directions

## Next Steps
- [ ] Review the four Claude Design directions when they come back; pick a winning direction based on headline typography + project card feel + colour temperature
- [ ] Iterate inside the winning direction via inline comments before exporting
- [ ] Export → Handoff to Claude Code → integrate winning direction into the live site
- [ ] Consider whether the winning direction warrants seeding a proper Design System in Claude Design org (high-leverage for PI-OS, SS OS marketing, future client work)
- [ ] Delete `backup-local-positioning` branch once the new design lands
- [ ] When Onizion conversation lands commercially: add fourth property card to homepage + section to /projects
- [ ] Minor: rename JSON-LD `OfferCatalog` "Business Automation" → "Custom Platforms" for SEO consistency (non-user-visible, low priority)
- [ ] Minor: the "↑" placeholder used for "Revenue uplift from increased interpreter requests" stat — swap for a real % or £ figure when one is measurable
