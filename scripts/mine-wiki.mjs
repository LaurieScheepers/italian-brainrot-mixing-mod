#!/usr/bin/env node

/**
 * Mine characters from the Italian Brainrot wiki
 * Usage: node scripts/mine-wiki.mjs [--dry-run] [--count N] [--fast]
 *
 * Fetches character data from italianbrainrot.miraheze.org,
 * ranks by popularity, auto-assigns tiers, outputs data/characters.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'data', 'characters.json');

const API_BASE = 'https://italianbrainrot.miraheze.org/w/api.php';
const RATE_LIMIT_MS = 1500;
const TARGET_COUNT = parseInt(process.argv.find(a => a.startsWith('--count='))?.split('=')[1] || '60');
const DRY_RUN = process.argv.includes('--dry-run');
const FAST_MODE = process.argv.includes('--fast');

// Existing 40 character IDs (from characters.js) - skip these
const EXISTING_IDS = new Set([
    'tung-tung-tung-sahur', 'bombardiro-crocodilo', 'tralalero-tralala',
    'capuccino-assassino', 'ballerina-cappuccina', 'brr-brr-patapim',
    'liriliri-larila', 'chimpanzini-bananini', 'glorbo-fruttodrillo',
    'boberto-mortadello', 'la-vacca-saturno-saturnita', 'giraffa-celeste-astronomica',
    're-dei-granchi-imperatore', 'elefantino-pizzaiolo', 'squalo-volante-magnifico',
    'drago-gelato-infernale', 'polipo-DJ-discoteca', 'pinguino-gladiatore-romano',
    'lupo-espresso-velocissimo', 'coccodrillo-gelataio', 'gatto-astronauta-lunare',
    'tartaruga-tank-corazzata', 'fenicottero-fashionista', 'riccio-razzo-spaziale',
    'serpente-spaghetti-infinito', 'rana-operista-soprano', 'coniglio-mago-illusionista',
    'papera-pirata-corsara', 'gufo-professore-notturno', 'cavallo-velocista-turbo',
    'farfalla-ninja-silenziosa', 'topo-meccanico-ingegnere', 'lumaca-postino-lentissima',
    'formica-bodybuilder-forte', 'pesce-pagliaccio-comico', 'piccione-detective-misterioso',
    'granchio-barbiere-elegante', 'pecora-cloud-soffice', 'mosca-pizzaiola-fastidiosa',
    'rospo-gondoliere-veneziano'
]);

// Normalised existing names for fuzzy dedup
const EXISTING_NAMES = new Set([
    'tung tung tung sahur', 'bombardiro crocodilo', 'tralalero tralala',
    'capuccino assassino', 'cappuccino assassino', 'ballerina cappuccina',
    'brr brr patapim', 'liriliri larila', 'lirili larila',
    'chimpanzini bananini', 'glorbo fruttodrillo', 'boberto mortadello',
    'la vacca saturno saturnita', 'giraffa celeste astronomica',
    're dei granchi imperatore', 'elefantino pizzaiolo', 'squalo volante magnifico',
    'drago gelato infernale', 'polipo dj discoteca', 'pinguino gladiatore romano',
    'lupo espresso velocissimo', 'coccodrillo gelataio', 'gatto astronauta lunare',
    'tartaruga tank corazzata', 'fenicottero fashionista', 'riccio razzo spaziale',
    'serpente spaghetti infinito', 'rana operista soprano', 'coniglio mago illusionista',
    'papera pirata corsara', 'gufo professore notturno', 'cavallo velocista turbo',
    'farfalla ninja silenziosa', 'topo meccanico ingegnere', 'lumaca postino lentissima',
    'formica bodybuilder forte', 'pesce pagliaccio comico', 'piccione detective misterioso',
    'granchio barbiere elegante', 'pecora cloud soffice', 'mosca pizzaiola fastidiosa',
    'rospo gondoliere veneziano'
]);

// Pages to skip (meta, lists, categories, events, users)
const SKIP_PATTERNS = [
    /^(Main Page|List of|Category:|Template:|User:|File:|Talk:|Help:)/i,
    /^(Italian Brainrot|Brainrot|Characters|Timeline|Events|Locations)/i,
    /\/(Gallery|History|Relationships|Abilities|Variants)$/i,
    /^[\d\s]+Sahur$/i, // Number variants like "10 10 10 Sahur"
    /^@/i, // User pages
    /\bWars?\b/i, // War/Wars articles
    /\bFamily\b/i, // Family articles
    /\b(disambiguation|disgambutation)\b/i, // Disambiguation pages
    /^(Steal|Craft|Beat Up|Plants Vs|Merge|Lucky|Escape|Discussion)/i, // Game/meta pages
    /\b(Tiering System|Great |The Endless|The Void|Revolution|Lottery)\b/i,
    /^(Signal|Elements|Combination|Duos|Pipi|Versions|Number|Fat |Super |BABY)\b/i,
    /\bEdition\b/i,
    /\b(Inanimate Objects|Blue Shoe)\b/i, // Known non-characters
    /(penis|dildo|cock|dick|shit|fuck)/i, // NSFW filter (no word boundary - catch embedded)
];

// Additional name-level filter (applied after infobox extraction)
function isValidCharacterName(name) {
    if (!name || name.length < 3 || name.length > 50) return false;
    if (/^[^a-zA-Z]/.test(name)) return false; // Must start with a letter
    if (/[^\w\s'àèìòùáéíóúâêîôûäëïöüçñ-]/i.test(name)) return false; // Only letters, spaces, hyphens, accents
    if (/^(Vwrege|Zzzzz)/i.test(name)) return false; // Gibberish
    return true;
}

// Tier distribution for N characters
function getTierDistribution(count) {
    return [
        { tier: 'MYTHIC', count: Math.max(1, Math.round(count * 0.05)) },
        { tier: 'LEGENDARY', count: Math.max(2, Math.round(count * 0.15)) },
        { tier: 'EPIC', count: Math.max(3, Math.round(count * 0.25)) },
        { tier: 'RARE', count: Math.max(3, Math.round(count * 0.25)) },
        { tier: 'COMMON', count: 0 } // Remainder
    ];
}

const FAME_RANGES = {
    MYTHIC: [950, 1050],
    LEGENDARY: [820, 900],
    EPIC: [600, 750],
    RARE: [450, 530],
    COMMON: [270, 400]
};

const SPECIES_EMOJI_MAP = {
    shark: '🦈', crocodile: '🐊', bear: '🐻', cat: '🐱', dog: '🐕',
    fish: '🐟', bird: '🐦', frog: '🐸', elephant: '🐘', dragon: '🐉',
    snake: '🐍', penguin: '🐧', monkey: '🐒', horse: '🐎', wolf: '🐺',
    cow: '🐄', lion: '🦁', tiger: '🐯', rabbit: '🐰', duck: '🦆',
    owl: '🦉', turtle: '🐢', spider: '🕷️', bat: '🦇', whale: '🐋',
    octopus: '🐙', crab: '🦀', butterfly: '🦋', bee: '🐝', ant: '🐜',
    mouse: '🐭', pig: '🐷', chicken: '🐔', goat: '🐐', sheep: '🐑',
    snail: '🐌', flamingo: '🦩', hedgehog: '🦔', giraffe: '🦒', hippo: '🦛',
    robot: '🤖', pizza: '🍕', coffee: '☕', ice: '🧊', fire: '🔥',
    bomb: '💣', sword: '⚔️', star: '⭐', moon: '🌙', sun: '☀️',
    car: '🏎️', plane: '✈️', rocket: '🚀', train: '🚂', ship: '🚢',
    dinosaur: '🦕', scorpion: '🦂', squid: '🦑', lobster: '🦞',
    parrot: '🦜', eagle: '🦅', gorilla: '🦍', deer: '🦌',
    fox: '🦊', unicorn: '🦄', wizard: '🧙', ninja: '🥷',
    ghost: '👻', alien: '👽', clown: '🤡', king: '👑',
    pirate: '🏴‍☠️', soldier: '💂', chef: '👨‍🍳',
};

const BRAINROT_ABILITIES = [
    'Meme Blast', 'Pasta Fury', 'Brainrot Beam', 'Italian Rage',
    'Vibe Check', 'Spaghetti Whip', 'Gelato Freeze', 'Pizza Toss',
    'Espresso Rush', 'Opera Scream', 'Gondola Charge', 'Roman Strike',
    'Vespa Chase', 'Tiramisu Trap', 'Colosseum Slam', 'Venice Flood',
    'Parmesan Shield', 'Risotto Rain', 'Cannoli Cannon', 'Bruschetta Bash',
    'Limoncello Splash', 'Focaccia Flip', 'Prosciutto Punch', 'Panettone Pummel',
];

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function toKebabCase(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function normaliseName(name) {
    return name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function isExistingCharacter(title) {
    const id = toKebabCase(title);
    if (EXISTING_IDS.has(id)) return true;
    const normalised = normaliseName(title);
    return EXISTING_NAMES.has(normalised);
}

function shouldSkipPage(title) {
    if (SKIP_PATTERNS.some(p => p.test(title))) return true;
    if (title.includes('/')) return true;
    if (isExistingCharacter(title)) return true;
    return false;
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

// --- API Functions ---

async function fetchJSON(url) {
    const response = await fetch(url, {
        headers: { 'User-Agent': 'ItalianBrainrotMixingMod/1.0 (game; contact@example.com)' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    return response.json();
}

async function fetchAllPages() {
    console.log('Phase 1: Discovering character pages...');
    const pages = [];
    let continueToken = null;

    do {
        const params = new URLSearchParams({
            action: 'query',
            list: 'allpages',
            aplimit: '500',
            apnamespace: '0',
            format: 'json'
        });
        if (continueToken) params.set('apcontinue', continueToken);

        const data = await fetchJSON(`${API_BASE}?${params}`);
        const newPages = data.query.allpages.filter(p => !shouldSkipPage(p.title));
        pages.push(...newPages);
        continueToken = data.continue?.apcontinue;
        console.log(`  Found ${pages.length} candidate pages...`);
    } while (continueToken);

    console.log(`  Total candidates: ${pages.length}`);
    return pages;
}

async function fetchPageInfo(pageIds) {
    // Batch query page sizes (max 50 per request)
    const results = new Map();
    for (let i = 0; i < pageIds.length; i += 50) {
        const batch = pageIds.slice(i, i + 50);
        const params = new URLSearchParams({
            action: 'query',
            pageids: batch.join('|'),
            prop: 'info',
            format: 'json'
        });
        const data = await fetchJSON(`${API_BASE}?${params}`);
        for (const [id, info] of Object.entries(data.query.pages)) {
            results.set(parseInt(id), info);
        }
    }
    return results;
}

function extractInfobox(html) {
    const infoboxMatch = html.match(/<aside class="portable-infobox[\s\S]*?<\/aside>/);
    if (!infoboxMatch) return null;
    const box = infoboxMatch[0];

    const extractField = (source) => {
        const re = new RegExp(`data-source="${source}"[\\s\\S]*?<div class="pi-data-value[^"]*">([\\s\\S]*?)</div>`, 'i');
        const m = box.match(re);
        return m ? m[1].replace(/<[^>]+>/g, '').trim() : null;
    };

    const nameMatch = box.match(/data-source="name"[^>]*>([^<]+)</);
    const titleMatch = box.match(/<h2[^>]*>([^<]+)<\/h2>/);
    const imgMatch = box.match(/src="([^"]*static\.wikitide\.net[^"]*)"/);

    return {
        name: nameMatch?.[1]?.trim() || titleMatch?.[1]?.trim(),
        species: extractField('species') || extractField('type'),
        language: extractField('language') || extractField('origin'),
        imageUrl: imgMatch?.[1] ? (imgMatch[1].startsWith('//') ? 'https:' + imgMatch[1] : imgMatch[1]) : null
    };
}

function extractDescription(html) {
    // Get first paragraph after the infobox
    const afterInfobox = html.replace(/<aside[\s\S]*?<\/aside>/, '');
    const paraMatch = afterInfobox.match(/<p[^>]*>([\s\S]*?)<\/p>/);
    if (!paraMatch) return null;
    const text = paraMatch[1].replace(/<[^>]+>/g, '').trim();
    if (text.length < 10) return null;
    // Take first two sentences max
    const sentences = text.split(/(?<=[.!?])\s+/).slice(0, 2).join(' ');
    return sentences.length > 200 ? sentences.slice(0, 197) + '...' : sentences;
}

async function fetchPageDetail(title) {
    const params = new URLSearchParams({
        action: 'parse',
        page: title,
        prop: 'text',
        format: 'json'
    });

    try {
        const data = await fetchJSON(`${API_BASE}?${params}`);
        if (!data.parse) return null;

        const html = data.parse.text?.['*'] || '';
        const contentLength = html.length;
        const infobox = extractInfobox(html);
        const description = extractDescription(html);

        return {
            title,
            contentLength,
            infobox,
            description,
            hasInfobox: !!infobox
        };
    } catch (err) {
        console.warn(`  Warning: Failed to fetch ${title}: ${err.message}`);
        return null;
    }
}

// --- Character Generation ---

function guessEmoji(species, name) {
    if (!species) species = '';
    const combined = (species + ' ' + name).toLowerCase();
    for (const [keyword, emoji] of Object.entries(SPECIES_EMOJI_MAP)) {
        if (combined.includes(keyword)) return emoji;
    }
    return '🔮'; // Default brainrot mystery emoji
}

function generateAbilities(name, species) {
    const abilities = [];
    const words = name.split(/\s+/).filter(w => w.length > 2);

    // Name-derived ability
    if (words[0]) abilities.push(`${words[0]} Strike`);

    // Species-derived ability
    if (species) {
        const speciesWord = species.split(/[\/,\s]+/)[0].trim();
        if (speciesWord.length > 2) abilities.push(`${speciesWord} Power`);
    }

    // Random brainrot ability based on name hash
    const hash = hashCode(name);
    abilities.push(BRAINROT_ABILITIES[hash % BRAINROT_ABILITIES.length]);

    // Ensure exactly 3
    while (abilities.length < 3) {
        abilities.push(BRAINROT_ABILITIES[(hash + abilities.length) % BRAINROT_ABILITIES.length]);
    }

    return abilities.slice(0, 3);
}

function mapOrigin(language) {
    if (!language) return 'Italian';
    const lower = language.toLowerCase();
    const map = {
        italian: 'Italian', indonesian: 'Indonesian', turkish: 'Turkish',
        spanish: 'Spanish', portuguese: 'Portuguese', russian: 'Russian',
        english: 'English', french: 'French', german: 'German',
        japanese: 'Japanese', korean: 'Korean', chinese: 'Chinese',
        arabic: 'Arabic', hindi: 'Hindi', polish: 'Polish',
        dutch: 'Dutch', swedish: 'Swedish', norwegian: 'Norwegian',
    };
    for (const [key, value] of Object.entries(map)) {
        if (lower.includes(key)) return value;
    }
    return 'Italian';
}

function buildCharacter(detail, rank) {
    const infobox = detail.infobox || {};
    const name = infobox.name || detail.title;
    const id = toKebabCase(name);
    const species = infobox.species || 'Unknown';
    const origin = mapOrigin(infobox.language);
    const emoji = guessEmoji(species, name);
    const description = detail.description || `A mysterious ${species} creature from the Italian Brainrot universe.`;

    return {
        id,
        name,
        origin,
        species,
        fameBase: 0, // Assigned later by tier
        tier: '', // Assigned later
        emoji,
        description,
        abilities: generateAbilities(name, species),
        audio: {
            name: id,
            catchphrase: `${name.split(' ')[0]}!`
        },
        wikiImageUrl: infobox.imageUrl || null,
        _popularityScore: detail.contentLength,
        _wikiTitle: detail.title
    };
}

function assignTiers(characters) {
    const dist = getTierDistribution(characters.length);
    // Calculate COMMON as remainder
    const assigned = dist.slice(0, 4).reduce((sum, d) => sum + d.count, 0);
    dist[4].count = Math.max(0, characters.length - assigned);

    let index = 0;
    for (const { tier, count } of dist) {
        const [minFame, maxFame] = FAME_RANGES[tier];
        for (let i = 0; i < count && index < characters.length; i++, index++) {
            characters[index].tier = tier;
            characters[index].fameBase = minFame + Math.floor(Math.random() * (maxFame - minFame + 1));
        }
    }
}

// --- Main ---

async function main() {
    console.log(`Italian Brainrot Wiki Miner`);
    console.log(`Target: ${TARGET_COUNT} new characters`);
    console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
    console.log('');

    // Phase 1: Discover all pages
    const allPages = await fetchAllPages();

    // Phase 2: Get page sizes via batch info query
    console.log('\nPhase 2: Fetching page info (batch)...');
    const pageIds = allPages.map(p => p.pageid);
    const pageInfo = await fetchPageInfo(pageIds);

    // Sort by content length (popularity proxy) and take top candidates
    const candidates = allPages
        .map(p => ({
            ...p,
            contentLength: pageInfo.get(p.pageid)?.length || 0
        }))
        .filter(p => p.contentLength > 500) // Skip stubs
        .sort((a, b) => b.contentLength - a.contentLength);

    const topCandidates = FAST_MODE ? candidates.slice(0, TARGET_COUNT * 3) : candidates.slice(0, TARGET_COUNT * 5);
    console.log(`  Top ${topCandidates.length} candidates by content size`);

    // Phase 3: Fetch detail for top candidates
    console.log(`\nPhase 3: Fetching page details (${topCandidates.length} pages, ~${Math.round(topCandidates.length * RATE_LIMIT_MS / 1000)}s)...`);
    const details = [];
    for (let i = 0; i < topCandidates.length; i++) {
        const page = topCandidates[i];
        process.stdout.write(`  [${i + 1}/${topCandidates.length}] ${page.title}...`);

        const detail = await fetchPageDetail(page.title);
        if (detail && detail.hasInfobox) {
            details.push(detail);
            console.log(` OK (${(detail.contentLength / 1024).toFixed(1)}KB)`);
        } else {
            console.log(` SKIP (no infobox)`);
        }

        if (i < topCandidates.length - 1) await sleep(RATE_LIMIT_MS);

        // Early exit if we have enough
        if (details.length >= TARGET_COUNT + 10) {
            console.log(`  Enough candidates found, stopping early.`);
            break;
        }
    }

    // Phase 4: Build characters, sort by popularity, select top N
    console.log(`\nPhase 4: Building characters...`);
    const characters = details
        .sort((a, b) => b.contentLength - a.contentLength)
        .map((d, i) => buildCharacter(d, i))
        .filter(c => !EXISTING_IDS.has(c.id)) // Double-check dedup
        .filter(c => isValidCharacterName(c.name)) // Quality filter
        .slice(0, TARGET_COUNT);

    // Phase 5: Assign tiers and fame
    assignTiers(characters);

    // Clean internal fields
    const output = characters.map(c => {
        const { _popularityScore, _wikiTitle, ...clean } = c;
        return clean;
    });

    console.log(`\nResults: ${output.length} characters`);
    const tierCounts = {};
    for (const c of output) {
        tierCounts[c.tier] = (tierCounts[c.tier] || 0) + 1;
    }
    console.log('Tier distribution:', tierCounts);
    console.log('');

    // Print top 10
    console.log('Top 10:');
    output.slice(0, 10).forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.name} [${c.tier}] ${c.emoji} - ${c.fameBase} fame`);
    });

    if (DRY_RUN) {
        console.log('\n[DRY RUN] Would write to:', OUTPUT_PATH);
        console.log('\nAll characters:');
        output.forEach((c, i) => {
            console.log(`  ${i + 1}. ${c.name} [${c.tier}] ${c.emoji} - ${c.fameBase} fame - ${c.origin}`);
        });
        return;
    }

    // Write output
    const outputData = {
        minedAt: new Date().toISOString(),
        source: 'italianbrainrot.miraheze.org',
        count: output.length,
        characters: output
    };

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2));
    console.log(`\nWritten to ${OUTPUT_PATH}`);
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
