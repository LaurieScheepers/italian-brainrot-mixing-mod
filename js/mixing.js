/**
 * Mixing Algorithm for Italian Brainrot Mixing Mod
 * Uses Mersenne Twister for reproducible, seeded mixing
 */

import { MersenneTwister } from './mersenne.js';
import { TIERS, getTierInfo } from './characters.js';

/**
 * Simple hash function to combine character IDs into a seed
 */
export function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Combine multiple values into a single seed
 */
function hashCombine(...values) {
    return values.reduce((acc, val) => {
        const h = typeof val === 'string' ? hashString(val) : val;
        return ((acc << 5) - acc) + h;
    }, 0) >>> 0; // Ensure unsigned 32-bit
}

/**
 * Name generation - combine parent names intelligently
 */
function generateMixedName(name1, name2, rng) {
    // Split names into parts
    const parts1 = name1.split(' ');
    const parts2 = name2.split(' ');

    // Various mixing strategies
    const strategies = [
        // Strategy 1: First part of name1 + Second part of name2
        () => {
            const p1 = parts1[0];
            const p2 = parts2[parts2.length - 1];
            return `${p1.slice(0, Math.ceil(p1.length * 0.6))}${p2.slice(Math.floor(p2.length * 0.4))}`;
        },
        // Strategy 2: Blend first words
        () => {
            const w1 = parts1[0];
            const w2 = parts2[0];
            const mid = Math.floor(w1.length / 2);
            return `${w1.slice(0, mid)}${w2.slice(Math.floor(w2.length / 2))} ${parts2[parts2.length - 1] || ''}`.trim();
        },
        // Strategy 3: Portmanteau style
        () => {
            const w1 = parts1[0];
            const w2 = parts2[parts2.length - 1];
            return `${w1.slice(0, 3)}${w2.slice(-4)}o`;
        },
        // Strategy 4: Keep rhythm (if both have similar structure)
        () => {
            if (parts1.length >= 2 && parts2.length >= 2) {
                return `${parts1[0].slice(0, 4)}${parts2[0].slice(-3)} ${parts1[1].slice(0, 4)}${parts2[1].slice(-3)}`;
            }
            return `${name1.slice(0, 5)}${name2.slice(-5)}`;
        }
    ];

    // Pick strategy based on RNG
    const strategyIndex = rng.random_int31() % strategies.length;
    let result = strategies[strategyIndex]();

    // Clean up the result
    result = result.replace(/\s+/g, ' ').trim();

    // Capitalize first letter of each word
    result = result.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    return result;
}

/**
 * Merge abilities from both parents
 */
function mergeAbilities(abilities1, abilities2, rng) {
    const combined = [...new Set([...abilities1, ...abilities2])];

    // Take 2-4 abilities randomly
    const count = 2 + (rng.random_int31() % 3);
    const result = [];

    for (let i = 0; i < count && combined.length > 0; i++) {
        const index = rng.random_int31() % combined.length;
        result.push(combined.splice(index, 1)[0]);
    }

    // Chance to generate a new "fusion" ability
    if (rng.random_int31() % 100 < 30) {
        const prefixes = ['Super', 'Ultra', 'Mega', 'Turbo', 'Hyper'];
        const prefix = prefixes[rng.random_int31() % prefixes.length];
        const baseAbility = result[0] || 'Attack';
        result.push(`${prefix} ${baseAbility}`);
    }

    return result;
}

/**
 * Calculate tier for mixed character
 */
function calculateTier(tier1, tier2, rng) {
    const tierOrder = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
    const idx1 = tierOrder.indexOf(tier1);
    const idx2 = tierOrder.indexOf(tier2);

    // Base tier is the higher of the two parents
    let baseTier = Math.max(idx1, idx2);

    // Chance to upgrade (20% per matching tier level)
    const upgradeChance = 15 + (idx1 === idx2 ? 10 : 0);
    if (rng.random_int31() % 100 < upgradeChance && baseTier < tierOrder.length - 1) {
        baseTier++;
    }

    return tierOrder[baseTier];
}

/**
 * Blend two emoji/icons
 */
function blendEmojis(emoji1, emoji2, rng) {
    // For MVP, just pick one randomly or create a combo symbol
    const mixEmojis = ['✨', '🔥', '⚡', '💫', '🌟', '💥'];

    if (rng.random_int31() % 100 < 50) {
        return emoji1;
    } else if (rng.random_int31() % 100 < 75) {
        return emoji2;
    } else {
        return mixEmojis[rng.random_int31() % mixEmojis.length];
    }
}

/**
 * Mix two characters into a new one
 * @param {Object} char1 - First parent character
 * @param {Object} char2 - Second parent character
 * @param {number} globalSeed - Global game seed for reproducibility
 * @returns {Object} New mixed character
 */
export function mixCharacters(char1, char2, globalSeed = Date.now()) {
    // Create deterministic seed from character IDs + global seed
    // Sort IDs to ensure same result regardless of order
    const sortedIds = [char1.id, char2.id].sort();
    const mixSeed = hashCombine(sortedIds[0], sortedIds[1], globalSeed);

    const rng = new MersenneTwister(mixSeed);

    // Skip first 4 random values for hash mixing (like Qwartel)
    rng.random_int31();
    rng.random_int31();
    rng.random_int31();
    rng.random_int31();

    // Calculate new tier
    const newTier = calculateTier(char1.tier, char2.tier, rng);
    const tierInfo = getTierInfo(newTier);

    // Calculate fame with bonus for mixing
    const baseFame = Math.floor((char1.fameBase + char2.fameBase) / 2);
    const mixBonus = 1 + (rng.random_int31() % 30) / 100; // 0-30% bonus
    const tierBonus = tierInfo.multiplier;
    const newFame = Math.floor(baseFame * mixBonus * tierBonus);

    // Generate new character
    const newChar = {
        id: `mix-${rng.random_int().toString(16)}`,
        name: generateMixedName(char1.name, char2.name, rng),
        origin: rng.random_int31() % 2 === 0 ? char1.origin : char2.origin,
        species: `${char1.species}/${char2.species}`.slice(0, 30),
        fameBase: newFame,
        tier: newTier,
        emoji: blendEmojis(char1.emoji, char2.emoji, rng),
        description: `A powerful fusion of ${char1.name} and ${char2.name}!`,
        abilities: mergeAbilities(char1.abilities || [], char2.abilities || [], rng),
        audio: {
            name: 'mix-sound',
            catchphrase: `${(char1.audio?.catchphrase || '').split(' ')[0]} ${(char2.audio?.catchphrase || '').split(' ')[0]}!`
        },

        // Mixing metadata
        isCombo: true,
        parents: [char1.id, char2.id],
        parentNames: [char1.name, char2.name],
        generationDepth: Math.max(char1.generationDepth || 0, char2.generationDepth || 0) + 1,
        seed: mixSeed,
        createdAt: Date.now()
    };

    return newChar;
}

/**
 * Calculate if this is a "special" combo (predefined recipe)
 * Returns bonus fame if it's a special combo
 */
export function checkSpecialCombo(char1, char2) {
    const specialCombos = {
        // Original 3 combos
        'tung-tung-tung-sahur+bombardiro-crocodilo': {
            bonusFame: 500,
            specialName: 'Tungbardiro Skybasher'
        },
        'tralalero-tralala+capuccino-assassino': {
            bonusFame: 400,
            specialName: 'Tralaccino Sharksassin'
        },
        'brr-brr-patapim+ballerina-cappuccina': {
            bonusFame: 350,
            specialName: 'Brrlerina Frostpim'
        },
        // Phase 4: 10 new combos
        'elefantino-pizzaiolo+drago-gelato-infernale': {
            bonusFame: 450,
            specialName: 'Draghantino Pizzagelato'
        },
        'squalo-volante-magnifico+pinguino-gladiatore-romano': {
            bonusFame: 420,
            specialName: 'Squaluino Gladiatore Volante'
        },
        'gatto-astronauta-lunare+riccio-razzo-spaziale': {
            bonusFame: 400,
            specialName: 'Gattorazzo Cosmonauta'
        },
        're-dei-granchi-imperatore+granchio-barbiere-elegante': {
            bonusFame: 380,
            specialName: 'Gran Imperatore Elegantissimo'
        },
        'serpente-spaghetti-infinito+coccodrillo-gelataio': {
            bonusFame: 350,
            specialName: 'Spaghettococco Gelatoso'
        },
        'polipo-DJ-discoteca+rana-operista-soprano': {
            bonusFame: 400,
            specialName: 'Poliporana Musicale Supremo'
        },
        'lupo-espresso-velocissimo+cavallo-velocista-turbo': {
            bonusFame: 380,
            specialName: 'Lupovallo Turbo Espresso'
        },
        'la-vacca-saturno-saturnita+giraffa-celeste-astronomica': {
            bonusFame: 500,
            specialName: 'Vaccaffa Cosmica Universale'
        },
        'farfalla-ninja-silenziosa+fenicottero-fashionista': {
            bonusFame: 350,
            specialName: 'Farfallottero Ninja Fashion'
        },
        'papera-pirata-corsara+rospo-gondoliere-veneziano': {
            bonusFame: 330,
            specialName: 'Paperospo Pirata di Venezia'
        }
    };

    const key1 = `${char1.id}+${char2.id}`;
    const key2 = `${char2.id}+${char1.id}`;

    return specialCombos[key1] || specialCombos[key2] || null;
}

/**
 * Apply special combo overrides to a mixed character
 */
export function applySpecialCombo(mixedChar, specialCombo) {
    if (!specialCombo) return mixedChar;

    return {
        ...mixedChar,
        name: specialCombo.specialName,
        fameBase: mixedChar.fameBase + specialCombo.bonusFame,
        isSpecial: true,
        specialBonus: specialCombo.bonusFame
    };
}
