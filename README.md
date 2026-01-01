# Italian Brainrot Mixing Mod

A web-based character mixing game where you combine Italian Brainrot meme characters to create increasingly powerful hybrid creatures. Become the FINAL BOSS and earn INFINITY COINS!

**Created by Luka (age 4.5) & Pappa (Laurie)**

## Play Now

[Play on GitHub Pages](https://lauriescheepers.github.io/italian-brainrot-mixing-mod/)

## Features

- 10 starter characters from the Italian Brainrot universe
- Drag-and-drop mixing bowl interface
- Fame points and tier progression system
- Mersenne Twister RNG for reproducible mixing ("twenty trillion paths!")
- Become the FINAL BOSS and earn INFINITY COINS
- Parents Zone with content rating settings (kids/pg/pg13)
- Optional AI-generated fusion images via Google Gemini
- Wiki images for base characters

## How to Play

1. **Pick 3 Starters** - Choose your initial brainrot characters
2. **Drag to Mix** - Drop characters into the Mixing Bowl
3. **MIX!** - Create new hybrid characters
4. **Build Fame** - Higher tier combos = more fame points
5. **Become the FINAL BOSS** - Mix enough to achieve ultimate power!
6. **Infinity Coins** - Unlock endgame modes

## Local Setup

### Quick Start

```bash
# Clone the repository
git clone https://github.com/LaurieScheepers/italian-brainrot-mixing-mod.git
cd italian-brainrot-mixing-mod

# Serve locally (Python)
python3 -m http.server 8080

# Or with Node.js
npx serve .

# Open in browser
open http://localhost:8080
```

### Optional: AI Image Generation

To enable AI-generated fusion images when mixing characters:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/)
2. When you first open the game, expand "Advanced: API Key Setup" in the Parents Zone
3. Enter your API key
4. The key is stored locally in your browser (never sent to our servers)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla HTML/CSS/JS (ES Modules) |
| RNG | Mersenne Twister (MT19937) |
| AI Images | Google Gemini API (optional) |
| Image Cache | IndexedDB |
| Hosting | GitHub Pages |

## Project Structure

```
italian-brainrot-mixing-mod/
├── index.html              # Entry point + Parents Zone
├── css/
│   └── styles.css          # Meme aesthetic styling
├── js/
│   ├── mersenne.js         # MT19937 RNG algorithm
│   ├── game.js             # Main game logic
│   ├── characters.js       # Character definitions
│   ├── mixing.js           # Mixing algorithm
│   ├── gemini-api.js       # Google Gemini API wrapper
│   └── image-generator.js  # AI fusion image generation
├── README.md               # This file
├── LICENSE                 # GPL-3.0 License
└── CLAUDE.md               # Development notes
```

## Characters

| Name | Tier | Origin |
|------|------|--------|
| Tung Tung Tung Sahur | MYTHIC | Indonesian |
| Tralalero Tralala | LEGENDARY | Italian |
| Bombardiro Crocodilo | LEGENDARY | Italian |
| Brr Brr Patapim | EPIC | Italian |
| Capuccino Assassino | EPIC | Italian |
| Ballerina Cappuccina | EPIC | Italian |
| Liriliri Larila | RARE | Italian |
| Chimpanzini Bananini | RARE | Italian |
| Glorbo Fruttodrillo | COMMON | Italian |
| Boberto Mortadello | COMMON | Italian |

## Content Ratings

The game offers three content modes selectable in the Parents Zone:

- **Kids** - Cute, colorful, cartoon-style imagery
- **PG** (Recommended) - Classic Italian Brainrot meme aesthetic
- **PG-13** - Maximum absurdity brainrot style

## Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## Credits

- **Game Design**: Luka
- **Development**: Laurie Scheepers
- **RNG Algorithm**: Mersenne Twister from [Qwartel](https://github.com/LaurieScheepers/qwartel)
- **Character Source**: [Italian Brainrot Wiki](https://italianbrainrot.miraheze.org/)

## License

Copyright (c) 2025 Laurie Scheepers

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

See [LICENSE](LICENSE) for details.
