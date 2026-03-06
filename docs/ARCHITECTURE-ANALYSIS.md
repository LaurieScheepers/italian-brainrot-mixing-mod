# Architecture Analysis

## Overview

Italian Brainrot Mixing Mod is a static single-page web game built with vanilla HTML/CSS/JS (ES Modules). No build step, no bundler, no framework. Served directly from any static file server.

## Component Map

```
index.html (entry point, 4 screens)
    |
    +-- js/game.js (orchestrator, 995 LOC)
    |       imports all modules
    |       manages: screens, drag/drop, tap-to-place, lightbox, state
    |
    +-- js/characters.js (data layer, 657 LOC)
    |       40 character definitions, tier system, fame calculation
    |
    +-- js/mixing.js (core algorithm, 288 LOC)
    |       MT-seeded mixing, name generation, special combos
    |
    +-- js/mersenne.js (RNG, 77 LOC)
    |       MT19937 from Qwartel, deterministic seeded output
    |
    +-- js/gemini-api.js (external API, 288 LOC)
    |       Gemini image generation, rate limiting, key obfuscation
    |
    +-- js/image-generator.js (caching layer, 280 LOC)
    |       IndexedDB cache, blob URL conversion, fallback images
    |
    +-- js/audio.js (sound system, 504 LOC)
    |       Web Audio API synth, file-based fallback, music controls
    |
    +-- css/styles.css (presentation, 1201 LOC)
            glassmorphism, tier animations, responsive, lightbox
```

## Data Flow

```
User picks 3 starters
    -> state.collection populated
    -> drag/tap to mixing bowl slots
    -> mixCharacters(char1, char2, seed)
        -> MersenneTwister(hashCombine(ids, seed))
        -> deterministic name, tier, fame, abilities
    -> checkSpecialCombo(char1, char2)
        -> 13 predefined recipes with bonus fame
    -> (optional) Gemini image generation
        -> check IndexedDB cache first
        -> generate via API if miss
        -> cache result
    -> showResult() with particle burst
    -> collectResult() adds to collection
    -> check Final Boss condition (depth >= 5 OR collection >= 20)
```

## Strengths

1. **Zero dependencies** — no npm, no build, no complexity. Ship the folder.
2. **Deterministic mixing** — MT19937 + sorted IDs means same inputs = same outputs regardless of order. Enables share URLs and daily challenges.
3. **Graceful degradation** — image chain (AI > local > wiki > emoji), synth audio fallback, works without API key.
4. **Parental controls** — content rating gate before gameplay, API key behind details disclosure.
5. **Mobile-first** — tap-to-place system, responsive grid, vertical mixing bowl on small screens.
6. **Efficient caching** — IndexedDB for generated images, localStorage for preferences, no redundant API calls.

## Quality Gaps

| Gap | Severity | Effort |
|-----|----------|--------|
| No automated tests | High | Medium |
| No CI/CD pipeline | High | Low |
| No package.json | Medium | Low |
| No linting/formatting | Medium | Low |
| innerHTML with template literals | Medium | Medium |
| No accessibility (ARIA, focus, keyboard nav) | Medium | Medium |
| No PWA / service worker | Low | Medium |
| No error boundaries / global error handler | Low | Low |
| No CSP headers | Low | Low |

### innerHTML Risk Assessment

Currently safe because all character data is hardcoded in `characters.js`. The `onerror` handlers in `createCharacterCard()` and `updateSlotDisplay()` inject emoji strings that come from the same hardcoded data. Risk would increase if character data is loaded from external sources (e.g., wiki mining script, user-generated content).

Relevant locations:
- `game.js:302` — `card.innerHTML` in createCharacterCard
- `game.js:640` — `slotElement.innerHTML` in updateSlotDisplay
- `game.js:751` — `elements.resultCharacter.innerHTML` in showResult
- `game.js:836` — `elements.finalBossDisplay.innerHTML` in becomeFinalBoss

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
```

No circular dependencies. Clean DAG.

## State Management

Single `state` object in `game.js` (module-scoped, not global):

```javascript
{
    screen, contentRating, selectedStarters, collection,
    totalFame, totalCoins, mixCount, globalSeed,
    mixSlots, lastResult, isFinalBoss,
    geminiConfigured, isChallenge, challengeSeed
}
```

No state management library. Direct mutation + manual re-render via `renderCollection()` and `updateStats()`. Appropriate for the app's complexity.

## External Dependencies

| Dependency | Type | Purpose |
|-----------|------|---------|
| Google Fonts | CDN | Bangers + Comic Neue typefaces |
| Gemini API | REST | AI fusion image generation (optional) |
| italianbrainrot wiki | CDN | Character portrait images (fallback) |

All external dependencies are optional — game works fully offline with emoji fallback.
