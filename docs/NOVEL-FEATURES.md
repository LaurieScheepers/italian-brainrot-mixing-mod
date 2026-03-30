# Novel Feature Proposals

Prioritised by effort/impact. All features maintain the vanilla JS constraint.

## Shipped Features

These were previously proposed and are now complete:

| Feature | PR | Status |
|---------|-----|--------|
| Collection Persistence | #3 | Shipped (localStorage + IndexedDB) |
| Family Tree Visualisation | #5 | Shipped (js/family-tree.js) |
| Achievement System | #4 | Shipped (12 badges, js/achievements.js) |
| Combo Discovery Book | #4 | Shipped (13 combos, js/combo-book.js) |
| Wiki Mining (100 chars) | #7 | Shipped (60 wiki chars, scripts/mine-wiki.mjs) |
| Multi-Parent Mixing | #3 | Shipped (2-4 parents, progressive unlock) |
| Post-Boss Endless Loop | #8 | Shipped (continue mixing after Final Boss) |
| Character Nicknames | #6 | Shipped (tap name to rename) |
| Collection Sort | #5 | Shipped (newest/fame/tier/alpha) |
| Image Rendering DRY Extract | #3 | Shipped (renderCharacterImage()) |

## Tier 1: Quick Wins (< 1 session each)

### 1. PWA + Offline Mode

**Impact**: High | **Effort**: Low

Add `manifest.json` + service worker. Cache app shell, portraits, and character data. Installable on mobile/tablet. Luka can play offline on his tablet.

Files: `manifest.json`, `sw.js`, update `index.html`.

### 2. Daily Challenge Rotation

**Impact**: Medium | **Effort**: Low

The daily challenge infrastructure exists (date-based seed, banner UI). Add a rotation of challenge types: "Reach Mythic tier in 5 mixes", "Find 3 special combos", "Reach generation depth 8". Show challenge description on the banner.

Files: `js/game.js` (challenge types array, condition checker).

### 3. ESLint + Prettier Config

**Impact**: Low | **Effort**: Low

Add `.eslintrc.json` and `.prettierrc` for code consistency. Integrate into CI. No deps needed at runtime.

Files: `.eslintrc.json`, `.prettierrc`, update `.github/workflows/ci.yml`.

## Tier 2: Medium Features (1-2 sessions)

### 4. Real Audio: Character Name SFX

**Impact**: High | **Effort**: Medium

Record or generate character name audio files for all 40 base characters. The audio system already supports file-based playback (`playCharacterName(id)`). Use Web Speech API as a quick generation method, or commission Luka to record them.

Files: `assets/audio/names/*.mp3`, update `js/audio.js` for name file loading.

### 5. Real Audio: Background Music + SFX Files

**Impact**: Medium | **Effort**: Medium

Replace synthesised SFX with actual sound files. Add background music tracks for menu, game, and boss screens. The audio system architecture already supports this (file fallback chain).

Files: `assets/audio/music/*.mp3`, `assets/audio/sfx/*.mp3`.

### 6. Battle Mode

**Impact**: High | **Effort**: Medium

Two collected characters face off. Outcome determined by fame, tier, abilities, and RNG. Winner gains XP. Adds replayability after Final Boss. Luka's direct request: "What if you could FIGHT the characters?"

Files: `js/battle.js` (new module), battle screen in `index.html`.

### 7. Sound Board Mode

**Impact**: Medium | **Effort**: Low

After Final Boss / Infinity Coins, a Sound Board screen where kids tap characters to hear catchphrases and sounds. Pure fun, no gameplay. Depends on real audio files (Feature #4).

Files: `js/game.js` (new screen), `css/styles.css` (grid layout).

## Tier 3: Ambitious (2+ sessions)

### 8. Leaderboard + Persistent High Scores

**Impact**: High | **Effort**: High

Cloud-hosted leaderboard for daily challenges. Requires a lightweight backend (Supabase/Firebase free tier). Show top scores per day, week, and all-time. Player name entry on submission.

Files: `js/leaderboard.js`, server component or BaaS config.

### 9. Multiplayer Challenge Race

**Impact**: Medium | **Effort**: High

WebSocket-based real-time mixing race. Two players get the same seed, race to reach Final Boss first. Requires a server component. Could use Supabase Realtime or a simple Node.js WebSocket server.

Files: `js/multiplayer.js`, server component.

### 10. Accessibility Audit + ARIA

**Impact**: Medium | **Effort**: Medium

Full WCAG AA audit: ARIA labels, keyboard navigation, focus management, skip-to-content link, colour contrast check, screen reader announcements for screen transitions and mix results.

Files: `index.html`, `js/game.js`, `css/styles.css`.

## Luka's Wishlist (from design sessions)

| Request | Feature | Status |
|---------|---------|--------|
| "Can we make a DRAGON that breathes ICE CREAM?" | Drago Gelato Infernale | Shipped |
| "What if you could FIGHT the characters?" | Battle Mode | Tier 2 |
| "I want to see ALL the mixes in a BIG TREE" | Family Tree | Shipped |
| "Can it work on my tablet without internet?" | PWA | Tier 1 |
| "I want to hear them TALK!" | Character Name Audio | Tier 2 |
| "Can we make it so EVERYONE can play together?" | Multiplayer | Tier 3 |

## Phase Roadmap Summary

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1: MVP | 10 chars, mix, fame, boss | Complete |
| Phase 2: AI Images | Gemini, IndexedDB, Parents Zone | Complete |
| Phase 3: Audio | Synth SFX done; real files, names, music remaining | Partial |
| Phase 4: Content | 100 chars done; daily challenge rotation remaining | Partial |
| Phase 5: Social | Share URLs done; leaderboards, high scores remaining | Partial |
| Phase 6: v2 Enhancements | Multi-mix, unlock, achievements, combo book | Complete |
