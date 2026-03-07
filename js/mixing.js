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

// Italian brainrot syllable pools for rich name generation
const PREFIXES = ['Tra', 'Bom', 'Brr', 'Cap', 'Glo', 'Ser', 'Pol', 'Dra', 'Squ', 'Tun', 'Fen', 'Gat', 'Lup', 'Ric', 'Pip'];
const MIDDLES = ['lero', 'bardi', 'ccini', 'penti', 'liri', 'fanti', 'razza', 'latte', 'gondo', 'pizza', 'spago', 'morta'];
const SUFFIXES = ['ino', 'ello', 'issimo', 'atore', 'uccio', 'one', 'etto', 'accio', 'oso', 'ante', 'iero', 'otto'];
const CONNECTORS = ['del', 'di', 'della', 'il', 'la', 'lo', 'dei', 'delle'];
const EPITHETS = ['Supremo', 'Magnifico', 'Ultimato', 'Cosmico', 'Infernale', 'Glorioso', 'Turbinante', 'Velocissimo'];

/**
 * Name generation - combine parent names with Italian brainrot style
 * Supports 2-4 parents. Always deterministic via MT RNG.
 */
function generateMixedName(names, rng) {
    // Normalise: accept string pair (legacy) or array
    if (typeof names === 'string') names = [names, arguments[1]];
    if (!Array.isArray(names)) names = [names];

    const allParts = names.map(n => (typeof n === 'string' ? n : '').split(' '));

    const strategies = [
        // Strategy 1: Classic blend (first 60% + last 40%)
        () => {
            const p1 = allParts[0][0] || '';
            const p2 = (allParts[1] || allParts[0])[((allParts[1] || allParts[0]).length - 1)] || '';
            return `${p1.slice(0, Math.ceil(p1.length * 0.6))}${p2.slice(Math.floor(p2.length * 0.4))}`;
        },
        // Strategy 2: Blend first words at midpoints
        () => {
            const w1 = allParts[0][0] || '';
            const w2 = (allParts[1] || allParts[0])[0] || '';
            const mid = Math.floor(w1.length / 2);
            const lastWord = (allParts[1] || allParts[0])[(allParts[1] || allParts[0]).length - 1] || '';
            return `${w1.slice(0, mid)}${w2.slice(Math.floor(w2.length / 2))} ${lastWord}`.trim();
        },
        // Strategy 3: Italian syllable build (rich, 3+ words)
        () => {
            const prefix = PREFIXES[rng.random_int31() % PREFIXES.length];
            const middle = MIDDLES[rng.random_int31() % MIDDLES.length];
            const suffix = SUFFIXES[rng.random_int31() % SUFFIXES.length];
            const connector = CONNECTORS[rng.random_int31() % CONNECTORS.length];
            const p2Last = (allParts[1] || allParts[0])[(allParts[1] || allParts[0]).length - 1] || '';
            return `${prefix}${middle}${suffix} ${connector} ${p2Last}`;
        },
        // Strategy 4: Rhythm preservation
        () => {
            if (allParts[0].length >= 2 && (allParts[1] || allParts[0]).length >= 2) {
                const a = allParts[0];
                const b = allParts[1] || allParts[0];
                return `${a[0].slice(0, 4)}${b[0].slice(-3)} ${a[1].slice(0, 4)}${b[1].slice(-3)}`;
            }
            return `${names[0].slice(0, 5)}${(names[1] || names[0]).slice(-5)}`;
        },
        // Strategy 5: Triple portmanteau (for multi-parent)
        () => {
            const parts = names.map(n => (typeof n === 'string' ? n : '').split(' ')[0] || '');
            const combined = parts.map(p => p.slice(0, Math.ceil(p.length / 2))).join('');
            const suffix = SUFFIXES[rng.random_int31() % SUFFIXES.length];
            return `${combined}${suffix}`;
        },
        // Strategy 6: Italian chain (connector-linked)
        () => {
            const fragments = names.slice(0, 3).map(n => {
                const w = (typeof n === 'string' ? n : '').split(' ')[0] || '';
                return w.slice(0, 4);
            });
            const connector = CONNECTORS[rng.random_int31() % CONNECTORS.length];
            const suffix = SUFFIXES[rng.random_int31() % SUFFIXES.length];
            return `${fragments[0]}${fragments[1] || ''}${suffix} ${connector} ${fragments[2] || EPITHETS[rng.random_int31() % EPITHETS.length]}`;
        },
        // Strategy 7: Epithet style (Name + the + Epithet)
        () => {
            const p1 = allParts[0][0] || '';
            const p2 = (allParts[1] || allParts[0])[0] || '';
            const epithet = EPITHETS[rng.random_int31() % EPITHETS.length];
            return `${p1.slice(0, Math.ceil(p1.length * 0.5))}${p2.slice(-3)} ${epithet}`;
        },
        // Strategy 8: Full Italian brainrot (longest names)
        () => {
            const fragments = names.map(n => {
                const w = (typeof n === 'string' ? n : '').split(' ');
                return w[0]?.slice(0, 3) || '';
            });
            const middle = MIDDLES[rng.random_int31() % MIDDLES.length];
            const suffix = SUFFIXES[rng.random_int31() % SUFFIXES.length];
            const epithet = EPITHETS[rng.random_int31() % EPITHETS.length];
            return `${fragments.join('')}${middle}${suffix} ${epithet}`;
        }
    ];

    const strategyIndex = rng.random_int31() % strategies.length;
    let result = strategies[strategyIndex]();

    // Clean up
    result = result.replace(/\s+/g, ' ').trim();
    result = result.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    return result;
}

/**
 * Merge abilities from all parents (supports 2-4)
 */
function mergeAbilities(parentAbilities, rng) {
    const combined = [...new Set(parentAbilities.flat())];

    // Take 2-5 abilities based on parent count
    const maxAbilities = Math.min(2 + parentAbilities.length, 5);
    const count = 2 + (rng.random_int31() % (maxAbilities - 1));
    const result = [];

    for (let i = 0; i < count && combined.length > 0; i++) {
        const index = rng.random_int31() % combined.length;
        result.push(combined.splice(index, 1)[0]);
    }

    // Chance to generate a new "fusion" ability (higher with more parents)
    const fusionChance = 20 + (parentAbilities.length * 10);
    if (rng.random_int31() % 100 < fusionChance) {
        const prefixes = ['Super', 'Ultra', 'Mega', 'Turbo', 'Hyper'];
        const prefix = prefixes[rng.random_int31() % prefixes.length];
        const baseAbility = result[0] || 'Attack';
        result.push(`${prefix} ${baseAbility}`);
    }

    return result;
}

/**
 * Calculate tier for mixed character (supports 2-4 parent tiers)
 */
function calculateTier(tiers, rng) {
    const tierOrder = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
    const indices = tiers.map(t => tierOrder.indexOf(t));

    // Base tier is the highest parent
    let baseTier = Math.max(...indices);

    // Upgrade chance increases with more parents and matching tiers
    const allMatch = indices.every(i => i === indices[0]);
    const upgradeChance = 15 + (allMatch ? 10 : 0) + ((tiers.length - 2) * 5);
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
 * Mix 2-4 characters into a new one
 * @param {Object|Object[]} parents - Parent characters (2-4), or char1 for legacy 2-arg call
 * @param {Object|number} arg2 - char2 (legacy) or globalSeed
 * @param {number} [globalSeed] - Global game seed for reproducibility
 * @returns {Object} New mixed character
 */
export function mixCharacters(parents, arg2, globalSeed) {
    // Legacy 2-arg support: mixCharacters(char1, char2, seed)
    if (!Array.isArray(parents)) {
        parents = [parents, arg2];
        globalSeed = globalSeed || Date.now();
    } else {
        globalSeed = arg2 || Date.now();
    }

    // Sort parents by ID for order-independent determinism
    parents = [...parents].sort((a, b) => a.id.localeCompare(b.id));
    const sortedIds = parents.map(p => p.id);
    const mixSeed = hashCombine(...sortedIds, globalSeed);

    const rng = new MersenneTwister(mixSeed);

    // Skip first 4 random values for hash mixing (like Qwartel)
    for (let i = 0; i < 4; i++) rng.random_int31();

    // Calculate new tier (all parent tiers)
    const newTier = calculateTier(parents.map(p => p.tier), rng);
    const tierInfo = getTierInfo(newTier);

    // Fame = average of all parents with bonus
    const baseFame = Math.floor(parents.reduce((s, p) => s + p.fameBase, 0) / parents.length);
    const mixBonus = 1 + (rng.random_int31() % 30) / 100;
    const parentCountBonus = 1 + (parents.length - 2) * 0.1; // +10% per extra parent
    const newFame = Math.floor(baseFame * mixBonus * tierInfo.multiplier * parentCountBonus);

    // Generate name from all parent names
    const parentNames = parents.map(p => p.name);
    const name = generateMixedName(parentNames, rng);

    // Pick origin randomly from parents
    const origin = parents[rng.random_int31() % parents.length].origin;

    // Species blend
    const species = parents.map(p => p.species).join('/').slice(0, 40);

    // Emoji blend
    const emoji = blendEmojis(parents[0].emoji, parents[1].emoji, rng);

    return {
        id: `mix-${rng.random_int().toString(16)}`,
        name,
        origin,
        species,
        fameBase: newFame,
        tier: newTier,
        emoji,
        description: `A powerful fusion of ${parentNames.join(' and ')}!`,
        abilities: mergeAbilities(parents.map(p => p.abilities || []), rng),
        audio: {
            name: 'mix-sound',
            catchphrase: parentNames.map(n => n.split(' ')[0]).join(' ') + '!'
        },
        isCombo: true,
        parents: parents.map(p => p.id),
        parentNames,
        generationDepth: Math.max(...parents.map(p => p.generationDepth || 0)) + 1,
        seed: mixSeed,
        createdAt: Date.now()
    };
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
