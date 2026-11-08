# Three core services — review notes

## Status and scope

Prepared locally on `arena/7cb08c87-axioms-labs`. No push, PR, merge, or deployment performed. This repository's Git integration automatically deploys PR previews, so opening a PR is deferred until deployment permission is clarified. The current separate working branch satisfies isolation from main.

The pre-existing untracked `src/app/favicon.ico` is unrelated and excluded from this service-change work.

## Audit and proposed plan implemented

The frontend had seven service records, separate navigation/footer/brand catalogs, four-service labels in statistics and controls, and a separate backend catalog/contact allowlist. Keeping these in sync is necessary; merely hiding cards would leave offers, links and forms inconsistent.

Active services, in display order:
1. UI/UX Web Design — `/services/ui-ux-design`
2. Web Development — `/services/web-development`
3. AI Agents — `/services/ai-agents`

Copy emphasizes clear customer journeys, reliable maintainable digital products, and practical automation with guardrails. The design service combines responsive website/landing-page design with UX, prototypes and design systems. Existing UI components, colors, typography, motion curves and particle identities are retained. The service stage now uses three entries, dynamic counters, and per-service scroll distance. Unused particle generators remain internal utilities; they are not published services.

Updated surfaces: service data and alternate brand catalog, homepage cards/statistics, services index/detail pages, menus/footer, contact selections, company/work copy, blog/case-study service categories and related links, metadata and structured data, pricing lookup, backend catalog/capabilities and contact validation. Historical blog URLs, article titles/content, case-study URLs, contact budgets and existing price placeholders remain intact. Historical design labels submitted by cached clients normalize to UI/UX Web Design in the backend.

## SEO route decisions

| URL | Handling |
| --- | --- |
| `/services/ui-ux-design` | Existing URL retained, expanded combined service, self-canonical, active Service schema |
| `/services/web-development` | Existing URL retained, self-canonical, active Service schema |
| `/services/ai-agents` | Existing URL retained, self-canonical, active Service schema |
| `/services/web-designing` | Permanent 308 directly to `/services/ui-ux-design`; internal links updated; redirect source excluded from sitemap |
| `/services/gtm-strategy` | Existing redirect updated to final design destination to avoid a new chain |
| `/services/digital-design` | Equivalent legacy design alias permanently redirects to combined design service |
| `/services/ai-automation` | Equivalent legacy alias permanently redirects to AI Agents |
| `/services/seo-aeo` | User-approved retained informational resource, HTTP 200, self-canonical, index/follow; not an active offer |
| `/services/video-editing` | Same retained informational handling |
| `/services/graphic-design` | Same retained informational handling |

Retained resources explicitly state they are not standalone services and link only to the three current services. They retain crawlable sitemap entries but have no Service or Offer schema, no service form and no promotional listing in service menus/cards. Their breadcrumb markup remains. The services-index ItemList contains only the three active services.

These URL decisions preserve access and consolidate the closely related design pages; they do not guarantee unchanged rankings. Actual index coverage, queries, traffic and backlinks have not been inspected in Search Console. Review those before release and monitor crawl/redirect/indexing results afterward. No request for indexing has been submitted.

## Verification

Passed:
- Frontend and backend TypeScript checks.
- Lint (unrelated existing warnings remain); frontend production build; backend build; diff whitespace check.
- `scripts/check-services-timeline.cjs`: three active particle identities, 1,001 timeline samples, seek hold targets and reverse entry; existing entry/dispersal constants unchanged.
- `scripts/check-three-services.cjs`: exactly three services in index schema; all three detail Service schemas; retained resources HTTP 200, self-canonical, no Service schema; direct 308 design redirects; sitemap destinations; contact dropdown labels; mobile forward/backward through all three cards, disabled end controls and presentation-clone cleanup; no page errors.
- Backend catalog order and schema-only contact payload validation for all three current labels and both historical design labels. No live inquiries submitted.
- Existing mobile-card QA: selected color, single column, no phone Services particle canvas, controls/cleanup; reduced-motion static fallback.
- Normal-motion browser checks at 390, 768 and 1440px: three cards, no removed design links, no horizontal page overflow or page errors. Desktop screenshot inspected; QA images remain outside Git under `/home/user/three-services-*.png`.

Not certified: physical mobile touch behavior, Safari, FPS/performance budgets, exhaustive visual equivalence of every page, live backend email delivery, or search ranking outcomes. Older ad hoc four-service scripts may retain historical assumptions; the new consolidation check and updated timeline test are the relevant acceptance checks for this patch.

## Release notes (only after approval)

Backend and frontend must be released together, with backend accepting the new `UI/UX Web Design` label before the frontend is activated. Creating a PR may trigger automatic Vercel preview builds on connected projects; get explicit permission for that before pushing/opening it. Keep unrelated favicon work out of the service PR. After production approval, verify redirects, all form paths, service catalog endpoint, sitemap, canonical/schema and retained resource pages on the actual domain. Update sitemap revision timestamps to the actual approved publication date rather than inventing a build-time content date.
