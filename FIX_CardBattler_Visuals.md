# Card Battler — Visual Overhaul Brief (Spec)

> **Status:** Implementation complete — see `FIX_CardBattler_Visuals_Implementation.md` for the change report.
> **Game:** `@zenith/card-battler`
> **Owner:** Frontend / Visual Polish
> **Last updated:** 2026-06-03

---

## Current State (at start of overhaul)

- Cards are clipped / cut off at the top of the viewport (overflow issue)
- Game board is empty — no visible enemy area, no player area, no play zones
- HUD is barely visible — "Player Hull Integrity" text is dim and overlapping cards
- No clear visual separation between turn phases
- "Spectate Game" button is the only fully visible UI element
- Overall: **layout was broken, board invisible, cards escaping the viewport**

---

## Target Visual Goals

### 1. Layout / Composition

- Proper 3-zone vertical layout:
  - **Top** — Enemy area (portrait + HP bar)
  - **Center** — Battle field (where played cards live)
  - **Bottom** — Player hand (fanned out, fully visible)
- Hand should sit at the bottom of the viewport, fully on-screen
- Battle field in the middle should have a distinct visual identity (holographic arena, neon grid, dark glass)
- Enemy area should show a prominent enemy avatar / portrait + HP bar
- Player area should show player avatar / portrait + HP bar

### 2. Card Design

- Card size: ~140×200px (scaled via Tailwind responsive utilities)
- Card anatomy:
  - Cost gem (top-left, colored by card type)
  - Type icon (top-right)
  - Name (header)
  - Art placeholder (centered, gradient or icon)
  - Description (body)
  - Rarity border (animated for Legendary)
- Rarity color coding:
  - **Common** — gray border
  - **Rare** — blue glow
  - **Epic** — purple glow
  - **Legendary** — gold border + animated sparks
- Glassmorphism frame: `backdrop-blur-md` + `bg-glass` + `border-glass`
- Neon glow per type: cyan / purple / amber / green
- Fan arc: cards spread at -10° to +10° rotation, hover lifts card up + scale 1.15

### 3. HUD Elements

| Element | Position | Style |
|---------|----------|-------|
| Player HP bar | Bottom-left | Neon-green fill, animated width, shake on damage |
| Enemy HP bar | Top-center / right | Neon-red fill |
| Mana crystals | Bottom-center | Gem-shaped, lit = filled, dim = empty, pulse on gain |
| Turn indicator | Top-center | "YOUR TURN" / "ENEMY TURN" sliding banner |
| Deck count | Bottom-left near hand | Number on card-back icon |
| End Turn button | Bottom-right | Neon-cyan, disabled state when enemy turn |

### 4. Color Theme & Background

- **Background base:** `#0a0a0f` (dark, near-black)
- **Background FX:** subtle moving particle / grid effect
- **Neon accents:**
  - Cyan (`#00f5ff`) — player side
  - Red / Purple — enemy side
  - Gold — legendary / victory
  - Green — heal / shield
- **Glass cards:** `backdrop-blur-md`, `bg-glass`, `border-glass`, `rounded-xl`
- **Play zones:** glow softly when a valid card is being dragged over them

### 5. Animations (GSAP)

| Event | Animation |
|-------|-----------|
| Card draw | Slide up from deck with slight rotation |
| Card hover | Lift up + scale 1.15 + neon glow intensifies |
| Card play | Float from hand → board zone with fade-in |
| Card attack | Card slides toward target, target shakes + red flash |
| Card death | Scale down + rotate 90° + fade out |
| Turn switch | Banner slides in from top, enemy cards flip-reveal (rotateY) |
| Mana gain | Gem pulses with neon-cyan flash |
| Mana spend | Gem dims with a quick scale-down |
| HP damage | Bar tweens down smoothly, container shakes |
| HP heal | Bar tweens up with green flash |

### 6. Polish

- Drop shadows on all cards (especially lifted/hovered)
- Glowing borders on hover (type-colored)
- Rarity particles:
  - Legendary = floating gold sparks
  - Epic = subtle purple particles
  - Rare = faint blue shimmer
- Sound feedback already wired in — just needs visual sync
- SFX: card play whoosh, attack impact, mana ding, death thud

---

## Files to Touch

| File | Change |
|------|--------|
| `games/card-battler/src/components/GameBoard.tsx` | Full layout restructure (3 zones) |
| `games/card-battler/src/components/Card.tsx` | Card design polish (rarity, glow, anatomy) |
| `games/card-battler/src/components/PlayerHand.tsx` | Fan arc + hover lift |
| `games/card-battler/src/components/ManaBar.tsx` | Gem crystal visual + pulse on gain |
| `games/card-battler/src/components/TurnIndicator.tsx` | Sliding banner animation |
| `games/card-battler/src/components/EnemyArea.tsx` *(new)* | Enemy portrait + HP bar |
| `games/card-battler/src/components/PlayerArea.tsx` *(new)* | Player portrait + HP bar |
| `games/card-battler/src/components/BattleField.tsx` *(new)* | Center play zone with grid + glow |
| `games/card-battler/src/store/cardStore.ts` | Animation triggers on state changes |
| `apps/web/src/index.css` | New card rarity / theme classes if needed |

---

## Implementation Order

1. **Layout fix** — 3-zone vertical structure (GameBoard.tsx)
2. **Card visual overhaul** — anatomy + rarity borders + glow
3. **Hand fan + hover** — PlayerHand.tsx
4. **Mana crystals** — ManaBar.tsx pulse + dim
5. **HP bars** — Player / Enemy
6. **Turn indicator banner** — slide in/out
7. **Battle field background** — neon grid + glow
8. **Animations** — play, attack, death, draw
9. **Polish** — particles, drop shadows, sound sync

---

## Acceptance Criteria

- [ ] No card or HUD element is clipped by the viewport
- [ ] All 3 zones (enemy / battle / player) are clearly visible and separated
- [ ] Hand is fully visible at the bottom, fanned out
- [ ] Hovering a card lifts it out of the fan
- [ ] Playing a card triggers a smooth GSAP animation
- [ ] HP bars animate on damage
- [ ] Mana gems pulse on gain, dim on spend
- [ ] Turn indicator slides in/out cleanly
- [ ] Legendary cards have an animated gold border / particles
- [ ] Spectator mode renders the same visuals (read-only)
- [ ] No TypeScript errors, no console warnings

---

## Notes

- Tailwind v3 + theme tokens already defined in `apps/web/src/index.css` — reuse them
- GSAP `gsap.context()` for proper cleanup in components
- Respect `spectatorMode` flag from `cardStore` (drag-play disabled, no sound on play)
- Mobile: hand should switch from fan arc → horizontal scroll (already in place)

---

## Related Documents

- **Implementation report:** `FIX_CardBattler_Visuals_Implementation.md` (at repo root)
- **AGENTS.md context:** updated `### @zenith/card-battler` section + new `#### Card Visual System` sub-section
