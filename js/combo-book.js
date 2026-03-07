/**
 * Combo Discovery Book for Italian Brainrot Mixing Mod
 * Tracks which special combos the player has discovered
 */

import { getAllBaseCharacters } from './characters.js';

// All 13 special combos (matching js/mixing.js exactly)
const SPECIAL_COMBOS = [
    { parent1: 'tung-tung-tung-sahur', parent2: 'bombardiro-crocodilo', name: 'Tungbardiro Skybasher', bonusFame: 500 },
    { parent1: 'tralalero-tralala', parent2: 'capuccino-assassino', name: 'Tralaccino Sharksassin', bonusFame: 400 },
    { parent1: 'brr-brr-patapim', parent2: 'ballerina-cappuccina', name: 'Brrlerina Frostpim', bonusFame: 350 },
    { parent1: 'elefantino-pizzaiolo', parent2: 'drago-gelato-infernale', name: 'Draghantino Pizzagelato', bonusFame: 450 },
    { parent1: 'squalo-volante-magnifico', parent2: 'pinguino-gladiatore-romano', name: 'Squaluino Gladiatore Volante', bonusFame: 420 },
    { parent1: 'gatto-astronauta-lunare', parent2: 'riccio-razzo-spaziale', name: 'Gattorazzo Cosmonauta', bonusFame: 400 },
    { parent1: 're-dei-granchi-imperatore', parent2: 'granchio-barbiere-elegante', name: 'Gran Imperatore Elegantissimo', bonusFame: 380 },
    { parent1: 'serpente-spaghetti-infinito', parent2: 'coccodrillo-gelataio', name: 'Spaghettococco Gelatoso', bonusFame: 350 },
    { parent1: 'polipo-DJ-discoteca', parent2: 'rana-operista-soprano', name: 'Poliporana Musicale Supremo', bonusFame: 400 },
    { parent1: 'lupo-espresso-velocissimo', parent2: 'cavallo-velocista-turbo', name: 'Lupovallo Turbo Espresso', bonusFame: 380 },
    { parent1: 'la-vacca-saturno-saturnita', parent2: 'giraffa-celeste-astronomica', name: 'Vaccaffa Cosmica Universale', bonusFame: 500 },
    { parent1: 'farfalla-ninja-silenziosa', parent2: 'fenicottero-fashionista', name: 'Farfallottero Ninja Fashion', bonusFame: 350 },
    { parent1: 'papera-pirata-corsara', parent2: 'rospo-gondoliere-veneziano', name: 'Paperospo Pirata di Venezia', bonusFame: 330 },
];

const STORAGE_KEY = 'brainrot_discovered_combos';

/** Get list of discovered combo keys from localStorage */
export function getDiscoveredCombos() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
}

/** Mark a combo as discovered. Returns true if newly discovered. */
export function markComboDiscovered(parent1Id, parent2Id) {
    const key = [parent1Id, parent2Id].sort().join('+');
    const discovered = getDiscoveredCombos();
    if (discovered.includes(key)) return false;
    discovered.push(key);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(discovered));
    return true;
}

/** Get combo discovery count */
export function getComboStats() {
    return { discovered: getDiscoveredCombos().length, total: SPECIAL_COMBOS.length };
}

/** Render the combo book modal HTML */
export function renderComboBook() {
    const discovered = getDiscoveredCombos();
    const allChars = getAllBaseCharacters();

    const getChar = (id) => allChars.find(c => c.id === id);

    const comboCards = SPECIAL_COMBOS.map(combo => {
        const key = [combo.parent1, combo.parent2].sort().join('+');
        const isDiscovered = discovered.includes(key);
        const p1 = getChar(combo.parent1);
        const p2 = getChar(combo.parent2);

        if (isDiscovered) {
            return `<div class="combo-card discovered">
                <div class="combo-parents">${p1?.emoji || '?'} + ${p2?.emoji || '?'}</div>
                <div class="combo-result-name">${combo.name}</div>
                <div class="combo-bonus">+${combo.bonusFame} Fame</div>
            </div>`;
        } else {
            return `<div class="combo-card locked">
                <div class="combo-parents">${p1?.emoji || '?'} + ${p2?.emoji || '?'}</div>
                <div class="combo-result-name">???</div>
                <div class="combo-hint">Try mixing these!</div>
            </div>`;
        }
    }).join('');

    const stats = getComboStats();

    return `
        <div class="combo-book-modal" id="combo-book-modal">
            <div class="combo-book-content">
                <div class="combo-book-header">
                    <h2>Combo Book</h2>
                    <div class="combo-progress">${stats.discovered}/${stats.total} Discovered</div>
                    <button class="combo-book-close" onclick="document.getElementById('combo-book-modal').remove()">&times;</button>
                </div>
                <div class="combo-grid">${comboCards}</div>
            </div>
        </div>
    `;
}

export { SPECIAL_COMBOS };
