#!/usr/bin/env node

/**
 * Generate character portraits using Google Gemini
 * Usage: node scripts/generate-portraits.mjs
 *
 * Requires GEMINI_API_KEY in .env file
 * Rate limited: 6s between requests (~4 min for 40 characters)
 * Idempotent: skips characters that already have a local image
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'assets', 'images');
const ENV_PATH = path.join(PROJECT_ROOT, '.env');

/**
 * Read .env file and return key-value pairs
 */
function loadEnvFile(filePath) {
    if (!fs.existsSync(filePath)) return {};
    const vars = {};
    const content = fs.readFileSync(filePath, 'utf-8');
    for (const line of content.split('\n')) {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
            vars[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
        }
    }
    return vars;
}

const env = loadEnvFile(ENV_PATH);
const apiKey = env.GEMINI_API_KEY;

if (!apiKey) {
    console.error('Missing GEMINI_API_KEY in .env file');
    console.error('Create .env with: GEMINI_API_KEY=your-key-here');
    process.exit(1);
}

const PRIMARY_MODEL = 'gemini-2.5-flash-preview-05-20';
const FALLBACK_MODEL = 'gemini-2.0-flash-exp-image-generation';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// All 40 characters
const CHARACTERS = [
    { id: 'tung-tung-tung-sahur', name: 'Tung Tung Tung Sahur', species: 'Tungsten/Wood', tier: 'MYTHIC', description: 'An anthropomorphic log wielding a baseball bat. The strongest character in the universe!' },
    { id: 'bombardiro-crocodilo', name: 'Bombardiro Crocodilo', species: 'Crocodile/Bomber', tier: 'LEGENDARY', description: 'A military bomber plane with a crocodile head. Drops bombs from the sky!' },
    { id: 'tralalero-tralala', name: 'Tralalero Tralala', species: 'Shark', tier: 'LEGENDARY', description: 'A blue shark with elongated leg-fins wearing Nike shoes. The FIRST Italian brainrot!' },
    { id: 'capuccino-assassino', name: 'Capuccino Assassino', species: 'Coffee/Assassin', tier: 'EPIC', description: 'A deadly coffee cup with assassin skills. Caffeinated murder!' },
    { id: 'ballerina-cappuccina', name: 'Ballerina Cappuccina', species: 'Ballerina/Coffee', tier: 'EPIC', description: 'A graceful dancing coffee. Sister of Tung Tung Tung Sahur.' },
    { id: 'brr-brr-patapim', name: 'Brr Brr Patapim', species: 'Unknown', tier: 'EPIC', description: 'A mysterious cold creature. Executed Bombardiro in the Croco-Avian Wars!' },
    { id: 'liriliri-larila', name: 'Liriliri Larila', species: 'Bird/Creature', tier: 'RARE', description: 'A singing bird creature with melodic powers.' },
    { id: 'chimpanzini-bananini', name: 'Chimpanzini Bananini', species: 'Chimpanzee/Banana', tier: 'RARE', description: 'A monkey-banana hybrid. Goes bananas in battle!' },
    { id: 'glorbo-fruttodrillo', name: 'Glorbo Fruttodrillo', species: 'Fruit/Crocodile', tier: 'COMMON', description: 'A fruity crocodile creature. Sweet but deadly!' },
    { id: 'boberto-mortadello', name: 'Boberto Mortadello', species: 'Mortadella/Human', tier: 'COMMON', description: 'A walking mortadella sausage. Italian deli nightmare!' },
    { id: 'la-vacca-saturno-saturnita', name: 'La Vacca Saturno Saturnita', species: 'Cow/Planet', tier: 'MYTHIC', description: 'A cosmic cow orbiting Saturn. Moos shake the solar system!' },
    { id: 'giraffa-celeste-astronomica', name: 'Giraffa Celeste Astronomica', species: 'Giraffe/Star', tier: 'MYTHIC', description: 'A giraffe so tall it reaches the stars. Head literally in the cosmos!' },
    { id: 're-dei-granchi-imperatore', name: 'Re Dei Granchi Imperatore', species: 'Crab/Emperor', tier: 'MYTHIC', description: 'The Crab Emperor. Rules the ocean floor with an iron claw!' },
    { id: 'elefantino-pizzaiolo', name: 'Elefantino Pizzaiolo', species: 'Elephant/Pizza Chef', tier: 'LEGENDARY', description: 'An elephant that makes pizza with its trunk. Every toss is a masterpiece!' },
    { id: 'squalo-volante-magnifico', name: 'Squalo Volante Magnifico', species: 'Shark/Airplane', tier: 'LEGENDARY', description: 'A flying shark with jet engines. Terror of the skies AND seas!' },
    { id: 'drago-gelato-infernale', name: 'Drago Gelato Infernale', species: 'Dragon/Ice Cream', tier: 'LEGENDARY', description: 'A dragon that breathes gelato instead of fire. Delicious destruction!' },
    { id: 'polipo-DJ-discoteca', name: 'Polipo DJ Discoteca', species: 'Octopus/DJ', tier: 'LEGENDARY', description: 'An octopus DJ with eight turntables. Drop the bass... literally!' },
    { id: 'pinguino-gladiatore-romano', name: 'Pinguino Gladiatore Romano', species: 'Penguin/Gladiator', tier: 'LEGENDARY', description: 'A penguin gladiator from ancient Rome. Waddles into the arena!' },
    { id: 'lupo-espresso-velocissimo', name: 'Lupo Espresso Velocissimo', species: 'Wolf/Espresso', tier: 'LEGENDARY', description: 'A wolf powered by pure espresso. Too fast, too caffeinated!' },
    { id: 'coccodrillo-gelataio', name: 'Coccodrillo Gelataio', species: 'Crocodile/Ice Cream Vendor', tier: 'EPIC', description: 'A crocodile that sells gelato from its mouth. Cone or cup?' },
    { id: 'gatto-astronauta-lunare', name: 'Gatto Astronauta Lunare', species: 'Cat/Astronaut', tier: 'EPIC', description: 'A cat in a spacesuit. First feline on the moon... and the last!' },
    { id: 'tartaruga-tank-corazzata', name: 'Tartaruga Tank Corazzata', species: 'Turtle/Tank', tier: 'EPIC', description: 'A turtle with a literal tank turret on its shell. Slow but devastating!' },
    { id: 'fenicottero-fashionista', name: 'Fenicottero Fashionista', species: 'Flamingo/Model', tier: 'EPIC', description: 'The most fashionable flamingo in Milan. Struts the runway of destruction!' },
    { id: 'riccio-razzo-spaziale', name: 'Riccio Razzo Spaziale', species: 'Hedgehog/Rocket', tier: 'EPIC', description: 'A hedgehog with rocket boosters. Launches spine-first into orbit!' },
    { id: 'serpente-spaghetti-infinito', name: 'Serpente Spaghetti Infinito', species: 'Snake/Spaghetti', tier: 'EPIC', description: 'A snake made entirely of spaghetti. Al dente AND venomous!' },
    { id: 'rana-operista-soprano', name: 'Rana Operista Soprano', species: 'Frog/Opera Singer', tier: 'EPIC', description: 'A frog that sings opera so powerfully it shatters glass!' },
    { id: 'coniglio-mago-illusionista', name: 'Coniglio Mago Illusionista', species: 'Rabbit/Magician', tier: 'RARE', description: 'A rabbit that pulls itself out of hats. The ultimate magic trick!' },
    { id: 'papera-pirata-corsara', name: 'Papera Pirata Corsara', species: 'Duck/Pirate', tier: 'RARE', description: 'A pirate duck sailing the seven puddles. Quack and plunder!' },
    { id: 'gufo-professore-notturno', name: 'Gufo Professore Notturno', species: 'Owl/Professor', tier: 'RARE', description: 'A wise owl with spectacles and a PhD in brainrot studies.' },
    { id: 'cavallo-velocista-turbo', name: 'Cavallo Velocista Turbo', species: 'Horse/Race Car', tier: 'RARE', description: 'A horse with exhaust pipes. Gallops at 300 km/h!' },
    { id: 'farfalla-ninja-silenziosa', name: 'Farfalla Ninja Silenziosa', species: 'Butterfly/Ninja', tier: 'RARE', description: 'A butterfly trained in the ninja arts. Silent, beautiful, deadly!' },
    { id: 'topo-meccanico-ingegnere', name: 'Topo Meccanico Ingegnere', species: 'Mouse/Mechanic', tier: 'RARE', description: 'A mouse that builds giant robots from cheese wheels.' },
    { id: 'lumaca-postino-lentissima', name: 'Lumaca Postino Lentissima', species: 'Snail/Mailman', tier: 'COMMON', description: 'A snail that delivers mail. Your package arrives in 6-8 months!' },
    { id: 'formica-bodybuilder-forte', name: 'Formica Bodybuilder Forte', species: 'Ant/Bodybuilder', tier: 'COMMON', description: 'An ant that lifts 5000x its body weight. Skips leg day though.' },
    { id: 'pesce-pagliaccio-comico', name: 'Pesce Pagliaccio Comico', species: 'Clownfish/Comedian', tier: 'COMMON', description: 'A clownfish that tells terrible jokes. The ocean groans!' },
    { id: 'piccione-detective-misterioso', name: 'Piccione Detective Misterioso', species: 'Pigeon/Detective', tier: 'COMMON', description: 'A pigeon detective that solves crimes. Elementary, my dear coo!' },
    { id: 'granchio-barbiere-elegante', name: 'Granchio Barbiere Elegante', species: 'Crab/Barber', tier: 'COMMON', description: 'A crab barber with the sharpest claws in town. Best cuts in Naples!' },
    { id: 'pecora-cloud-soffice', name: 'Pecora Cloud Soffice', species: 'Sheep/Cloud', tier: 'COMMON', description: 'A sheep that IS a cloud. Floats around raining wool!' },
    { id: 'mosca-pizzaiola-fastidiosa', name: 'Mosca Pizzaiola Fastidiosa', species: 'Fly/Pizza Maker', tier: 'COMMON', description: 'A fly that makes tiny pizzas. Annoying but delicious!' },
    { id: 'rospo-gondoliere-veneziano', name: 'Rospo Gondoliere Veneziano', species: 'Toad/Gondolier', tier: 'COMMON', description: 'A toad gondolier of Venice. Serenades with croaks!' },
];

const RATE_LIMIT_MS = 6000;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generatePortrait(character, model) {
    const prompt = `Create a character portrait for "${character.name}", an Italian Brainrot meme character.
This is a ${character.species} hybrid creature from the Italian Brainrot internet meme universe.
${character.description}
Tier: ${character.tier}

Style: Fun, colorful, meme-worthy Italian Brainrot character portrait.
The character should look surreal and absurd - a true Italian Brainrot creation.
Square composition, vibrant saturated colors, clean white background, cartoon/meme aesthetic.
No text or words in the image.`;

    const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseModalities: ['TEXT', 'IMAGE'],
            },
        }),
    });

    if (!response.ok) {
        const status = response.status;
        if (status === 404 && model === PRIMARY_MODEL) {
            console.log(`  Model ${PRIMARY_MODEL} not found, trying fallback...`);
            return generatePortrait(character, FALLBACK_MODEL);
        }
        throw new Error(`API error ${status}: ${await response.text()}`);
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];

    for (const part of parts) {
        if (part.inlineData) {
            return Buffer.from(part.inlineData.data, 'base64');
        }
    }

    throw new Error('No image data in response');
}

async function main() {
    console.log(`Generating portraits for ${CHARACTERS.length} characters...`);
    console.log(`Output: ${IMAGES_DIR}`);
    console.log('');

    fs.mkdirSync(IMAGES_DIR, { recursive: true });

    let generated = 0;
    let skipped = 0;
    let failed = 0;

    for (let i = 0; i < CHARACTERS.length; i++) {
        const char = CHARACTERS[i];
        const outputPath = path.join(IMAGES_DIR, `${char.id}.png`);

        if (fs.existsSync(outputPath)) {
            console.log(`[SKIP] ${char.name} - already exists`);
            skipped++;
            continue;
        }

        console.log(`[GEN] (${i + 1}/${CHARACTERS.length}) ${char.name} (${char.tier})...`);

        try {
            const imageData = await generatePortrait(char, PRIMARY_MODEL);
            fs.writeFileSync(outputPath, imageData);
            console.log(`  Saved: ${char.id}.png`);
            generated++;
        } catch (error) {
            console.error(`  FAILED: ${error.message}`);
            failed++;
        }

        // Rate limit between requests
        if (i < CHARACTERS.length - 1) {
            await sleep(RATE_LIMIT_MS);
        }
    }

    console.log('');
    console.log(`Done! Generated: ${generated}, Skipped: ${skipped}, Failed: ${failed}`);
}

main().catch(console.error);
