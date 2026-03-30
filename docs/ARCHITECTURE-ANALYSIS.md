# Architecture Analysis

## Overview

Italian Brainrot Mixing Mod is a static single-page web game built with vanilla HTML/CSS/JS (ES Modules). No build step, no bundler, no framework. Served directly from any static file server.

**Version**: 2.2 (post-boss endless loop)
**Total LOC**: ~8,069 across 16 source files
**Characters**: 100 (40 base + 60 wiki-mined)
**Tests**: 39 Goodhart-protected mixing algorithm tests

## Component Map

```
index.html (entry point, 4 screens — 188 LOC)
    |
    +-- js/game.js (orchestrator — 1,508 LOC)
    |       manages: screens, drag/drop, tap-to-place, lightbox, state
    |       persistence, progressive unlock, achievement triggers, modals
    |
    +-- js/characters.js (data layer — 680 LOC)
    |       40 base character definitions, tier system, fame calculation
    |       async wiki character loading (60 chars from data/characters.json)
    |
    +-- js/mixing.js (core algorithm — 349 LOC)
    |       MT-seeded mixing, 8 naming strategies, 13 special combos
    |       2-4 parent support, order-independent determinism
    |
    +-- js/mersenne.js (RNG — 76 LOC)
    |       MT19937 from Qwartel, deterministic seeded output
    |
    +-- js/gemini-api.js (external API — 293 LOC)
    |       Gemini image generation, rate limiting, key obfuscation
    |       Primary: gemini-2.5-flash-image, Fallback: 2.0-flash-exp
    |
    +-- js/image-generator.js (caching layer — 270 LOC)
    |       IndexedDB cache, blob URL conversion, fallback images
    |
    +-- js/audio.js (sound system — 503 LOC)
    |       Web Audio API synth, file-based fallback, music controls
    |       SFX: select, drop, mixing, success, special, boss, collect, error
    |
    +-- js/achievements.js (badge system — 84 LOC)
    |       12 achievements, localStorage persistence, gallery modal
    |
    +-- js/combo-book.js (discovery tracker — 93 LOC)
    |       13 special combos with hints and discovery state
    |
    +-- js/family-tree.js (lineage viewer — 75 LOC)
    |       Mix genealogy visualisation, generation depth display
    |
    +-- css/styles.css (presentation — 1,843 LOC)
    |       glassmorphism, tier animations, responsive, lightbox
    |       result area fixed overlay, achievement/combo modals
    |
    +-- data/characters.json (wiki-mined — 1,206 LOC)
    |       60 characters auto-generated from MediaWiki API
    |
    +-- scripts/generate-portraits.mjs (tooling — 188 LOC)
    |       Gemini-powered character portrait generation
    |
    +-- scripts/mine-wiki.mjs (tooling — 503 LOC)
            MediaWiki API mining, tier auto-assignment, NSFW filtering
```

## Data Flow

```
User picks 3 starters
    -> state.collection populated
    -> drag/tap to mixing bowl slots (2-4 via progressive unlock)
    -> mixCharacters([parents], seed)
        -> MersenneTwister(hashCombine(sortedIds, seed))
        -> deterministic name (8 strategies), tier, fame, abilities
    -> checkSpecialCombo(char1, char2)
        -> 13 predefined recipes with bonus fame
    -> (optional) Gemini image generation
        -> check IndexedDB cache first
        -> generate via API if miss, cache result
    -> showResult() with particle burst + tier-coloured animation
    -> collectResult() adds to collection + saveGameState()
    -> checkAchievements() on every mix
    -> check Final Boss (depth >= 5 OR collection >= 20)
    -> post-boss: endless mixing loop (continue mixing with full collection)
```

## State Management

Single `state` object in `game.js` (module-scoped, not global):

```javascript
{
    screen, contentRating, selectedStarters, collection,
    totalFame, totalCoins, mixCount, maxSlots, globalSeed,
    mixSlots, lastResult, isFinalBoss, geminiConfigured,
    isChallenge, challengeSeed, specialCombosFound,
    highestTierCreated, lastMixParentCount, collectionSort
}
```

No state management library. Direct mutation + manual re-render via `renderCollection()` and `updateStats()`. Appropriate for the app's complexity.

## Module Dependency Graph

```
game.js
  +-- characters.js (data, no deps)
  +-- mixing.js
  |     +-- mersenne.js (no deps)
  |     +-- characters.js
  +-- mersenne.js
  +-- gemini-api.js (no deps)
  +-- image-generator.js
  |     +-- gemini-api.js
  +-- audio.js (no deps)
  +-- achievements.js (no deps)
  +-- combo-book.js (no deps)
  +-- family-tree.js (no deps)
```

No circular dependencies. Clean DAG.

## Persistence Model

| Storage | Key | Data | Purpose |
|---------|-----|------|---------|
| localStorage | `brainrot_save` | Collection, fame, coins, mixCount, seed, starters | Game state resume |
| localStorage | `contentRating` | kids/pg/pg13 | Parental control |
| localStorage | `_gk` | Obfuscated API key | Gemini access |
| localStorage | `brainrot_achievements` | Earned badge IDs | Achievement tracking |
| localStorage | `brainrot_combos` | Discovered combo keys | Combo book state |
| localStorage | `brainrot_created` | Player-created characters | Starter pool expansion |
| IndexedDB | `brainrot-images` | Blob URLs | AI-generated fusion images |

## Strengths

1. **Zero runtime dependencies** — no npm, no build, no complexity. Ship the folder.
2. **Deterministic mixing** — MT19937 + sorted IDs means same inputs = same outputs regardless of order. Enables share URLs and daily challenges.
3. **Graceful degradation** — image chain (AI > local > wiki > emoji), synth audio fallback, works without API key.
4. **Parental controls** — content rating gate before gameplay, API key behind details disclosure.
5. **Mobile-first** — tap-to-place system, responsive grid, vertical mixing bowl on small screens.
6. **Efficient caching** — IndexedDB for generated images, localStorage for preferences, no redundant API calls.
7. **Progressive unlock** — 2/3/4 bowl slots at 0/5/15 mixes keeps engagement curve.
8. **Post-boss replayability** — endless mixing loop after Final Boss with full collection access.

## Quality Gaps

| Gap | Severity | Effort | Status |
|-----|----------|--------|--------|
| No PWA / service worker | Medium | Low | TODO |
| No accessibility (ARIA, keyboard nav) | Medium | Medium | TODO |
| No ESLint config | Low | Low | TODO |
| No real audio files (synth-only) | Low | Medium | TODO |
| No daily challenges rotation | Low | Medium | TODO |
| No leaderboards / persistent scores | Low | Medium | TODO |
| innerHTML with template literals | Low | N/A | Acceptable (hardcoded data) |
| No CSP headers | Low | Low | TODO |
| No error boundaries / global handler | Low | Low | TODO |

### innerHTML Risk Assessment

Currently safe because all character data is hardcoded in `characters.js` or loaded from local `data/characters.json`. The `onerror` handlers inject emoji strings from the same trusted sources. Risk would increase if user-generated content is introduced.

Relevant locations:
- `game.js:410` — `card.innerHTML` in createCharacterCard
- `game.js` — `slotElement.innerHTML` in updateSlotDisplay
- `game.js` — `elements.resultCharacter.innerHTML` in showResult
- `game.js` — modal innerHTML in achievement/combo/family-tree views

## External Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Google Fonts | CDN | Bangers + Comic Neue typefaces |
| Gemini API | REST | AI fusion image generation (optional) |
| italianbrainrot wiki | CDN | Character portrait images (fallback) |

All external dependencies are optional. Game works fully offline with emoji fallback.

## Performance Profile

| Metric | Value |
|--------|-------|
| First paint | ~200ms (no build, no bundle) |
| Character load | ~50ms (40 inline + 60 async JSON) |
| Mix calculation | <1ms (MT RNG + hash) |
| Image generation | 2-5s (Gemini API, cached after first) |
| Save/load | <5ms (localStorage JSON) |

## Security Posture

| Area | Status |
|------|--------|
| API key storage | Obfuscated in localStorage (acceptable for client game) |
| XSS surface | innerHTML with trusted data only |
| External requests | Gemini API + wiki CDN only, user-initiated |
| Data exposure | No PII, no server-side, no auth |
