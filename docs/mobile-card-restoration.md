# Missing mobile-card changes: audit and restoration

## Audit

The starting checkout was clean at merged PR #13 (`b3d2e53`). It had no local stash. The previously named `useMobileCardTransition.ts` / `serviceCardMotion.ts` files were absent both here and in the old pushed branch tip. Consequently this patch reconstructs the previously approved mobile-card requirements; it does **not** recover the exact unavailable historical stash or claim that every earlier uncommitted change was recovered.

Confirmed missing: phone particle-stage removal/full-width cards, selected blue-violet card styling, and shared desktop/touch card transition phases. Older backend/readiness work is not blindly reapplied over current main security fixes.

## Changes

- Extract existing desktop phases and selected `#403E7C` color into `src/lib/serviceCardMotion.ts`. Desktop uses the identical values and choreography.
- Add `useMobileCardTransition`: inert presentation copies use desktop's clipped exit, opaque incoming ink and staggered content phases for mobile selection changes. Native scroll snap, controls, swipe handlers, fit logic and particle master timeline remain intact. The hook cleans on interruption, resize, unmount and reduced-motion changes. It is a reconstruction using shared phase constants, not a claim of exact frame-for-frame historical animation recovery.
- Phone (<768px) particle canvas is not mounted. Tablet canvas remains mounted. Phone cards take the released column; Hero is unchanged.
- Mobile cards share the desktop selected fill and readable light content. No new application dependency.

## Checks

- Frontend TypeScript, lint (existing warnings), production build and diff check passed.
- Real Playwright at 390×844: selected RGB(64,62,124), single-column layout, no Services particle canvas, next/previous selection and presentation-clone cleanup passed; no page errors. Forward/reverse screenshots inspected in `/home/user/mobile-card-qa/`.
- Reduced-motion uses the existing static Services fallback; no page errors.
- 820px tablet: Services shape canvas mounted, visible shape container; no page errors.
- 1440px desktop: desktop reference cards mounted, no mobile stage; no page errors.
- Checks do not certify frame cadence, FPS, physical touch swipe behavior or Safari. Selection tests exercise controls, not physical swipe gestures.

Browser test: `scripts/check-mobile-service-cards.cjs`. External Playwright/Chromium tooling and screenshots are outside application dependencies/Git. This request pushes the patch only; no merge or production deployment is performed.
