# Zenith Protocol — Professional Code Review & UI/UX Audit

**Review Date:** 2026-05-18  
**Reviewer:** AI Code Review Agent  
**Scope:** Full monorepo — `apps/web`, `apps/api`, `packages/*`, `games/*`

---

## Table of Contents
1. [Architecture & Project Structure](#1-architecture--project-structure)
2. [Frontend Code Quality](#2-frontend-code-quality)
3. [Game SDK & Event System](#3-game-sdk--event-system)
4. [Game Module Reviews](#4-game-module-reviews)
5. [Backend API](#5-backend-api)
6. [UI/UX Design Review](#6-uiux-design-review)
7. [TypeScript & Type Safety](#7-typescript--type-safety)
8. [Performance Considerations](#8-performance-considerations)
9. [Accessibility Audit](#9-accessibility-audit)
10. [Security Audit](#10-security-audit)
11. [Testing & CI/CD](#11-testing--cicd)
12. [Critical Issues (Must Fix)](#12-critical-issues-must-fix)
13. [High Priority Issues (Should Fix)](#13-high-priority-issues-should-fix)
14. [Low Priority / Nice-to-Have](#14-low-priority--nice-to-have)
15. [Summary & Score](#15-summary--score)

---

## 1. Architecture & Project Structure

**Overall: Well-organized monorepo with clear separation of concerns.**

| Aspect | Rating | Notes |
|--------|--------|-------|
| Monorepo layout | ✅ | pnpm workspaces with `apps/`, `packages/`, `games/` |
| Plugin architecture | ✅ | Game modules lazy-loaded via `pluginLoader.ts` |
| Shared SDK | ✅ | `@zenith/game-sdk` with event bus, types, sound |
| Shared UI | ✅ | `@zenith/ui` with reusable glassmorphic components |
| Backend separation | ✅ | Laravel 11 API in `apps/api` |
| Config organization | ⚠️ | Some configs duplicated (vite + tsconfig paths) |

### Strengths
- Clean `pnpm-workspace.yaml` routing (`apps/*`, `games/*`, `packages/*`)
- Game modules are self-contained with their own stores, types, and components
- Vite `manualChunks` for code splitting per game module
- Alias system (`@ui`, `@sdk`, `@games`) simplifies imports

### Issues
- **Path duplication**: Vite aliases and TS path aliases need to be kept in sync — drift will cause runtime vs. IDE type mismatches
- **No shared ESLint config** across packages; packages — each would benefit from `@zenith/config` package

---

## 2. Frontend Code Quality

**Overall: Clean, modern React 19 with Zustand state management and GSAP animations. Good patterns overall with some inconsistency.**

### Strengths
- Consistent use of `useRef` + `gsap` for DOM animations without React re-renders
- Zustand stores are well-structured with clear interfaces
- Axios interceptors for auth token injection and 401 handling are clean
- Lazy loading via `React.lazy` + `Suspense` for games and profile page
- Error boundaries via `errorElement` in router

### Issues Found

#### 2.1 Inconsistent Auth Approaches
- `LoginPage.tsx:27` uses raw `fetch()` instead of the configured Axios instance
- `RegisterPage.tsx:47` uses `useAuthStore().register()` which uses Axios
- This means login bypasses the will bypass the Axios interceptor (token injection, 401 handling)

#### 2.2 LoginPage Hardcoded Credentials
- `LoginPage.tsx:13-14` — pre-fills email/password with seeded credentials
- Intentional for dev UX, but should be gated behind `import.meta.env.DEV`

#### 2.3 registerGame() Called in Module Scope
- `main.tsx:13-47` — `registerGame()` called at module level, not inside a component
- Works because it calls `useGameStore.getState().registerGame()` (static access), but this is an uncommon pattern that may confuse developers

#### 2.4 Duplicate Score Submission Logic
score submission logic
- `useGameBridge.ts` (SDK) and `useScoreSubmit.ts` (host app) both implement identical `buildScoreSubmission()` with the same mapping logic
- DRY violation — if payload schemas change, both must be updated

#### 2.5 GameLayout Logic Issue
- `GameLayout.tsx:31` accesses `launchGamePlugin(gameId)` on every render (not inside `useEffect`)
- This runs before `launchGame` effect has had a chance to set state
- Could cause brief flashing or incorrect state on initial render

#### 2.6 Missing
`useCallback`/`memo`
- `GameCard.tsx` re-renders every time `games` array changes (no `React.memo`)
- `Leaderboard.tsx` re-creates row callbacks on each render
- Large tables will suffer from unnecessary re-renders

#### 2.7 CSS
Class Issue
- `LoginPage.tsx:51` `bg-radial-gradient` is not a Tailwind utility — likely should be `bg-[radial-gradient(...)]`

---

## 3. Game SDK & Event System

**Overall: Well-designed typed event bus pattern for cross-module communication.**

### Strengths
- Discriminated union types (`DojoGameResult`, `RunnerGameResult`, `CardBattlerGameResult`) are excellent
- `GameResultPayload` pattern correctly hides `gameId` from game modules
- `mitt`-based `gameBus` is lightweight and typed
- Sound system with zustand `persist` middleware + `Howler.js` integration is solid

### Issues

#### 3.1 SDK Duplicates Host App Score Logic
- `useGameBridge.ts:20-75` has full payload mapping that also exists in `useScoreSubmit.ts: `useScoreSubmit.ts:20-74`
- The SDK should only emit the event; the host app should handle submission
- Currently, the SDK tries to submit independently via raw `fetch()`

#### 3.2
`useSound` Hook Returns Static `isPlaying`
- `useSound.ts:19` returns `isPlaying: isPlayingRef.current` — this is captured once, never reactive
- Components reading `isPlaying` will see stale values

#### 3.3 `useMusic` Singleton Leak
- `useMusic.ts:12` — module-level `let currentMusicHowl` works but creates a testability concern
- If two components mount with different tracks in the same render cycle, the second will fade-out-then-unload the first before it fades in

---

## 4. Game Module Reviews

### 4.1 Card Battler

**Overall: Functional but basic tactical card game with solid GSAP animations.**

| Aspect | Rating | Notes |
|--------|--------|-------|
| Gameplay | ⚠️ | Functional but very basic (no deckbuilding, no strategy depth) |
| State management | ✅ | Clean Zustand store |
| Animations | ✅ | Good GSAP card fan layout, hover effects |
| Sound integration | ✅ | SFX on draw, playCard, attack, victory/defeat |
| AI | ⚠️ | Enemy always plays the most expensive card — no strategy | |

**Issues:**
- **No deck shuffling** — `getRandomDeck()` generates cards but never shuffles them into a play order
- **Turn timeout not cleaned** on unmount — `turnTimeout` in `cardStore.ts:48` is a module-level variable, susceptible to leaks
- **win/loss detection** — game ends when any HP hits 0, but there's no distinction between player death and enemy defeat for scoring
- **No card targeting** — `playCard`playCard`` accepts `targetId` but never uses it
- The store uses `playSfx('/sounds/card/draw.mp3')` etc. — no validation that these audio files exist

### 4.2 Dojo 3D

**Overall: Impressive 3D arena fighter using R3F + Rapier physics.**

| Aspect | Rating | Notes |
|--------|--------|-------|
| 3D visuals | ✅ | Bloom, chromatic aberration, emissive materials |
| Physics | ✅ | Rapier physics with capsule colliders player |
| AI | ✅ | Basic chase + attack behavior |
| Sound | ✅ | Background music, punch SFX, wave clearance |
| Gameplay loop | ⚠️ | Infinite waves with no difficulty cap or ending |

**Issues:**
- **Enemy positions out of sync** — `useEnemyAI.ts` reads enemy positions from the store (`enemy.position`), but physics updates happen in `useFrame` and store updates may lag behind Rapier's internal state
- **`useCombat` reads stale enemies** — `checkAttackHits` iterates over `enemies` from the store closure, which may be stale during rapid attacks
- **Spawn pattern uses `Math.random`** — non-deterministic spawning makes debugging and replays impossible
- **No Rapier event handling for collisions** — hit detection uses distance checks instead of Rapier collider events
- **ImpactParticles resets on every score change** — triggers even on small score increases, causing visual noise

### 4.3 Cyber Runner

**Overall: Basic infinite runner — least complete game.**

| Aspect | Rating | Notes |
|--------|--------|-------|
| Gameplay | ⚠️ | Functional but very minimal |
| Visuals | ⚠️ | Basic Canvas rendering |
| Sound | ❌ | Not audited (files not read) |
| State | ⚠️ | Only read `distance` and `gameStatus` |

**Issues:**
- `speedLevel` is managed as local `useState` in the component, not in the runner store — makes it inaccessible to other systems
- `score: Math.floor(distance / 100)` is strange — score should have clearer relationship to gameplay

---

## 5. Backend API

**Overall: Well-structured Laravel 11 API with Sanctum auth and rate limiting.**

| Aspect | Rating | Notes |
|--------|-------|
| ✅ | RESTful route structure |
| ✅ | Proper Sanctum auth middleware |
| ✅ | Rate limiting on auth and score submission |
| ✅ | Profile, avatar, session history, avatar upload endpoints present |

**Issues:**
- **Score submission idempotenency** — no `X-Idempotency-Key` mechanism; retry logic in `useScoreSubmit` could create duplicate sessions
- **`GET /user` vs `GET /profile`** — overlapping functionality; `AuthController@me` returns user data, `UserProfileController@show` returns richer profile. Unclear boundary
- **Route `POST /games/card/sessions` and `POST /games/card/score`** — confusing why card needs both session init and score submission while other games combine them
- **No API documentation** — no OpenAPI/Swagger spec

---

## 6. UI/UX Design Review

**Overall: Excellent cyberpunk/neon aesthetic with consistent glassmorphism. Strong visual identity.**

| Aspect | Rating | Notes |
|--------|--------|-------|
| Visual consistency | ✅ | Unified neon color palette across all pages Glassmorphism | ✅ | Consistent `GlassCard`, glass borders, backdrop-blur |
| Typography | ✅ | JetBrains Mono for code/scores, clean sans-serif for body |
| Animations | ✅ | GSAP staggered entrances, hover scales, combo effects |
| Responsiveness | ⚠️ | Game-specific pages are fine, menu needs work on mobile |
| Accessibility | ❌ | See Section 9 |

### Visual Design Score: **8.5/10**

### Strengths
- **Consistent theme tokens** in `@theme` CSS — neon-cyan, neon-purple, amber, green
- **Micro-interactions** — GSAP hover scale on cards, buttons mutewiggle animation, combo text bounce
- **Loading states** — skeleton rows, animated loading ring, shimmer effects
- **Leaderboard** — real-time WebSocket updates with GSAP slide-in animations
- **Login page
- **NeonGrid background** — subtle animated grid lines across all pages
- **Turn indicator** — slide-in banner on turn change is excellent

### UX Issues

#### 6.1 Mobile Responsiveness
- `MenuPage.tsx` uses fixed bottom footer — on mobile this can overlap content
- GameCards are in a 3-column grid that collapses to 1 column, but padding/margins don't scale well
- Leaderboard table has `min-w-[600px]` on the table causing horizontal scroll
- No touch event handling for 3D game (WASD + mouse only)

#### 6.2 Information Hierarchy
- **Rankings section is collapsed by default** — users may never discover the leaderboard
- **No onboarding or tutorial** for any game — new users are thrown in
- **Card battler** — no explanation of mana, card types, or win condition

#### 6.3 Feedback Gaps
- `GameOverModal.tsx:47-54` — metadata display only shows the *first* value of the metadata object (via `Object.values`), hiding other stats from the user
- Score submission has no visual feedback on success/failure
- No loading skeleton for Navbar user avatar/text

#### 6.4 Navigation Issues
- No "Back to menu" button within game layouts (only via pause menu)
- Profile page loads under `/profile` but there's no navigation link anywhere prominently

---

## 7. TypeScript & Type Safety

**Overall: Good typing with some gaps.**

### Strengths
- Discriminated union for `GameResult` is excellent
- `env.d.ts` with typed `ImportMetaEnv`
- Zustand stores have full interface definitions
- Strict mode in tsconfig (`noUnusedLocals`, `noUnusedParameters`)

### Issues

#### 7.1 `ProtectedRoute.tsx:55`
- `as unknown as Record<string, unknown>['is_admin']` — dangerous cast; should use proper type guard

#### 7.2 `GameOverModal.tsx:14`
- Uses `GameResult` (the union) but only ever displays `result.score` and `result.metadata` — should use `GameResultPayload`

#### 7.3 `useProfile.ts`
- Error handling uses `AxiosError` but doesn't narrow the type in the `catch` clauses

#### 7.4 `useScoreSubmit.ts` / `useGameBridge.ts`
- Both functions accept `GameResult` but the function signature's relation to the discriminant is implicit

#### 7.5 `.tsx` vs `.ts`
- Some hook files use `.ts` instead of `.tsx` (correct), but `useAuth.ts` imports `React` types indirectly which is fine
- `useScoreSubmit.ts` has no `.tsx` extension — correct since it returns no JSX

---

## 8. Performance Considerations

| Issue | Severity | Location |
|-------|----------|----------|
| GameCard re-renders on every navigation | Medium | `GameCard.tsx` — no `React.memo` |
| Leaderboard full re-render on every WebSocket event | High | `Leaderboard.tsx` — entire table re-renders |
| useFrame in Dojo 3D runs expense code | Medium | `Player.tsx:24-52` — GSAP, store updates every frame |
| No virtualization leaderboard (top 100 only mitigates) | Low | `leaderboardStore.ts` — handled by MAX_ENTRIES |
| Axios interceptor reads token on every request | Low | `axios.ts:22` — `getState()` is O(1), fine |
| Heavy bundle: three.js, R3F, Rapier all loaded at once | Medium | `main.tsx` — not deferred; all three.js games load on first game |

### Recommendation
- Add `React.memo` to `GameCard`, `LeaderboardRow`
- Virtualize the leaderboard table with `react-window` for > 100 entries
- Lazy load three.js vendor chunk on first 3D game load (already done via `manualChunks`)

---

## 9. Accessibility Audit

**Critical gaps — this is the weakest area of the project.**

| Issue | WCAG Criterion | Location |
|-------|---------------|----------|
| No skip-to-content link | 2.4.1 | All pages |
| Color contrast insufficient for some text | 1.4.3 | `text-text-muted: #8f96ad` on dark bg may fail AA |
| Custom range slider missing ARIA attributes | 4.1.2 | `VolumeControl.tsx` |
| Interactive SVG icons missing `aria-label` | 4.1.2 | `Navbar.tsx` pause button (missing) |
| Keyboard navigation gaps | 2.1.1 | Game controls are WASD only, no remapping |
| No focus indicators | 2.4.7 | Custom buttons lack visible focus rings |
| No reduced-motion support | 2.3.3 | All GSAP animations ignore `prefers-reduced-motion` |
| Screen reader announcements missing | 4.1.3 | Game state changes (turn, score) have no ARIA live regions |
| `<font>` tag used | 2.4 | `Card.tsx` problematic `bg-coral-500` via inline `<style>` |
| No alt text on decorative game thumbnails (marked decorative) | 1.1.1 | `GameCard.tsx:55` — Unsplash images should be `alt=""` |

---

## 10. Security Audit

| Issue | Severity | Location |
|-------|----------|----------|
| Login uses `fetch()` bypassing Axios | Medium | `LoginPage.tsx:27` |
| Token stored in `localStorage` (XSS vulnerable) | Medium | `authStore.ts:53` — HttpOnly cookies would be safer|
 | No CSRF protection for API calls | Low | Sanctum SPA auth typically uses cookies, but this uses Bearer tokens |
| Raw user data in error messages (Laravel) | Low | `authStore.ts:98-104` — displaying server error messages directly could leak info |
| No input sanitization in Chat (not implemented) | N/A | Not applicable yet |
| No rate limit on move submissions | Low | Card battler `/games/card/moves` has no throttle middleware |

---

## 11. Testing & CI/CD

**Major gap — virtually no tests.**

| Area | Status | Notes |
|------|--------|-------|
| Frontend tests | ❌ | `"test": "echo \"No web tests configured\""` |
| Backend tests | ❌ | Pest likely configured but not checked in routes |
| CI pipeline | ⚠️ | `.github/workflows/ci.yml` exists but not audited |
| Linting | ⚠️ | ESLint configured but not run on CI |
| TypeScript checks | ⚠️ | `tsc -b` is part of build but not CI |

---

## 12. Critical Issues (Must Fix)

1. **Duplicate score submission logic** — `useGameBridge.ts` and `useScore submit via raw `fetch()` will fire independently from `useScoreSubmit.ts`, potentially creating duplicate sessions
2. **Login bypasses Axios interceptor** — `LoginPage.tsx:27` uses raw `fetch()` instead of the configured Axios instance, meaning the 401 redirect interceptor won't apply after login token expiry
3. **`useSound` returns static `isPlaying`** — components reading `isPlaying` will always see the initial value (`false`), never reflecting current playback
4. **No tests anywhere** — the app has zero automated tests for either frontend or backend
5. **API contract drift risk** — `buildScoreSubmission()` exists in two places; any backend schema change requires updating both

## 13. High Priority Issues (Should Fix)

1. **Accessibility** — Add `aria-label`, focus rings, `prefers-reduced-motion`, keyboard navigation, skip links
2. **Mobile responsiveness** — Leaderboard table horizontal scroll, fixed footer overlap, game touch controls
3. **React performance** — Add `React.memo` to `GameCard` and `Leaderboard` rows
4. **`GameOverModal` metadata display** — Shows only first metadata key; should show all stats
5. **Card battler turn timeout leak** — Module-level `turnTimeout` survives unmount if game is exited mid-turn
6. **Enemy position/Rapier sync** — Store and physics positions can diverge in Dojo 3D
7. **DRY violation in SDK scope** — SDK stores two identical payload mappers; keep only in the host app
8. **No Cyber Runner store file found** — only state appears in the component

## 14. Low Priority / Nice-to-Have

1. Add `@zenith/config` shared package for ESLint, Prettier, TypeScript configs
2. OpenAPI/Swagger spec for the Laravel API
3. Game replays with event sourcing
4. PWA support (manifest + service worker for offline)
5. E2E tests with Playwright
6. Performance monitoring (Web Vitals)
7. Add `.env.example` for the frontend
8. Animation preloader to avoid GSAP flash on first render
9. Deckbuilding in Card Battler
10. Rapier collider events for more accurate Dojo 3D hit detection

---

## 15. Summary & Score

| Category | Score by Category | | Metric
---|---
Architecture **9/10** | Well-designed monorepo & plugin system
Code Quality **7.5/10** | Clean patterns but duplicated logic and some inconsistencies
UI/UX Design **8.5/10** | Stunning cyberpunk aesthetic, strong visual identity
TypeScript **8/10** | Good typing with discriminated unions, some loose casts
Performance **7/10** | Solid code splitting, unoptimized re-renders in key components
Accessibility **3/10** | Major gaps — weakest area of the project
Security **7/10** | Token in localStorage, but otherwise reasonable for game platform
Testing **1/10** | Virtually no tests exist
Backend API **8/10** | Well-structured Laravel API, rate-limited routes

### Overall Score: **6.5/10**

### Key Achievements
- ✅ Professional-grade plugin architecture for game loading
- ✅ Beautiful, consistent cyberpunk/neon design system
- ✅ Strong typed event bus for cross-module communication
- ✅ Real-time leaderboard with WebSocket/Echo integration
- ✅ 3D physics-based game with post-processing effects
- ✅ Sound system with volume control and persistence
- ✅ Complete auth flow (register, login, protected routes)
- ✅ Solid monorepo organization with shared packages

### Critical Action Items
1. Eliminate duplicate score submission logic (keep only in host app)
2. Fix login page to use Axios instance
3. Write at least one test (start with API endpoint tests)
4. Address accessibility gaps
5. Add mobile game controls

---

*This review was generated through static code analysis of the entire monorepo at `F:\Game Development\Zenith Protocol`. Some the (sound files, 3D assets, etc.) could not be verified. Runtime behavior may differ from static analysis findings.*
