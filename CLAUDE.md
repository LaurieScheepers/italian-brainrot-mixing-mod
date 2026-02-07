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
| AI Images | Google Gemini (gemini-2.5-flash-image / Nano Banana) |
| Image Cache | IndexedDB |

## How to Play

1. **Pick 3 Starters** - Choose your initial brainrot characters
2. **Drag or Tap to Mix** - Drop characters into the Mixing Bowl (or tap on mobile)
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
│   ├── game.js             # Main game logic + Parents Zone + lightbox + particles
│   ├── characters.js       # Character definitions + wiki URLs + local image paths
│   ├── mixing.js           # Mixing algorithm
│   ├── gemini-api.js       # Google Gemini API wrapper
│   ├── image-generator.js  # AI fusion image generation + IndexedDB cache
│   └── audio.js            # Web Audio API + synthesized SFX
├── scripts/
│   └── generate-portraits.mjs  # Gemini portrait generation (40 characters)
├── assets/
│   ├── images/             # Character portraits (generated via scripts/)
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

## Characters (40 Total)

### Tier Distribution

| Tier | Count | Fame Range |
|------|-------|------------|
| MYTHIC | 4 | 950-1050 |
| LEGENDARY | 8 | 820-900 |
| EPIC | 10 | 600-750 |
| RARE | 8 | 450-530 |
| COMMON | 10 | 270-400 |

### Original 10 (Phase 1)

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

### Phase 4 Additions (30 new)

See `js/characters.js` for full definitions. Highlights include:
- Re Dei Granchi Imperatore (MYTHIC) - The Crab Emperor
- Elefantino Pizzaiolo (LEGENDARY) - Pizza-making elephant
- Serpente Spaghetti Infinito (EPIC) - Spaghetti snake
- Papera Pirata Corsara (RARE) - Pirate duck
- Rospo Gondoliere Veneziano (COMMON) - Venetian gondolier toad

## Special Combos (13 Total)

Predefined recipes with bonus fame:

| Combo | Result | Bonus Fame |
|-------|--------|------------|
| Tung Tung + Bombardiro | Tungbardiro Skybasher | +500 |
| Tralalero + Capuccino | Tralaccino Sharksassin | +400 |
| Brr Brr + Ballerina | Brrlerina Frostpim | +350 |
| Elefantino + Drago Gelato | Draghantino Pizzagelato | +450 |
| Squalo Volante + Pinguino | Squaluino Gladiatore Volante | +420 |
| Gatto Astronauta + Riccio Razzo | Gattorazzo Cosmonauta | +400 |
| Re Dei Granchi + Granchio Barbiere | Gran Imperatore Elegantissimo | +380 |
| Serpente Spaghetti + Coccodrillo | Spaghettococco Gelatoso | +350 |
| Polipo DJ + Rana Operista | Poliporana Musicale Supremo | +400 |
| Lupo Espresso + Cavallo Velocista | Lupovallo Turbo Espresso | +380 |
| Vacca Saturno + Giraffa Celeste | Vaccaffa Cosmica Universale | +500 |
| Farfalla Ninja + Fenicottero | Farfallottero Ninja Fashion | +350 |
| Papera Pirata + Rospo Gondoliere | Paperospo Pirata di Venezia | +330 |

## Roadmap

### Phase 1: MVP
- [x] Project setup
- [x] 10 starter characters
- [x] Drag-and-drop mixing (desktop + mobile tap-to-place)
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
- [x] 40 characters (10 original + 30 new)
- [x] 13 special combos (3 original + 10 new)
- [x] Balanced tier distribution
- [x] Gemini-generated character portraits (scripts/generate-portraits.mjs)
- [x] Local image support with fallback chain (generated > local > wiki > emoji)
- [x] Fullscreen image lightbox
- [ ] Wiki mining script for 100+ characters
- [ ] Daily challenges rotation

### Phase 5: Social
- [x] Seed-based share URLs (?seed=&starters=)
- [x] Daily Challenge mode (deterministic date-based seed)
- [x] Challenge banner UI
- [x] Share FAB button
- [x] Toast notifications
- [ ] Leaderboards
- [ ] Persistent high scores

## Social Features

### Share URL Format

```
https://yoursite.com/?seed=1234567890&starters=char1-id,char2-id,char3-id
```

- `seed` - Global RNG seed for reproducible mixing results
- `starters` - Comma-separated character IDs for the 3 starters

### Daily Challenge

- Deterministic seed based on current date: `hash("daily-brainrot-YYYY-M-D")`
- Same 3 starters selected for all players on the same day
- Accessible via "DAILY CHALLENGE" button on starter screen

### Share Flow

1. Player reaches Final Boss OR clicks Share FAB during game
2. Share URL generated with current seed + starter IDs
3. Web Share API used if available, otherwise clipboard copy
4. Toast notification confirms share action

## Tech Notes

### AI Image Generation

Uses Google Gemini to generate fusion images when mixing:

- **Primary model**: `gemini-2.5-flash-image` (Nano Banana)
- **Fallback model**: `gemini-2.0-flash-exp-image-generation` (auto on 404)

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
- Tap-to-place for mobile (no drag-drop needed)
- Desktop drag-and-drop with child element fix

### Character Portrait Generation

Generate all 40 character portraits locally using Gemini:

```bash
# Add your API key to .env
echo "GEMINI_API_KEY=your-key" > .env

# Generate all portraits (~4 min, rate limited)
node scripts/generate-portraits.mjs
```

- Outputs to `assets/images/{character-id}.png`
- Idempotent: skips existing images
- Fallback model on 404
- Prompts reference Italian Brainrot meme universe

### Image Priority Chain

```
generatedImage (AI fusion) > localImage (portrait) > wikiImageUrl > emoji
```

### Tap-to-Place (Mobile)

Mobile users can't drag-and-drop reliably. Instead:
1. Tap a character card (green glow indicates selection)
2. Tap an empty mix slot (pulsing green glow)
3. Card is placed in slot
4. Tap same card again to deselect

### Lightbox

Click/tap any character image to view fullscreen:
- 90vw/75vh max size
- Close via backdrop click, X button, or Escape key
- Gold border with caption

### Visual Enhancements

- Glassmorphism cards (backdrop-filter blur)
- Animated tier borders (legendary rotates, mythic dual-glow, epic shimmer)
- Animated background gradient blobs with hue-rotate
- Particle burst on mix success (tier-colored, gold for special combos)
- Screen transitions (fade up/down)
- Loading spinner during Gemini image generation

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
