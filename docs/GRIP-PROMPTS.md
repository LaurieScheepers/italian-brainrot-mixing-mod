# GRIP Prompts for Italian Brainrot Mixing Mod

Copy-paste these prompts to execute specific improvements.

## Phase 3: Real Audio - Character Names

```
Add real audio file support for character name playback.

The audio system (js/audio.js) already has playCharacterName(id) that looks
for files at assets/audio/names/{id}.mp3. Currently falls back to synth.

1. Use the Web Speech API to generate .mp3 files for all 40 base character
   names. Create a script: scripts/generate-audio.mjs
2. Each character's catchphrase from characters.js should be spoken
3. Italian accent voice preference if available
4. Update audio.js to preload name audio on game start (lazy, not blocking)
5. Test that synth fallback still works when files are missing
```

## Phase 3: Background Music

```
Add background music tracks using Web Audio API synthesis.

Create 3 procedurally generated music loops in js/audio.js:
1. Menu theme: playful, 120 BPM, major key, 8-bar loop
2. Game theme: energetic, 140 BPM, pentatonic scale, 16-bar loop
3. Boss theme: epic, 160 BPM, minor key with brass-style synth, 16-bar loop

Requirements:
- Use existing Web Audio API oscillators (no external files needed)
- Smooth crossfade between tracks on screen transitions
- Respect existing music toggle control
- Keep each loop under 50 lines to maintain KISS
```

## Phase 4: Daily Challenge Rotation

```
Add rotating daily challenge types to the existing challenge system.

The daily challenge seed already works (date-based hash). Extend it with
challenge objectives:

Challenge types:
1. "Speed Mixer" - reach Final Boss in minimum mixes
2. "Combo Hunter" - find the most special combos in 20 mixes
3. "Tier Climber" - create a Mythic character in 10 or fewer mixes
4. "Deep Diver" - reach generation depth 8
5. "Fame Farmer" - maximise total fame in 15 mixes

Show the active challenge type on the challenge banner.
Track best scores per challenge type in localStorage.
Cycle through types based on day-of-week (seed % 5).
```

## Phase 5: Leaderboard (Supabase)

```
Add a cloud leaderboard using Supabase free tier.

1. Create a Supabase project for italian-brainrot-mixing-mod
2. Table: leaderboard (id, player_name, score, challenge_date, challenge_type,
   mix_count, highest_tier, created_at)
3. Create js/leaderboard.js with:
   - submitScore(name, score, metadata) - POST to Supabase REST API
   - getLeaderboard(date, limit) - GET top scores for a date
   - getWeeklyLeaderboard(limit) - GET top scores for current week
4. Add "SUBMIT SCORE" button on boss screen and endgame
5. Add leaderboard view accessible from starter screen
6. No auth needed - anonymous submissions with rate limiting
7. Supabase anon key is safe to expose (RLS policies protect writes)
```

## Feature: PWA + Offline Mode

```
Make this game a Progressive Web App.

1. Create manifest.json:
   - name: "Italian Brainrot Mixing Mod"
   - short_name: "Brainrot Mix"
   - start_url: "/"
   - display: "standalone"
   - theme_color: "#1a0a2e"
   - background_color: "#1a0a2e"
   - Icons: use existing character portraits (192x192 + 512x512)

2. Create sw.js service worker:
   - Cache app shell (HTML, CSS, JS, data/characters.json)
   - Cache character portraits from assets/images/
   - Network-first for Gemini API calls
   - Cache-first for everything else
   - Version-stamped cache for cache busting

3. Update index.html:
   - Add manifest link
   - Register service worker
   - Add apple-mobile-web-app meta tags
```

## Feature: Battle Mode

```
Create a battle system for collected characters.

Add js/battle.js module:
1. Two characters selected from collection
2. Battle uses Mersenne Twister (seeded by char IDs + timestamp)
3. Stats: Attack (fame-based), Defence (tier-based), Special (ability count)
4. 3-round combat with animated health bars
5. Winner gains +10% fame bonus (saved to collection)
6. Special combo characters get a battle advantage

UI:
- Battle button appears after 10+ characters collected
- Full-screen battle arena with character portraits
- Simple animations (shake on hit, flash on special)
- Victory/defeat screens with fame reward
```

## Quality: Accessibility Audit

```
Audit and fix accessibility issues:

1. Add ARIA labels to all interactive elements (buttons, cards, slots)
2. Add role="button" to character cards
3. Ensure tab order follows visual layout
4. Add keyboard activation (Enter/Space) for all tap targets
5. Add skip-to-content link
6. Ensure colour contrast meets WCAG AA (check tier badge colours)
7. Add aria-live regions for mix results and achievement toasts
8. Make modals trap focus when open
9. Test with VoiceOver on macOS/iOS

Focus on game screen first — that is where most interaction happens.
```

## Quality: ESLint + CI Hardening

```
Add code quality tooling:

1. Create .eslintrc.json:
   - env: browser, es2022
   - sourceType: module
   - Rules: no-unused-vars, no-undef, eqeqeq, semi
   - No framework-specific plugins needed

2. Add to package.json:
   - devDependency: eslint
   - Script: "lint": "eslint js/"

3. Update .github/workflows/ci.yml:
   - Add npm install step (dev deps only)
   - Add lint step before test step
   - Keep existing HTML validation
```
