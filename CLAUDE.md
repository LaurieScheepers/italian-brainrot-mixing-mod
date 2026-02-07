# Italian Brainrot Mixing Mod

> Created by Luka & Pappa (Laurie)
> Powered by CIPS + ut++ mode

## Quick Reference

| Attribute | Value |
|-----------|-------|
| Type | Web Browser Game |
| Stack | Vanilla HTML/CSS/JS (ES Modules) |
| RNG | MersenneTwister (from Qwartel) |
| Source | italianbrainrot.miraheze.org |
| AI Images | Google Gemini (gemini-2.0-flash-preview-image-generation) |
| Image Cache | IndexedDB |

## How to Play

1. **Pick 3 Starters** - Choose your initial brainrot characters
2. **Drag to Mix** - Drop characters into the Mixing Bowl
3. **MIX!** - Create new hybrid characters
4. **Build Fame** - Higher tier combos = more fame points
5. **Become the FINAL BOSS** - Mix enough to achieve ultimate power!
6. **Infinity Coins** - Unlock endgame modes

## Running Locally

```bash
# From project directory
python3 -m http.server 8080

# Or with Node
npx serve .

# Then open http://localhost:8080
```

## File Structure

```
italian-brainrot-mixing-mod/
├── index.html              # Entry point + Parents Zone
├── CLAUDE.md               # This file
├── .env.example            # API key template
├── .gitignore              # Git ignore rules
├── css/
│   └── styles.css          # Meme aesthetic + Parents Zone styling
├── js/
│   ├── mersenne.js         # MT19937 RNG (from Qwartel)
│   ├── game.js             # Main game logic + Parents Zone flow
│   ├── characters.js       # Character definitions + wiki URLs
│   ├── mixing.js           # Mixing algorithm
│   ├── gemini-api.js       # Google Gemini API wrapper
│   ├── image-generator.js  # AI fusion image generation + IndexedDB cache
│   └── audio.js            # Web Audio API + synthesized SFX
├── assets/
│   ├── images/             # Character meme images
│   │   └── generated/      # AI-generated fusion images (gitignored)
│   ├── audio/              # Sound files (optional, synth fallback)
│   │   ├── names/          # Character name audio
│   │   ├── music/          # Background music
│   │   └── sfx/            # Sound effects
│   └── ui/                 # UI elements
└── data/
    └── characters.json     # Extended character database (TODO)
```

## Game Mechanics

### Mixing Algorithm

Uses Mersenne Twister for reproducible, seeded mixing:

```javascript
// Same characters + same seed = same result
const mixSeed = hashCombine(char1.id, char2.id, globalSeed);
const rng = new MersenneTwister(mixSeed);
```

### Tier System

| Tier | Multiplier | Colour |
|------|------------|--------|
| Common | 1.0x | Grey |
| Rare | 1.5x | Blue |
| Epic | 2.0x | Purple |
| Legendary | 3.0x | Orange |
| Mythic | 5.0x | Pink |

### Fame Calculation

```javascript
fame = (parent1.fame + parent2.fame) / 2 * mixBonus * tierMultiplier
```

### Final Boss Trigger

Achieved when:
- Generation depth >= 5 (5+ mixes deep)
- OR Collection >= 20 characters

## Characters (Phase 1 - 10 Starters)

| Name | Tier | Base Fame | Origin |
|------|------|-----------|--------|
| Tung Tung Tung Sahur | MYTHIC | 1000 | Indonesian |
| Tralalero Tralala | LEGENDARY | 900 | Italian |
| Bombardiro Crocodilo | LEGENDARY | 850 | Italian |
| Brr Brr Patapim | EPIC | 750 | Italian |
| Capuccino Assassino | EPIC | 700 | Italian |
| Ballerina Cappuccina | EPIC | 600 | Italian |
| Liriliri Larila | RARE | 500 | Italian |
| Chimpanzini Bananini | RARE | 450 | Italian |
| Glorbo Fruttodrillo | COMMON | 400 | Italian |
| Boberto Mortadello | COMMON | 350 | Italian |

## Special Combos

Predefined recipes with bonus fame:

| Combo | Result | Bonus Fame |
|-------|--------|------------|
| Tung Tung + Bombardiro | Tungbardiro Skybasher | +500 |
| Tralalero + Capuccino | Tralaccino Sharksassin | +400 |
| Brr Brr + Ballerina | Brrlerina Frostpim | +350 |

## Roadmap

### Phase 1: MVP
- [x] Project setup
- [x] 10 starter characters
- [x] Drag-and-drop mixing
- [x] Fame points
- [x] Final Boss mechanic
- [x] Infinity coins

### Phase 2: AI Images
- [x] Parents Zone consent dialogue
- [x] Content rating system (kids/pg/pg13)
- [x] Gemini API integration
- [x] IndexedDB image caching
- [x] Wiki image URLs for base characters
- [x] AI-generated fusion images
- [x] Fallback to emojis when no API key

### Phase 3: Audio (Current)
- [x] Web Audio API sound manager (js/audio.js)
- [x] Synthesized SFX fallback (no audio files needed)
- [x] Audio controls UI (music/SFX toggles)
- [x] Character selection sounds
- [x] Drop in bowl sounds
- [x] Mixing swirl sounds
- [x] Success/special combo jingles
- [x] Final Boss fanfare
- [x] Error sounds (same character in both slots)
- [ ] Real audio file support (assets/audio/)

### Phase 4: Content
- [ ] Wiki mining script
- [ ] 100+ characters
- [ ] More special combos
- [ ] Daily challenges

### Phase 5: Social
- [ ] Leaderboards
- [ ] Share functionality
- [ ] Seed-based challenges

## Tech Notes

### AI Image Generation

Uses Google Gemini to generate fusion images when mixing:

```javascript
// Content rating affects image style
const STYLE_PROMPTS = {
    kids: 'Cute, colorful, cartoon-style...',
    pg: 'Classic Italian Brainrot meme aesthetic...',
    pg13: 'Maximum absurdity brainrot aesthetic...'
};
```

**API Setup:**
1. Get API key from https://aistudio.google.com/
2. Enter in Parents Zone (Advanced section)
3. Key saved to localStorage

**Caching:**
- Generated images cached in IndexedDB
- Cache key = sorted parent IDs
- No regeneration for same combinations

### Audio System

The audio system uses Web Audio API with synthesized fallback sounds:

**Audio Events:**
- `playSelect()` - Character selected on starter screen
- `playDrop()` - Character dropped in mixing bowl
- `playMixing()` - Mixing in progress (swirl sound)
- `playSuccess()` - Mix complete (C major chord)
- `playSpecialCombo()` - Special combo detected (arpeggio)
- `playFinalBoss()` - Become the Final Boss (epic fanfare)
- `playCollect()` - Add to collection
- `playError()` - Invalid action (e.g., same character twice)
- `playCharacterName(id)` - Speak character name (requires audio files)

**Audio Files (Optional):**
```
assets/audio/
├── music/
│   ├── menu-theme.mp3
│   ├── game-theme.mp3
│   └── boss-theme.mp3
├── sfx/
│   ├── select.mp3
│   ├── drop.mp3
│   ├── mixing.mp3
│   ├── success.mp3
│   ├── special-combo.mp3
│   ├── final-boss.mp3
│   ├── collect.mp3
│   └── error.mp3
└── names/
    ├── tung-tung-tung-sahur.mp3
    ├── bombardiro-crocodilo.mp3
    └── ... (one per character)
```

If audio files don't exist, synthesized sounds play instead.

### Parents Zone

First-time flow:
1. Select content rating (kids/pg/pg13)
2. Optionally add Gemini API key
3. Proceed to starter selection

Returning users skip directly to game.

### Why Mersenne Twister?

From Qwartel (Pappa's Afrikaans Wordle game):
- Period: 2^19937-1 (astronomically large)
- Reproducible: Same seed = same results
- Fast: ~10ns per random number
- "Twenty trillion paths" as Luka says!

### Browser Support

- Modern browsers (ES modules)
- Mobile-friendly (responsive CSS)
- Touch events for drag-drop

## Credits

- **Game Design**: Luka (age 4.5)
- **Development**: Laurie Scheepers (Pappa)
- **AI Assistant**: CIPS (Claude Code)
- **RNG**: Mersenne Twister from Qwartel
- **Characters**: italianbrainrot.miraheze.org

## Luka's Vision

> "We are going to make a game where you MIX characters to make MORE POWERFUL ones.
> And then you can mix the mixes! And then you become the FINAL BOSS!
> And you get INFINITY COINS because infinity is the BEST!"

---

*Built with love, ut++ mode, and Italian Brainrot energy*

⛓⟿∞
