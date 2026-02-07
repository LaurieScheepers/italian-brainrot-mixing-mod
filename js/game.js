/**
 * Italian Brainrot Mixing Mod - Main Game Logic
 * by Luka & Pappa
 */

import { getAllBaseCharacters, getTierInfo, calculateDisplayFame } from './characters.js';
import { mixCharacters, checkSpecialCombo, applySpecialCombo } from './mixing.js';
import { MersenneTwister } from './mersenne.js';
import { getGeminiAPI, saveApiKey, initGeminiFromStorage } from './gemini-api.js';
import { getImageGenerator } from './image-generator.js';
import {
    initAudio,
    playSelect,
    playDrop,
    playMixing,
    playSuccess,
    playSpecialCombo,
    playFinalBoss,
    playCollect,
    playError,
    playCharacterName,
    playMusic,
    stopMusic,
    createAudioControls,
    toggleMusic,
    toggleSFX,
    getAudioState
} from './audio.js';

// Game State
const state = {
    screen: 'parents-zone',
    contentRating: 'pg',
    selectedStarters: [],
    collection: [],
    totalFame: 0,
    totalCoins: 0,
    mixCount: 0,
    globalSeed: Date.now(),
    mixSlots: [null, null],
    lastResult: null,
    isFinalBoss: false,
    geminiConfigured: false
};

// DOM Elements
let elements = {};

/**
 * Initialize the game
 */
function init() {
    cacheElements();
    setupEventListeners();
    loadSavedPreferences();
    addAudioControls();
    console.log('🇮🇹 Italian Brainrot Mixing Mod initialized!');
    console.log('🎮 Created by Luka & Pappa');
}

/**
 * Add audio controls to the UI
 */
function addAudioControls() {
    const controls = createAudioControls();
    document.body.appendChild(controls);
}

/**
 * Load saved preferences from localStorage
 */
function loadSavedPreferences() {
    // Check if user has already set preferences
    const savedRating = localStorage.getItem('contentRating');
    const savedApiKey = localStorage.getItem('gemini_api_key');

    if (savedRating) {
        state.contentRating = savedRating;
        getImageGenerator().setContentRating(savedRating);
    }

    if (savedApiKey) {
        initGeminiFromStorage();
        state.geminiConfigured = true;
    }

    // If returning user, skip Parents Zone
    if (savedRating) {
        switchScreen('starter');
        renderStarterScreen();
    }
    // Otherwise Parents Zone is shown by default
}

/**
 * Cache DOM elements for performance
 */
function cacheElements() {
    elements = {
        // Screens
        parentsZoneScreen: document.getElementById('parents-zone-screen'),
        starterScreen: document.getElementById('starter-screen'),
        gameScreen: document.getElementById('game-screen'),
        bossScreen: document.getElementById('boss-screen'),

        // Parents Zone
        contentOptions: document.querySelectorAll('.content-option'),
        apiKeyInput: document.getElementById('api-key-input'),

        // Starter screen
        starterGrid: document.getElementById('starter-grid'),
        selectedCount: document.getElementById('selected-count'),
        startGameBtn: document.getElementById('start-game-btn'),

        // Game screen
        totalFame: document.getElementById('total-fame'),
        totalCoins: document.getElementById('total-coins'),
        mixCount: document.getElementById('mix-count'),
        mixingBowl: document.getElementById('mixing-bowl'),
        slot1: document.getElementById('slot-1'),
        slot2: document.getElementById('slot-2'),
        mixButton: document.getElementById('mix-button'),
        resultArea: document.getElementById('result-area'),
        resultCharacter: document.getElementById('result-character'),
        collectBtn: document.getElementById('collect-btn'),
        collectionGrid: document.getElementById('collection-grid'),

        // Boss screen
        finalBossDisplay: document.getElementById('final-boss-display'),
        newGamePlusBtn: document.getElementById('new-game-plus-btn'),
        sandboxBtn: document.getElementById('sandbox-btn'),
        shareBtn: document.getElementById('share-btn')
    };
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Parents Zone - Content rating buttons
    elements.contentOptions.forEach(button => {
        button.addEventListener('click', () => selectContentRating(button));
    });

    // Parents Zone - API key input
    elements.apiKeyInput?.addEventListener('change', handleApiKeyInput);
    elements.apiKeyInput?.addEventListener('blur', handleApiKeyInput);

    // Start game button
    elements.startGameBtn.addEventListener('click', startGame);

    // Mix button
    elements.mixButton.addEventListener('click', performMix);

    // Collect button
    elements.collectBtn.addEventListener('click', collectResult);

    // Endgame buttons
    elements.newGamePlusBtn?.addEventListener('click', newGamePlus);
    elements.sandboxBtn?.addEventListener('click', enterSandbox);
    elements.shareBtn?.addEventListener('click', shareChallenge);

    // Drag and drop for mixing bowl slots
    [elements.slot1, elements.slot2].forEach(slot => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);
    });
}

/**
 * Handle content rating selection
 */
function selectContentRating(button) {
    const rating = button.dataset.rating;

    // Save preference
    state.contentRating = rating;
    localStorage.setItem('contentRating', rating);
    getImageGenerator().setContentRating(rating);

    // Visual feedback
    elements.contentOptions.forEach(btn => {
        btn.style.transform = '';
        btn.style.boxShadow = '';
    });
    button.style.transform = 'scale(1.05)';
    button.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.7)';

    // Transition to starter screen after short delay
    setTimeout(() => {
        switchScreen('starter');
        renderStarterScreen();
    }, 500);
}

/**
 * Handle API key input
 */
function handleApiKeyInput(e) {
    const apiKey = e.target.value.trim();

    if (apiKey && apiKey.length > 10) {
        saveApiKey(apiKey);
        state.geminiConfigured = true;
        console.log('Gemini API key saved');
    }
}

/**
 * Render the starter selection screen
 */
function renderStarterScreen() {
    const characters = getAllBaseCharacters();
    elements.starterGrid.innerHTML = '';

    characters.forEach(char => {
        const card = createCharacterCard(char, 'starter');
        elements.starterGrid.appendChild(card);
    });
}

/**
 * Create a character card element
 */
function createCharacterCard(char, mode = 'collection') {
    const card = document.createElement('div');
    const tierClass = char.tier.toLowerCase();
    card.className = `character-card ${tierClass}`;
    card.dataset.characterId = char.id;

    if (mode === 'collection') {
        card.draggable = true;
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    } else if (mode === 'starter') {
        card.addEventListener('click', () => toggleStarterSelection(char.id));
    }

    const fame = calculateDisplayFame(char);

    // Use generated image, wiki image, or emoji fallback
    let imageContent;
    if (char.generatedImage) {
        imageContent = `<img src="${char.generatedImage}" alt="${char.name}" style="width: 100%; height: 100%; border-radius: 10px; object-fit: cover;">`;
    } else if (char.wikiImageUrl) {
        imageContent = `<img src="${char.wikiImageUrl}" alt="${char.name}" style="width: 100%; height: 100%; border-radius: 10px; object-fit: cover;" onerror="this.parentElement.innerHTML='${char.emoji}'">`;
    } else {
        imageContent = char.emoji;
    }

    card.innerHTML = `
        <span class="tier-badge ${tierClass}">${char.tier}</span>
        <div class="character-image">${imageContent}</div>
        <div class="character-name">${char.name}</div>
        <div class="character-fame">⭐ ${fame.toLocaleString()}</div>
    `;

    return card;
}

/**
 * Toggle starter character selection
 */
function toggleStarterSelection(charId) {
    const index = state.selectedStarters.indexOf(charId);

    if (index > -1) {
        // Deselect
        state.selectedStarters.splice(index, 1);
        playSelect();
    } else if (state.selectedStarters.length < 3) {
        // Select (max 3)
        state.selectedStarters.push(charId);
        playSelect();
        playCharacterName(charId);
    }

    // Update UI
    updateStarterUI();
}

/**
 * Update starter selection UI
 */
function updateStarterUI() {
    // Update count
    elements.selectedCount.textContent = state.selectedStarters.length;

    // Update button state
    elements.startGameBtn.disabled = state.selectedStarters.length !== 3;

    // Update card styles
    document.querySelectorAll('#starter-grid .character-card').forEach(card => {
        const isSelected = state.selectedStarters.includes(card.dataset.characterId);
        card.classList.toggle('selected', isSelected);
    });
}

/**
 * Start the main game
 */
function startGame() {
    // Add selected starters to collection
    const allChars = getAllBaseCharacters();
    state.collection = state.selectedStarters.map(id =>
        allChars.find(c => c.id === id)
    ).filter(Boolean);

    // Calculate initial fame
    state.totalFame = state.collection.reduce((sum, char) =>
        sum + calculateDisplayFame(char), 0
    );

    // Switch screens
    switchScreen('game');

    // Render collection
    renderCollection();
    updateStats();
}

/**
 * Switch between screens
 */
function switchScreen(screenName) {
    state.screen = screenName;

    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));

    // Show target screen
    const targetScreen = {
        'parents-zone': elements.parentsZoneScreen,
        'starter': elements.starterScreen,
        'game': elements.gameScreen,
        'boss': elements.bossScreen
    }[screenName];

    if (targetScreen) {
        targetScreen.classList.add('active');
    }
}

/**
 * Render the collection grid
 */
function renderCollection() {
    elements.collectionGrid.innerHTML = '';

    state.collection.forEach(char => {
        const card = createCharacterCard(char, 'collection');
        elements.collectionGrid.appendChild(card);
    });
}

/**
 * Update stats display
 */
function updateStats() {
    elements.totalFame.textContent = state.totalFame.toLocaleString();
    elements.totalCoins.textContent = state.isFinalBoss ? '∞' : state.totalCoins.toLocaleString();
    elements.mixCount.textContent = state.mixCount;
}

/**
 * Drag and drop handlers
 */
function handleDragStart(e) {
    e.target.classList.add('dragging');
    e.dataTransfer.setData('text/plain', e.target.dataset.characterId);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const charId = e.dataTransfer.getData('text/plain');
    const slotIndex = parseInt(e.currentTarget.dataset.slot) - 1;

    // Find character in collection
    const char = state.collection.find(c => c.id === charId);
    if (!char) return;

    // Check if already in other slot
    const otherSlot = slotIndex === 0 ? 1 : 0;
    if (state.mixSlots[otherSlot]?.id === charId) {
        // Can't use same character in both slots
        e.currentTarget.classList.add('shake');
        setTimeout(() => e.currentTarget.classList.remove('shake'), 500);
        playError();
        return;
    }

    // Place in slot
    state.mixSlots[slotIndex] = char;
    updateSlotDisplay(e.currentTarget, char);
    updateMixButton();
    playDrop();
    playCharacterName(charId);
}

/**
 * Update slot display with character
 */
function updateSlotDisplay(slotElement, char) {
    slotElement.classList.add('filled');
    slotElement.innerHTML = `
        <div class="character-image">${char.emoji}</div>
        <div class="character-name" style="font-size: 0.7rem;">${char.name}</div>
    `;
}

/**
 * Clear slot display
 */
function clearSlotDisplay(slotElement) {
    slotElement.classList.remove('filled');
    slotElement.innerHTML = '<span class="slot-label">Drop Here</span>';
}

/**
 * Update mix button state
 */
function updateMixButton() {
    const canMix = state.mixSlots[0] && state.mixSlots[1];
    elements.mixButton.disabled = !canMix;
}

/**
 * Perform the mix!
 */
async function performMix() {
    if (!state.mixSlots[0] || !state.mixSlots[1]) return;

    // Animate button
    elements.mixButton.classList.add('mixing');
    elements.mixButton.disabled = true;
    elements.mixButton.textContent = 'MIXING...';

    // Play mixing sound
    playMixing();

    // Mix after animation
    setTimeout(async () => {
        const char1 = state.mixSlots[0];
        const char2 = state.mixSlots[1];

        // Perform mix
        let result = mixCharacters(char1, char2, state.globalSeed);

        // Check for special combo
        const specialCombo = checkSpecialCombo(char1, char2);
        if (specialCombo) {
            result = applySpecialCombo(result, specialCombo);
        }

        // Try to generate AI fusion image
        if (state.geminiConfigured) {
            elements.mixButton.textContent = 'GENERATING...';
            try {
                const imageGenerator = getImageGenerator();
                const fusionImage = await imageGenerator.getFusionImage(char1, char2);
                if (fusionImage) {
                    result.generatedImage = fusionImage;
                }
            } catch (error) {
                console.warn('Image generation failed:', error);
            }
        }

        state.lastResult = result;
        state.mixCount++;

        // Show result
        showResult(result, specialCombo !== null);

        // Play success or special combo sound
        if (specialCombo) {
            playSpecialCombo();
        } else {
            playSuccess();
        }

        // Reset slots
        state.mixSlots = [null, null];
        clearSlotDisplay(elements.slot1);
        clearSlotDisplay(elements.slot2);

        elements.mixButton.classList.remove('mixing');
        elements.mixButton.textContent = 'MIX!';
        updateMixButton();

    }, 1000);
}

/**
 * Show mix result
 */
function showResult(char, isSpecial) {
    const fame = calculateDisplayFame(char);

    // Use generated image if available, otherwise emoji
    const imageContent = char.generatedImage
        ? `<img src="${char.generatedImage}" alt="${char.name}" style="width: 100px; height: 100px; border-radius: 10px; object-fit: cover;">`
        : char.emoji;

    elements.resultCharacter.innerHTML = `
        <div class="character-card ${char.tier.toLowerCase()}" style="width: auto; max-width: 200px; margin: 0 auto;">
            <span class="tier-badge ${char.tier.toLowerCase()}">${char.tier}</span>
            <div class="character-image" style="width: 100px; height: 100px; font-size: 3rem; overflow: hidden;">
                ${imageContent}
            </div>
            <div class="character-name">${char.name}</div>
            <div class="character-fame">⭐ ${fame.toLocaleString()}</div>
            ${isSpecial ? '<div style="color: #39ff14; margin-top: 5px;">✨ SPECIAL COMBO! ✨</div>' : ''}
            ${char.generatedImage ? '<div style="color: #00f5ff; font-size: 0.7rem; margin-top: 3px;">🤖 AI Generated</div>' : ''}
            <div style="font-size: 0.7rem; color: #888; margin-top: 5px;">
                ${char.parentNames[0]} + ${char.parentNames[1]}
            </div>
        </div>
    `;

    elements.resultArea.classList.remove('hidden');
}

/**
 * Collect the result and add to collection
 */
function collectResult() {
    if (!state.lastResult) return;

    // Play collect sound
    playCollect();

    // Add to collection
    state.collection.push(state.lastResult);

    // Update fame
    const fame = calculateDisplayFame(state.lastResult);
    state.totalFame += fame;
    state.totalCoins += Math.floor(fame / 10);

    // Check for Final Boss condition
    // (For now: if generation depth >= 5 or collection has 20+ characters)
    if (state.lastResult.generationDepth >= 5 || state.collection.length >= 20) {
        becomeFinalBoss(state.lastResult);
        return;
    }

    // Hide result area
    elements.resultArea.classList.add('hidden');
    state.lastResult = null;

    // Update UI
    renderCollection();
    updateStats();
}

/**
 * Become the Final Boss!
 */
function becomeFinalBoss(finalChar) {
    state.isFinalBoss = true;

    // Play epic fanfare
    playFinalBoss();

    // Show boss screen
    elements.finalBossDisplay.innerHTML = `
        <div class="character-card mythic" style="width: auto; max-width: 300px; margin: 0 auto; padding: 20px;">
            <div class="character-image" style="width: 150px; height: 150px; font-size: 5rem;">${finalChar.emoji}</div>
            <div class="character-name" style="font-size: 1.5rem;">${finalChar.name}</div>
            <div class="character-fame" style="font-size: 1.2rem;">⭐ ${calculateDisplayFame(finalChar).toLocaleString()}</div>
            <div style="margin-top: 10px; font-size: 0.9rem;">
                Generation ${finalChar.generationDepth} • ${state.collection.length} Characters Mixed
            </div>
        </div>
    `;

    switchScreen('boss');
    updateStats();
}

/**
 * Endgame functions
 */
function newGamePlus() {
    // Reset with bonuses
    state.selectedStarters = [];
    state.collection = [];
    state.mixSlots = [null, null];
    state.mixCount = 0;
    state.lastResult = null;
    // Keep some fame as bonus
    state.totalFame = Math.floor(state.totalFame * 0.1);
    state.totalCoins = 0;
    state.isFinalBoss = false;

    switchScreen('starter');
    renderStarterScreen();
}

function enterSandbox() {
    // Just go back to game with all characters
    state.isFinalBoss = true; // Keep infinity coins
    switchScreen('game');
}

function shareChallenge() {
    const shareText = `🇮🇹 I became the FINAL BOSS in Italian Brainrot Mixing Mod!\n` +
        `⭐ Fame: ${state.totalFame.toLocaleString()}\n` +
        `🔄 Mixes: ${state.mixCount}\n` +
        `📦 Collection: ${state.collection.length} characters\n` +
        `🌱 Seed: ${state.globalSeed}\n\n` +
        `Can you beat my score?`;

    if (navigator.share) {
        navigator.share({
            title: 'Italian Brainrot Mixing Mod',
            text: shareText
        });
    } else {
        navigator.clipboard.writeText(shareText);
        alert('Copied to clipboard! Share with your friends!');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
