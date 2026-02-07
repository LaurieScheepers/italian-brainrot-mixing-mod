/**
 * Italian Brainrot Characters Database
 * Source: italianbrainrot.miraheze.org/wiki/List_of_characters
 *
 * Phase 1: 10 starter characters for MVP
 * Phase 4: Expanded to 40 characters
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
        localImage: 'assets/images/tung-tung-tung-sahur.png',
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
        localImage: 'assets/images/bombardiro-crocodilo.png',
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
        localImage: 'assets/images/tralalero-tralala.png',
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
        localImage: 'assets/images/capuccino-assassino.png',
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
        localImage: 'assets/images/ballerina-cappuccina.png',
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
        localImage: 'assets/images/brr-brr-patapim.png',
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
        localImage: 'assets/images/liriliri-larila.png',
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
        localImage: 'assets/images/chimpanzini-bananini.png',
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
        localImage: 'assets/images/glorbo-fruttodrillo.png',
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
        localImage: 'assets/images/boberto-mortadello.png',
        wikiImageUrl: null,
        description: 'A walking mortadella sausage. Italian deli nightmare!',
        abilities: ['Meat Slap', 'Sandwich Trap', 'Salami Shield'],
        audio: {
            name: 'boberto-mortadello',
            catchphrase: 'Mortadello!'
        }
    },

    // ============================================
    // Phase 4 Characters (30 new)
    // ============================================

    // --- MYTHIC (3 new, 4 total) ---
    {
        id: 'la-vacca-saturno-saturnita',
        name: 'La Vacca Saturno Saturnita',
        origin: 'Italian',
        species: 'Cow/Planet',
        fameBase: 950,
        tier: 'MYTHIC',
        emoji: '🪐',
        localImage: 'assets/images/la-vacca-saturno-saturnita.png',
        wikiImageUrl: null,
        description: 'A cosmic cow orbiting Saturn. Moos shake the solar system!',
        abilities: ['Ring Toss', 'Cosmic Moo', 'Gravity Crush', 'Orbit Shield'],
        audio: { name: 'la-vacca-saturno-saturnita', catchphrase: 'Saturnita!' }
    },
    {
        id: 'giraffa-celeste-astronomica',
        name: 'Giraffa Celeste Astronomica',
        origin: 'Italian',
        species: 'Giraffe/Star',
        fameBase: 980,
        tier: 'MYTHIC',
        emoji: '🦒',
        localImage: 'assets/images/giraffa-celeste-astronomica.png',
        wikiImageUrl: null,
        description: 'A giraffe so tall it reaches the stars. Head literally in the cosmos!',
        abilities: ['Star Headbutt', 'Nebula Neck', 'Constellation Stomp'],
        audio: { name: 'giraffa-celeste-astronomica', catchphrase: 'Astronomica!' }
    },
    {
        id: 're-dei-granchi-imperatore',
        name: 'Re Dei Granchi Imperatore',
        origin: 'Italian',
        species: 'Crab/Emperor',
        fameBase: 1050,
        tier: 'MYTHIC',
        emoji: '🦀',
        localImage: 'assets/images/re-dei-granchi-imperatore.png',
        wikiImageUrl: null,
        description: 'The Crab Emperor. Rules the ocean floor with an iron claw!',
        abilities: ['Imperial Pinch', 'Tidal Wave', 'Shell Fortress', 'Claw Decree'],
        audio: { name: 're-dei-granchi-imperatore', catchphrase: 'Imperatore!' }
    },

    // --- LEGENDARY (6 new, 8 total) ---
    {
        id: 'elefantino-pizzaiolo',
        name: 'Elefantino Pizzaiolo',
        origin: 'Italian',
        species: 'Elephant/Pizza Chef',
        fameBase: 820,
        tier: 'LEGENDARY',
        emoji: '🐘',
        localImage: 'assets/images/elefantino-pizzaiolo.png',
        wikiImageUrl: null,
        description: 'An elephant that makes pizza with its trunk. Every toss is a masterpiece!',
        abilities: ['Pizza Toss', 'Dough Slam', 'Mozzarella Storm'],
        audio: { name: 'elefantino-pizzaiolo', catchphrase: 'Pizzaiolo!' }
    },
    {
        id: 'squalo-volante-magnifico',
        name: 'Squalo Volante Magnifico',
        origin: 'Italian',
        species: 'Shark/Airplane',
        fameBase: 880,
        tier: 'LEGENDARY',
        emoji: '✈️',
        localImage: 'assets/images/squalo-volante-magnifico.png',
        wikiImageUrl: null,
        description: 'A flying shark with jet engines. Terror of the skies AND seas!',
        abilities: ['Jet Bite', 'Sonic Boom', 'Altitude Strike'],
        audio: { name: 'squalo-volante-magnifico', catchphrase: 'Magnifico!' }
    },
    {
        id: 'drago-gelato-infernale',
        name: 'Drago Gelato Infernale',
        origin: 'Italian',
        species: 'Dragon/Ice Cream',
        fameBase: 870,
        tier: 'LEGENDARY',
        emoji: '🐉',
        localImage: 'assets/images/drago-gelato-infernale.png',
        wikiImageUrl: null,
        description: 'A dragon that breathes gelato instead of fire. Delicious destruction!',
        abilities: ['Gelato Breath', 'Waffle Cone Horn', 'Brain Freeze'],
        audio: { name: 'drago-gelato-infernale', catchphrase: 'Infernale!' }
    },
    {
        id: 'polipo-DJ-discoteca',
        name: 'Polipo DJ Discoteca',
        origin: 'Italian',
        species: 'Octopus/DJ',
        fameBase: 840,
        tier: 'LEGENDARY',
        emoji: '🐙',
        localImage: 'assets/images/polipo-DJ-discoteca.png',
        wikiImageUrl: null,
        description: 'An octopus DJ with eight turntables. Drop the bass... literally!',
        abilities: ['Bass Drop', 'Tentacle Scratch', 'Disco Ink'],
        audio: { name: 'polipo-DJ-discoteca', catchphrase: 'Discoteca!' }
    },
    {
        id: 'pinguino-gladiatore-romano',
        name: 'Pinguino Gladiatore Romano',
        origin: 'Italian',
        species: 'Penguin/Gladiator',
        fameBase: 860,
        tier: 'LEGENDARY',
        emoji: '🐧',
        localImage: 'assets/images/pinguino-gladiatore-romano.png',
        wikiImageUrl: null,
        description: 'A penguin gladiator from ancient Rome. Waddles into the arena!',
        abilities: ['Trident Slide', 'Ice Shield', 'Colosseum Charge'],
        audio: { name: 'pinguino-gladiatore-romano', catchphrase: 'Gladiatore!' }
    },
    {
        id: 'lupo-espresso-velocissimo',
        name: 'Lupo Espresso Velocissimo',
        origin: 'Italian',
        species: 'Wolf/Espresso',
        fameBase: 830,
        tier: 'LEGENDARY',
        emoji: '🐺',
        localImage: 'assets/images/lupo-espresso-velocissimo.png',
        wikiImageUrl: null,
        description: 'A wolf powered by pure espresso. Too fast, too caffeinated!',
        abilities: ['Caffeine Rush', 'Howl Buzz', 'Espresso Sprint'],
        audio: { name: 'lupo-espresso-velocissimo', catchphrase: 'Velocissimo!' }
    },

    // --- EPIC (7 new, 10 total) ---
    {
        id: 'coccodrillo-gelataio',
        name: 'Coccodrillo Gelataio',
        origin: 'Italian',
        species: 'Crocodile/Ice Cream Vendor',
        fameBase: 680,
        tier: 'EPIC',
        emoji: '🍦',
        localImage: 'assets/images/coccodrillo-gelataio.png',
        wikiImageUrl: null,
        description: 'A crocodile that sells gelato from its mouth. Cone or cup?',
        abilities: ['Scoop Snap', 'Sprinkle Storm', 'Cold Blood Freeze'],
        audio: { name: 'coccodrillo-gelataio', catchphrase: 'Gelataio!' }
    },
    {
        id: 'gatto-astronauta-lunare',
        name: 'Gatto Astronauta Lunare',
        origin: 'Italian',
        species: 'Cat/Astronaut',
        fameBase: 720,
        tier: 'EPIC',
        emoji: '🐱',
        localImage: 'assets/images/gatto-astronauta-lunare.png',
        wikiImageUrl: null,
        description: 'A cat in a spacesuit. First feline on the moon... and the last!',
        abilities: ['Lunar Pounce', 'Zero-G Scratch', 'Moonbeam Laser'],
        audio: { name: 'gatto-astronauta-lunare', catchphrase: 'Lunare!' }
    },
    {
        id: 'tartaruga-tank-corazzata',
        name: 'Tartaruga Tank Corazzata',
        origin: 'Italian',
        species: 'Turtle/Tank',
        fameBase: 690,
        tier: 'EPIC',
        emoji: '🐢',
        localImage: 'assets/images/tartaruga-tank-corazzata.png',
        wikiImageUrl: null,
        description: 'A turtle with a literal tank turret on its shell. Slow but devastating!',
        abilities: ['Shell Cannon', 'Armour Retreat', 'Turret Spin'],
        audio: { name: 'tartaruga-tank-corazzata', catchphrase: 'Corazzata!' }
    },
    {
        id: 'fenicottero-fashionista',
        name: 'Fenicottero Fashionista',
        origin: 'Italian',
        species: 'Flamingo/Model',
        fameBase: 650,
        tier: 'EPIC',
        emoji: '🦩',
        localImage: 'assets/images/fenicottero-fashionista.png',
        wikiImageUrl: null,
        description: 'The most fashionable flamingo in Milan. Struts the runway of destruction!',
        abilities: ['Runway Strut', 'Pink Dazzle', 'Vogue Strike'],
        audio: { name: 'fenicottero-fashionista', catchphrase: 'Fashionista!' }
    },
    {
        id: 'riccio-razzo-spaziale',
        name: 'Riccio Razzo Spaziale',
        origin: 'Italian',
        species: 'Hedgehog/Rocket',
        fameBase: 730,
        tier: 'EPIC',
        emoji: '🦔',
        localImage: 'assets/images/riccio-razzo-spaziale.png',
        wikiImageUrl: null,
        description: 'A hedgehog with rocket boosters. Launches spine-first into orbit!',
        abilities: ['Spine Launch', 'Rocket Roll', 'Boost Blast'],
        audio: { name: 'riccio-razzo-spaziale', catchphrase: 'Spaziale!' }
    },
    {
        id: 'serpente-spaghetti-infinito',
        name: 'Serpente Spaghetti Infinito',
        origin: 'Italian',
        species: 'Snake/Spaghetti',
        fameBase: 670,
        tier: 'EPIC',
        emoji: '🐍',
        localImage: 'assets/images/serpente-spaghetti-infinito.png',
        wikiImageUrl: null,
        description: 'A snake made entirely of spaghetti. Al dente AND venomous!',
        abilities: ['Pasta Wrap', 'Sauce Spit', 'Noodle Whip'],
        audio: { name: 'serpente-spaghetti-infinito', catchphrase: 'Infinito!' }
    },
    {
        id: 'rana-operista-soprano',
        name: 'Rana Operista Soprano',
        origin: 'Italian',
        species: 'Frog/Opera Singer',
        fameBase: 660,
        tier: 'EPIC',
        emoji: '🐸',
        localImage: 'assets/images/rana-operista-soprano.png',
        wikiImageUrl: null,
        description: 'A frog that sings opera so powerfully it shatters glass!',
        abilities: ['Aria Blast', 'High Note Shatter', 'Ribbit Crescendo'],
        audio: { name: 'rana-operista-soprano', catchphrase: 'Soprano!' }
    },

    // --- RARE (6 new, 8 total) ---
    {
        id: 'coniglio-mago-illusionista',
        name: 'Coniglio Mago Illusionista',
        origin: 'Italian',
        species: 'Rabbit/Magician',
        fameBase: 480,
        tier: 'RARE',
        emoji: '🐰',
        localImage: 'assets/images/coniglio-mago-illusionista.png',
        wikiImageUrl: null,
        description: 'A rabbit that pulls itself out of hats. The ultimate magic trick!',
        abilities: ['Hat Trick', 'Carrot Wand', 'Vanish'],
        audio: { name: 'coniglio-mago-illusionista', catchphrase: 'Illusionista!' }
    },
    {
        id: 'papera-pirata-corsara',
        name: 'Papera Pirata Corsara',
        origin: 'Italian',
        species: 'Duck/Pirate',
        fameBase: 520,
        tier: 'RARE',
        emoji: '🦆',
        localImage: 'assets/images/papera-pirata-corsara.png',
        wikiImageUrl: null,
        description: 'A pirate duck sailing the seven puddles. Quack and plunder!',
        abilities: ['Quack Attack', 'Plank Walk', 'Treasure Dive'],
        audio: { name: 'papera-pirata-corsara', catchphrase: 'Corsara!' }
    },
    {
        id: 'gufo-professore-notturno',
        name: 'Gufo Professore Notturno',
        origin: 'Italian',
        species: 'Owl/Professor',
        fameBase: 470,
        tier: 'RARE',
        emoji: '🦉',
        localImage: 'assets/images/gufo-professore-notturno.png',
        wikiImageUrl: null,
        description: 'A wise owl with spectacles and a PhD in brainrot studies.',
        abilities: ['Wisdom Beam', 'Night Vision', 'Lecture Bore'],
        audio: { name: 'gufo-professore-notturno', catchphrase: 'Notturno!' }
    },
    {
        id: 'cavallo-velocista-turbo',
        name: 'Cavallo Velocista Turbo',
        origin: 'Italian',
        species: 'Horse/Race Car',
        fameBase: 530,
        tier: 'RARE',
        emoji: '🐎',
        localImage: 'assets/images/cavallo-velocista-turbo.png',
        wikiImageUrl: null,
        description: 'A horse with exhaust pipes. Gallops at 300 km/h!',
        abilities: ['Turbo Gallop', 'Exhaust Cloud', 'Drift Kick'],
        audio: { name: 'cavallo-velocista-turbo', catchphrase: 'Turbo!' }
    },
    {
        id: 'farfalla-ninja-silenziosa',
        name: 'Farfalla Ninja Silenziosa',
        origin: 'Italian',
        species: 'Butterfly/Ninja',
        fameBase: 490,
        tier: 'RARE',
        emoji: '🦋',
        localImage: 'assets/images/farfalla-ninja-silenziosa.png',
        wikiImageUrl: null,
        description: 'A butterfly trained in the ninja arts. Silent, beautiful, deadly!',
        abilities: ['Wing Blade', 'Silent Flutter', 'Pollen Bomb'],
        audio: { name: 'farfalla-ninja-silenziosa', catchphrase: 'Silenziosa!' }
    },
    {
        id: 'topo-meccanico-ingegnere',
        name: 'Topo Meccanico Ingegnere',
        origin: 'Italian',
        species: 'Mouse/Mechanic',
        fameBase: 460,
        tier: 'RARE',
        emoji: '🐭',
        localImage: 'assets/images/topo-meccanico-ingegnere.png',
        wikiImageUrl: null,
        description: 'A mouse that builds giant robots from cheese wheels.',
        abilities: ['Wrench Whack', 'Cheese Gear', 'Mech Build'],
        audio: { name: 'topo-meccanico-ingegnere', catchphrase: 'Ingegnere!' }
    },

    // --- COMMON (8 new, 10 total) ---
    {
        id: 'lumaca-postino-lentissima',
        name: 'Lumaca Postino Lentissima',
        origin: 'Italian',
        species: 'Snail/Mailman',
        fameBase: 300,
        tier: 'COMMON',
        emoji: '🐌',
        localImage: 'assets/images/lumaca-postino-lentissima.png',
        wikiImageUrl: null,
        description: 'A snail that delivers mail. Your package arrives in 6-8 months!',
        abilities: ['Slime Trail', 'Shell Delivery', 'Slow Mo'],
        audio: { name: 'lumaca-postino-lentissima', catchphrase: 'Lentissima!' }
    },
    {
        id: 'formica-bodybuilder-forte',
        name: 'Formica Bodybuilder Forte',
        origin: 'Italian',
        species: 'Ant/Bodybuilder',
        fameBase: 320,
        tier: 'COMMON',
        emoji: '🐜',
        localImage: 'assets/images/formica-bodybuilder-forte.png',
        wikiImageUrl: null,
        description: 'An ant that lifts 5000x its body weight. Skips leg day though.',
        abilities: ['Ant Lift', 'Flex Crush', 'Colony Call'],
        audio: { name: 'formica-bodybuilder-forte', catchphrase: 'Forte!' }
    },
    {
        id: 'pesce-pagliaccio-comico',
        name: 'Pesce Pagliaccio Comico',
        origin: 'Italian',
        species: 'Clownfish/Comedian',
        fameBase: 280,
        tier: 'COMMON',
        emoji: '🐠',
        localImage: 'assets/images/pesce-pagliaccio-comico.png',
        wikiImageUrl: null,
        description: 'A clownfish that tells terrible jokes. The ocean groans!',
        abilities: ['Bad Joke', 'Bubble Laugh', 'Coral Hideout'],
        audio: { name: 'pesce-pagliaccio-comico', catchphrase: 'Comico!' }
    },
    {
        id: 'piccione-detective-misterioso',
        name: 'Piccione Detective Misterioso',
        origin: 'Italian',
        species: 'Pigeon/Detective',
        fameBase: 330,
        tier: 'COMMON',
        emoji: '🕊️',
        localImage: 'assets/images/piccione-detective-misterioso.png',
        wikiImageUrl: null,
        description: 'A pigeon detective that solves crimes. Elementary, my dear coo!',
        abilities: ['Investigate', 'Coo Clue', 'Bread Crumb Trail'],
        audio: { name: 'piccione-detective-misterioso', catchphrase: 'Misterioso!' }
    },
    {
        id: 'granchio-barbiere-elegante',
        name: 'Granchio Barbiere Elegante',
        origin: 'Italian',
        species: 'Crab/Barber',
        fameBase: 310,
        tier: 'COMMON',
        emoji: '✂️',
        localImage: 'assets/images/granchio-barbiere-elegante.png',
        wikiImageUrl: null,
        description: 'A crab barber with the sharpest claws in town. Best cuts in Naples!',
        abilities: ['Scissor Claw', 'Style Cut', 'Hot Towel Wrap'],
        audio: { name: 'granchio-barbiere-elegante', catchphrase: 'Elegante!' }
    },
    {
        id: 'pecora-cloud-soffice',
        name: 'Pecora Cloud Soffice',
        origin: 'Italian',
        species: 'Sheep/Cloud',
        fameBase: 290,
        tier: 'COMMON',
        emoji: '🐑',
        localImage: 'assets/images/pecora-cloud-soffice.png',
        wikiImageUrl: null,
        description: 'A sheep that IS a cloud. Floats around raining wool!',
        abilities: ['Wool Rain', 'Cloud Float', 'Sleep Inducer'],
        audio: { name: 'pecora-cloud-soffice', catchphrase: 'Soffice!' }
    },
    {
        id: 'mosca-pizzaiola-fastidiosa',
        name: 'Mosca Pizzaiola Fastidiosa',
        origin: 'Italian',
        species: 'Fly/Pizza Maker',
        fameBase: 270,
        tier: 'COMMON',
        emoji: '🪰',
        localImage: 'assets/images/mosca-pizzaiola-fastidiosa.png',
        wikiImageUrl: null,
        description: 'A fly that makes tiny pizzas. Annoying but delicious!',
        abilities: ['Buzz Bomb', 'Micro Pizza', 'Swarm Call'],
        audio: { name: 'mosca-pizzaiola-fastidiosa', catchphrase: 'Fastidiosa!' }
    },
    {
        id: 'rospo-gondoliere-veneziano',
        name: 'Rospo Gondoliere Veneziano',
        origin: 'Italian',
        species: 'Toad/Gondolier',
        fameBase: 340,
        tier: 'COMMON',
        emoji: '🚣',
        localImage: 'assets/images/rospo-gondoliere-veneziano.png',
        wikiImageUrl: null,
        description: 'A toad gondolier of Venice. Serenades with croaks!',
        abilities: ['Paddle Whack', 'Canal Splash', 'Serenade Croak'],
        audio: { name: 'rospo-gondoliere-veneziano', catchphrase: 'Veneziano!' }
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
