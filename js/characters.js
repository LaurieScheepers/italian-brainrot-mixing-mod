/**
 * Italian Brainrot Characters Database
 * Source: italianbrainrot.miraheze.org/wiki/List_of_characters
 *
 * Phase 1: 10 starter characters for MVP
 */

// Tier definitions with fame multipliers
export const TIERS = {
    COMMON: { name: 'Common', multiplier: 1.0, color: '#888888' },
    RARE: { name: 'Rare', multiplier: 1.5, color: '#3498db' },
    EPIC: { name: 'Epic', multiplier: 2.0, color: '#9b59b6' },
    LEGENDARY: { name: 'Legendary', multiplier: 3.0, color: '#f39c12' },
    MYTHIC: { name: 'Mythic', multiplier: 5.0, color: '#ff6b9d' }
};

// Wiki image base URL
const WIKI_IMAGE_BASE = 'https://static.wikitide.net/italianbrainrotwiki';

// Base characters from Italian Brainrot wiki
export const BASE_CHARACTERS = [
    {
        id: 'tung-tung-tung-sahur',
        name: 'Tung Tung Tung Sahur',
        origin: 'Indonesian',
        species: 'Tungsten/Wood',
        fameBase: 1000,
        tier: 'MYTHIC',
        emoji: '🪵',
        wikiImageUrl: `${WIKI_IMAGE_BASE}/thumb/f/fa/Tung_tung_tung_sahur.png/300px-Tung_tung_tung_sahur.png`,
        description: 'An anthropomorphic log wielding a baseball bat. The strongest character in the universe!',
        abilities: ['Baseball Bat', 'Giant Gorilla Form', 'Mech Transform'],
        audio: {
            name: 'tung-tung-tung-sahur',
            catchphrase: 'TUNG TUNG TUNG!'
        }
    },
    {
        id: 'bombardiro-crocodilo',
        name: 'Bombardiro Crocodilo',
        origin: 'Italian',
        species: 'Crocodile/Bomber',
        fameBase: 850,
        tier: 'LEGENDARY',
        emoji: '🐊',
        wikiImageUrl: `${WIKI_IMAGE_BASE}/thumb/b/b4/Bombardiro_Crocodilo.png/300px-Bombardiro_Crocodilo.png`,
        description: 'A military bomber plane with a crocodile head. Drops bombs from the sky!',
        abilities: ['Aerial Bombing', 'Sky Chase', 'Crocodile Bite'],
        audio: {
            name: 'bombardiro-crocodilo',
            catchphrase: 'Bombardiro!'
        }
    },
    {
        id: 'tralalero-tralala',
        name: 'Tralalero Tralala',
        origin: 'Italian',
        species: 'Shark',
        fameBase: 900,
        tier: 'LEGENDARY',
        emoji: '🦈',
        wikiImageUrl: `${WIKI_IMAGE_BASE}/thumb/0/0c/Tralalero_Tralala.png/300px-Tralalero_Tralala.png`,
        description: 'A blue shark with elongated leg-fins wearing Nike shoes. The FIRST Italian brainrot!',
        abilities: ['Beach Walk', 'Tralala Dance', 'Shark Attack'],
        audio: {
            name: 'tralalero-tralala',
            catchphrase: 'Tralalero Tralala!'
        }
    },
    {
        id: 'capuccino-assassino',
        name: 'Capuccino Assassino',
        origin: 'Italian',
        species: 'Coffee/Assassin',
        fameBase: 700,
        tier: 'EPIC',
        emoji: '☕',
        wikiImageUrl: `${WIKI_IMAGE_BASE}/thumb/3/3a/Cappuccino_Assasino.png/300px-Cappuccino_Assasino.png`,
        description: 'A deadly coffee cup with assassin skills. Caffeinated murder!',
        abilities: ['Coffee Splash', 'Stealth', 'Caffeine Rush'],
        audio: {
            name: 'capuccino-assassino',
            catchphrase: 'Capuccino!'
        }
    },
    {
        id: 'ballerina-cappuccina',
        name: 'Ballerina Cappuccina',
        origin: 'Italian',
        species: 'Ballerina/Coffee',
        fameBase: 600,
        tier: 'EPIC',
        emoji: '🩰',
        wikiImageUrl: `${WIKI_IMAGE_BASE}/thumb/a/a5/Ballerina_Cappuccina.png/300px-Ballerina_Cappuccina.png`,
        description: 'A graceful dancing coffee. Sister of Tung Tung Tung Sahur.',
        abilities: ['Pirouette Strike', 'Coffee Pour', 'Dance Buff'],
        audio: {
            name: 'ballerina-cappuccina',
            catchphrase: 'Cappuccina!'
        }
    },
    {
        id: 'brr-brr-patapim',
        name: 'Brr Brr Patapim',
        origin: 'Italian',
        species: 'Unknown',
        fameBase: 750,
        tier: 'EPIC',
        emoji: '🥶',
        wikiImageUrl: `${WIKI_IMAGE_BASE}/thumb/e/e2/Brr_Brr_Patapim.png/300px-Brr_Brr_Patapim.png`,
        description: 'A mysterious cold creature. Executed Bombardiro in the Croco-Avian Wars!',
        abilities: ['Freeze Attack', 'Patapim Slam', 'Cold Snap'],
        audio: {
            name: 'brr-brr-patapim',
            catchphrase: 'Brr Brr Patapim!'
        }
    },
    {
        id: 'liriliri-larila',
        name: 'Liriliri Larila',
        origin: 'Italian',
        species: 'Bird/Creature',
        fameBase: 500,
        tier: 'RARE',
        emoji: '🐦',
        wikiImageUrl: `${WIKI_IMAGE_BASE}/thumb/1/17/Liriliri_Larila.png/300px-Liriliri_Larila.png`,
        description: 'A singing bird creature with melodic powers.',
        abilities: ['Song Attack', 'Lullaby', 'Feather Storm'],
        audio: {
            name: 'liriliri-larila',
            catchphrase: 'Liriliri!'
        }
    },
    {
        id: 'chimpanzini-bananini',
        name: 'Chimpanzini Bananini',
        origin: 'Italian',
        species: 'Chimpanzee/Banana',
        fameBase: 450,
        tier: 'RARE',
        emoji: '🦍',
        wikiImageUrl: `${WIKI_IMAGE_BASE}/thumb/c/cf/Chimpanzini_Bananini.png/300px-Chimpanzini_Bananini.png`,
        description: 'A monkey-banana hybrid. Goes bananas in battle!',
        abilities: ['Banana Throw', 'Monkey Business', 'Peel Slip'],
        audio: {
            name: 'chimpanzini-bananini',
            catchphrase: 'Bananini!'
        }
    },
    {
        id: 'glorbo-fruttodrillo',
        name: 'Glorbo Fruttodrillo',
        origin: 'Italian',
        species: 'Fruit/Crocodile',
        fameBase: 400,
        tier: 'COMMON',
        emoji: '🍎',
        wikiImageUrl: null, // No wiki image available yet
        description: 'A fruity crocodile creature. Sweet but deadly!',
        abilities: ['Fruit Blast', 'Crunch', 'Vitamin Boost'],
        audio: {
            name: 'glorbo-fruttodrillo',
            catchphrase: 'Glorbo!'
        }
    },
    {
        id: 'boberto-mortadello',
        name: 'Boberto Mortadello',
        origin: 'Italian',
        species: 'Mortadella/Human',
        fameBase: 350,
        tier: 'COMMON',
        emoji: '🥪',
        wikiImageUrl: null, // No wiki image available yet
        description: 'A walking mortadella sausage. Italian deli nightmare!',
        abilities: ['Meat Slap', 'Sandwich Trap', 'Salami Shield'],
        audio: {
            name: 'boberto-mortadello',
            catchphrase: 'Mortadello!'
        }
    }
];

/**
 * Get all base characters
 */
export function getAllBaseCharacters() {
    return BASE_CHARACTERS;
}

/**
 * Get character by ID
 */
export function getCharacterById(id) {
    return BASE_CHARACTERS.find(c => c.id === id);
}

/**
 * Get tier info
 */
export function getTierInfo(tierName) {
    return TIERS[tierName] || TIERS.COMMON;
}

/**
 * Calculate display fame (base * tier multiplier)
 */
export function calculateDisplayFame(character) {
    const tier = getTierInfo(character.tier);
    return Math.floor(character.fameBase * tier.multiplier);
}
