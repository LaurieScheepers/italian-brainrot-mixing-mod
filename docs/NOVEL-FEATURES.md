# Novel Feature Proposals

Prioritised by effort/impact for V>> lead. All features maintain the vanilla JS constraint.

## Tier 1: Quick Wins (< 1 session each)

### 1. PWA + Offline Mode

**Impact**: High | **Effort**: Low

Add `manifest.json` + service worker to make the game installable on mobile. Cache all portraits and the app shell. Players can mix offline without network.

Files: `manifest.json`, `sw.js`, update `index.html` with manifest link.

### 2. Collection Persistence

**Impact**: High | **Effort**: Low

Save collection to localStorage on every collect. Resume where you left off. Currently everything resets on page refresh.

Files: `js/game.js` (add save/load to collectResult, init).

### 3. Sound Board Mode

**Impact**: Medium | **Effort**: Low

After unlocking Final Boss / Infinity Coins, add a Sound Board screen where kids can tap characters to hear their catchphrases and sounds. Pure fun, no gameplay.

Files: `js/game.js` (new screen), `css/styles.css` (grid layout).

## Tier 2: Medium Features (1-2 sessions)

### 4. Family Tree Visualisation

**Impact**: High | **Effort**: Medium

Canvas or SVG tree showing mixing genealogy. Each node shows the character, parents linked by edges. Tap a node to see details. Shows generation depth visually.

Files: `js/family-tree.js` (new module), update `game.js` + `styles.css`.

### 5. Achievement System

**Impact**: Medium | **Effort**: Medium

Unlock badges for milestones:
- "First Mix" — complete your first mix
- "Combo Hunter" — find 3 special combos
- "Genealogist" — reach generation depth 5
- "Collector" — collect 15 characters
- "Daily Grinder" — complete 3 daily challenges

Files: `js/achievements.js` (new module), `css/styles.css` (badge styles).

### 6. Battle Mode

**Impact**: High | **Effort**: Medium

Two collected characters face off. Outcome determined by fame, tier, and RNG. Winner gains XP. Adds replayability after Final Boss.

Files: `js/battle.js` (new module), battle screen in `index.html`.

## Tier 3: Ambitious (2+ sessions)

### 7. Wiki Mining Script

**Impact**: High | **Effort**: High

Node script that scrapes italianbrainrot.miraheze.org for all characters, extracts names, species, images, and descriptions. Auto-generates `data/characters.json` with 100+ entries.

Files: `scripts/mine-wiki.mjs`, `data/characters.json`.

### 8. Multiplayer Challenge

**Impact**: Medium | **Effort**: High

WebSocket-based real-time mixing race. Two players get the same seed, race to reach Final Boss first. Requires a small server component.

Files: `js/multiplayer.js`, server component.

## Luka's Wishlist (from design sessions)

These came from Luka directly:

1. "Can we make a DRAGON that breathes ICE CREAM?" — Done (Drago Gelato Infernale)
2. "What if you could FIGHT the characters?" — Battle Mode (Tier 2)
3. "I want to see ALL the mixes in a BIG TREE" — Family Tree (Tier 2)
4. "Can it work on my tablet without internet?" — PWA (Tier 1)
