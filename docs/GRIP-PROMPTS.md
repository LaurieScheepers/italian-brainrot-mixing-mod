# GRIP Prompts for Italian Brainrot Mixing Mod

Copy-paste these prompts to execute specific improvements.

## Quality: Add Tests

```
Add tests for the mixing algorithm in js/mixing.js.

Create tests/test-mixing.js that verifies:
1. mixCharacters() produces deterministic output for same inputs
2. mixCharacters() produces same result regardless of character order (sorted IDs)
3. checkSpecialCombo() finds all 13 predefined combos
4. checkSpecialCombo() returns null for non-special combinations
5. applySpecialCombo() correctly overrides name and adds bonus fame
6. hashString() produces consistent hashes
7. Generated names are non-empty and properly capitalised
8. Tier calculation respects parent tiers

Use the project's ES module format. No test framework needed — assert-based
with a simple runner that can execute via `node --experimental-vm-modules`.
```

## Quality: Add CI

```
Create .github/workflows/ci.yml for this project.

Requirements:
- Trigger on push to main and pull requests
- Node 20
- Run tests (once test runner exists)
- Validate that index.html, all JS files, and CSS parse without errors
- No npm install needed (vanilla JS project)
- Keep it minimal — no deployment, no linting yet
```

## Feature: Collection Persistence

```
Add localStorage persistence for the game collection.

When a player collects a character, save the full collection to localStorage.
On game init, check for saved collection and offer to resume.

Key: 'brainrot_save'
Value: JSON with { collection, totalFame, totalCoins, mixCount, globalSeed, selectedStarters }

Add a "Reset Save" button in the settings/Parents Zone area.
Don't break the share URL flow — if a challenge URL is loaded, start fresh.
```

## Feature: PWA Support

```
Make this game a Progressive Web App.

1. Create manifest.json with:
   - name: "Italian Brainrot Mixing Mod"
   - short_name: "Brainrot Mix"
   - start_url: "/"
   - display: "standalone"
   - theme_color: "#1a0a2e"
   - background_color: "#1a0a2e"
   - Icons from existing character portraits

2. Create sw.js service worker:
   - Cache app shell (HTML, CSS, JS)
   - Cache character portraits from assets/images/
   - Network-first for Gemini API calls
   - Cache-first for everything else

3. Update index.html:
   - Add manifest link
   - Register service worker
   - Add apple-mobile-web-app meta tags
```

## Feature: Family Tree

```
Create a family tree visualisation for mixed characters.

Add a "Family Tree" button to the game screen that opens a canvas overlay
showing the mixing genealogy. Each character is a node with:
- Portrait (or emoji)
- Name
- Generation depth indicator

Parent-child relationships drawn as lines.
Use canvas 2D for rendering. Pan/zoom with touch support.
Tree layout: top-down, base characters at top, mixes below.
```

## Refactor: Extract Image Rendering

```
The image rendering logic (priority chain: generatedImage > localImage >
wikiImageUrl > emoji) is duplicated in 4 places in game.js:

- createCharacterCard() line 292-300
- updateSlotDisplay() line 631-639
- showResult() line 742-749
- becomeFinalBoss() line 827-834

Extract a shared function:
  function renderCharacterImage(char, style = {}) -> string

This returns the HTML string for the image display.
DRY principle — single source of truth for the fallback chain.
```

## Bug Hunt: Accessibility Audit

```
Audit and fix accessibility issues in this game:

1. Add ARIA labels to all interactive elements
2. Add role="button" where needed
3. Ensure keyboard navigation works (tab order, enter to activate)
4. Add skip-to-content link
5. Ensure colour contrast meets WCAG AA
6. Add alt text to all images
7. Announce screen transitions to screen readers
8. Make drag-and-drop accessible (keyboard alternative exists via tap-to-place)

Focus on the game screen as priority — that's where most interaction happens.
```
