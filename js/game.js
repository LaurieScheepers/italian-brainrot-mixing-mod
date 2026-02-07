/**
 * Italian Brainrot Mixing Mod - Main Game Logic
 * by Luka & Pappa
 */

import { getAllBaseCharacters, getTierInfo, calculateDisplayFame } from './characters.js';
import { mixCharacters, checkSpecialCombo, applySpecialCombo, hashString } from './mixing.js';
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
    geminiConfigured: false,
    isChallenge: false,
    challengeSeed: null
};

// Tap-to-place state (mobile support)
let selectedForMix = null;

// DOM Elements
let elements = {};

/**
 * Initialize the game
 */
function init() {
    cacheElements();
    setupEventListeners();
    parseShareURL();
    loadSavedPreferences();
    addAudioControls();
    console.log('Italian Brainrot Mixing Mod initialized!');
    console.log('Created by Luka & Pappa');
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
    const savedApiKey = localStorage.getItem('_gk') || localStorage.getItem('gemini_api_key');

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
        settingsBtn: document.getElementById('settings-btn'),
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
        shareBtn: document.getElementById('share-btn'),

        // Lightbox
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightbox-image'),
        lightboxCaption: document.getElementById('lightbox-caption'),

        // Social features
        challengeBanner: document.getElementById('challenge-banner'),
        challengeSeedDisplay: document.getElementById('challenge-seed'),
        dailyChallengeBtn: document.getElementById('daily-challenge-btn'),
        shareFab: document.getElementById('share-fab')
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

    // Settings button (back to Parents Zone)
    elements.settingsBtn?.addEventListener('click', () => {
        // Reset content option highlights
        elements.contentOptions.forEach(btn => {
            btn.style.transform = '';
            btn.style.boxShadow = '';
        });
        switchScreen('parents-zone');
    });

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
    [elements.slot1, elements.slot2].forEach((slot, i) => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);
        // Tap-to-place: clicking a slot places the selected card
        slot.addEventListener('click', () => handleSlotTap(i));
    });

    // Lightbox
    elements.lightbox?.querySelector('.lightbox-backdrop')?.addEventListener('click', closeLightbox);
    elements.lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // Social feature buttons
    elements.dailyChallengeBtn?.addEventListener('click', startDailyChallenge);
    elements.shareFab?.addEventListener('click', shareChallenge);
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
        // Tap-to-place for mobile
        card.addEventListener('click', (e) => {
            // Don't trigger tap if clicking lightbox image
            if (e.target.closest('.character-image img')) return;
            handleCardTap(char.id);
        });
    } else if (mode === 'starter') {
        card.addEventListener('click', () => toggleStarterSelection(char.id));
    }

    const fame = calculateDisplayFame(char);

    // Image priority: generated (AI fusion) > local portrait > wiki > emoji
    let imageContent;
    const imgStyle = 'width: 100%; height: 100%; border-radius: 10px; object-fit: cover;';
    if (char.generatedImage) {
        imageContent = `<img src="${char.generatedImage}" alt="${char.name}" style="${imgStyle}">`;
    } else if (char.localImage) {
        imageContent = `<img src="${char.localImage}" alt="${char.name}" style="${imgStyle}" onerror="this.parentElement.innerHTML='${char.emoji}'">`;
    } else if (char.wikiImageUrl) {
        imageContent = `<img src="${char.wikiImageUrl}" alt="${char.name}" style="${imgStyle}" onerror="this.parentElement.innerHTML='${char.emoji}'">`;
    } else {
        imageContent = char.emoji;
    }

    card.innerHTML = `
        <span class="tier-badge ${tierClass}">${char.tier}</span>
        <div class="character-image">${imageContent}</div>
        <div class="character-name">${char.name}</div>
        <div class="character-fame">${fame.toLocaleString()}</div>
    `;

    // Lightbox: click image to view fullscreen
    const imgEl = card.querySelector('.character-image img');
    if (imgEl) {
        imgEl.addEventListener('click', (e) => {
            e.stopPropagation();
            openLightbox(imgEl.src, char.name);
        });
        imgEl.style.cursor = 'zoom-in';
    }

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

    // Show challenge banner if in challenge mode
    if (state.isChallenge && elements.challengeBanner) {
        elements.challengeBanner.classList.remove('hidden');
        if (elements.challengeSeedDisplay) {
            elements.challengeSeedDisplay.textContent = state.challengeSeed || state.globalSeed;
        }
    }

    // Render collection
    renderCollection();
    updateStats();
}

/**
 * Open lightbox with image
 */
function openLightbox(imageSrc, caption) {
    if (!elements.lightbox) return;
    elements.lightboxImage.src = imageSrc;
    elements.lightboxImage.alt = caption;
    elements.lightboxCaption.textContent = caption;
    elements.lightbox.classList.remove('hidden');
}

/**
 * Close lightbox
 */
function closeLightbox() {
    if (!elements.lightbox) return;
    elements.lightbox.classList.add('hidden');
    elements.lightboxImage.src = '';
}

/**
 * Handle tapping a collection card (tap-to-place for mobile)
 */
function handleCardTap(charId) {
    const char = state.collection.find(c => c.id === charId);
    if (!char) return;

    // If same card tapped again, deselect
    if (selectedForMix === charId) {
        selectedForMix = null;
        clearTapSelection();
        return;
    }

    // Select this card
    selectedForMix = charId;
    playSelect();

    // Update visual selection
    document.querySelectorAll('#collection-grid .character-card').forEach(card => {
        card.classList.toggle('selected-for-mix', card.dataset.characterId === charId);
    });

    // Pulse empty/available slots
    [elements.slot1, elements.slot2].forEach((slot, i) => {
        const otherSlot = i === 0 ? 1 : 0;
        const isAvailable = !state.mixSlots[i] || (state.mixSlots[otherSlot]?.id !== charId);
        slot.classList.toggle('awaiting-tap', isAvailable && !state.mixSlots[i]);
    });
}

/**
 * Handle tapping a mix slot (places selected card)
 */
function handleSlotTap(slotIndex) {
    if (!selectedForMix) return;

    const char = state.collection.find(c => c.id === selectedForMix);
    if (!char) return;

    // Check if already in other slot
    const otherSlot = slotIndex === 0 ? 1 : 0;
    if (state.mixSlots[otherSlot]?.id === selectedForMix) {
        const slotEl = slotIndex === 0 ? elements.slot1 : elements.slot2;
        slotEl.classList.add('shake');
        setTimeout(() => slotEl.classList.remove('shake'), 500);
        playError();
        return;
    }

    // Place in slot
    state.mixSlots[slotIndex] = char;
    const slotEl = slotIndex === 0 ? elements.slot1 : elements.slot2;
    updateSlotDisplay(slotEl, char);
    updateMixButton();
    playDrop();
    playCharacterName(selectedForMix);

    // Clear selection
    selectedForMix = null;
    clearTapSelection();
}

/**
 * Clear tap-to-place visual state
 */
function clearTapSelection() {
    document.querySelectorAll('.character-card.selected-for-mix').forEach(card => {
        card.classList.remove('selected-for-mix');
    });
    [elements.slot1, elements.slot2].forEach(slot => {
        slot.classList.remove('awaiting-tap');
    });
}

/**
 * Switch between screens with transition
 */
function switchScreen(screenName) {
    const currentScreen = document.querySelector('.screen.active');
    state.screen = screenName;

    const targetScreen = {
        'parents-zone': elements.parentsZoneScreen,
        'starter': elements.starterScreen,
        'game': elements.gameScreen,
        'boss': elements.bossScreen
    }[screenName];

    if (!targetScreen) return;

    if (currentScreen && currentScreen !== targetScreen) {
        currentScreen.classList.add('screen-exit');
        setTimeout(() => {
            currentScreen.classList.remove('active', 'screen-exit');
            targetScreen.classList.add('active', 'screen-enter');
            setTimeout(() => targetScreen.classList.remove('screen-enter'), 300);
        }, 300);
    } else {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        targetScreen.classList.add('active', 'screen-enter');
        setTimeout(() => targetScreen.classList.remove('screen-enter'), 300);
    }
}

/**
 * Spawn particle burst effect
 */
function spawnParticles(container, count = 25, color = null) {
    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random direction
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
        const distance = 60 + Math.random() * 80;
        const px = Math.cos(angle) * distance;
        const py = Math.sin(angle) * distance;

        particle.style.setProperty('--px', `${px}px`);
        particle.style.setProperty('--py', `${py}px`);
        particle.style.left = `${centerX}px`;
        particle.style.top = `${centerY}px`;
        particle.style.backgroundColor = color || `hsl(${Math.random() * 360}, 80%, 60%)`;

        container.style.position = 'relative';
        container.appendChild(particle);

        setTimeout(() => particle.remove(), 800);
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
    const card = e.target.closest('.character-card');
    if (!card) return;
    card.classList.add('dragging');
    e.dataTransfer.setData('text/plain', card.dataset.characterId);
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    const card = e.target.closest('.character-card');
    if (card) card.classList.remove('dragging');
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
    // Show image in slot if available
    let slotImage;
    const slotImgStyle = 'width: 100%; height: 100%; border-radius: 10px; object-fit: cover;';
    if (char.generatedImage) {
        slotImage = `<img src="${char.generatedImage}" alt="${char.name}" style="${slotImgStyle}">`;
    } else if (char.localImage) {
        slotImage = `<img src="${char.localImage}" alt="${char.name}" style="${slotImgStyle}" onerror="this.parentElement.innerHTML='${char.emoji}'">`;
    } else if (char.wikiImageUrl) {
        slotImage = `<img src="${char.wikiImageUrl}" alt="${char.name}" style="${slotImgStyle}" onerror="this.parentElement.innerHTML='${char.emoji}'">`;
    } else {
        slotImage = char.emoji;
    }
    slotElement.innerHTML = `
        <div class="character-image" style="width: 60px; height: 60px; font-size: 2rem;">${slotImage}</div>
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
            // Show spinner in result area while generating
            elements.resultArea.classList.remove('hidden');
            elements.resultCharacter.innerHTML = '<div class="generating-spinner"></div><p style="color: var(--accent-gold); font-family: Bangers, cursive;">Generating fusion...</p>';
            elements.collectBtn.style.display = 'none';
            try {
                const imageGenerator = getImageGenerator();
                const fusionImage = await imageGenerator.getFusionImage(char1, char2);
                if (fusionImage) {
                    result.generatedImage = fusionImage;
                }
            } catch (error) {
                console.warn('Image generation failed:', error);
            }
            elements.collectBtn.style.display = '';
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

    // Image priority for result display
    let imageContent;
    const resultImgStyle = 'width: 100px; height: 100px; border-radius: 10px; object-fit: cover;';
    if (char.generatedImage) {
        imageContent = `<img src="${char.generatedImage}" alt="${char.name}" style="${resultImgStyle}">`;
    } else if (char.localImage) {
        imageContent = `<img src="${char.localImage}" alt="${char.name}" style="${resultImgStyle}">`;
    } else {
        imageContent = char.emoji;
    }

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

    // Particle burst on mix success
    const tierColors = {
        COMMON: '#888888',
        RARE: '#3498db',
        EPIC: '#9b59b6',
        LEGENDARY: '#f39c12',
        MYTHIC: '#ff6b9d'
    };
    const particleColor = isSpecial ? '#ffd700' : (tierColors[char.tier] || '#ffd700');
    const particleCount = isSpecial ? 35 : 25;
    setTimeout(() => spawnParticles(elements.resultCharacter, particleCount, particleColor), 100);
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
    // Boss image priority
    let bossImage;
    const bossImgStyle = 'width: 100%; height: 100%; border-radius: 10px; object-fit: cover;';
    if (finalChar.generatedImage) {
        bossImage = `<img src="${finalChar.generatedImage}" alt="${finalChar.name}" style="${bossImgStyle}">`;
    } else if (finalChar.localImage) {
        bossImage = `<img src="${finalChar.localImage}" alt="${finalChar.name}" style="${bossImgStyle}">`;
    } else {
        bossImage = finalChar.emoji;
    }

    elements.finalBossDisplay.innerHTML = `
        <div class="character-card mythic" style="width: auto; max-width: 300px; margin: 0 auto; padding: 20px;">
            <div class="character-image" style="width: 150px; height: 150px; font-size: 5rem;">${bossImage}</div>
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
    // Build share URL with seed and starters
    const url = new URL(window.location.href.split('?')[0]);
    url.searchParams.set('seed', state.globalSeed);
    url.searchParams.set('starters', state.selectedStarters.join(','));

    const shareText = `I became the FINAL BOSS in Italian Brainrot Mixing Mod!\n` +
        `Fame: ${state.totalFame.toLocaleString()}\n` +
        `Mixes: ${state.mixCount}\n` +
        `Collection: ${state.collection.length} characters\n\n` +
        `Challenge me: ${url.toString()}`;

    if (navigator.share) {
        navigator.share({
            title: 'Italian Brainrot Mixing Mod',
            text: shareText,
            url: url.toString()
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => {
            showToast('Challenge link copied to clipboard!');
        });
    }
}

/**
 * Parse share URL query parameters
 */
function parseShareURL() {
    const params = new URLSearchParams(window.location.search);
    const seed = params.get('seed');
    const starters = params.get('starters');

    if (seed && starters) {
        state.globalSeed = parseInt(seed, 10);
        state.challengeSeed = seed;
        state.isChallenge = true;
        state.selectedStarters = starters.split(',').filter(Boolean);

        // Validate starters exist
        const allChars = getAllBaseCharacters();
        state.selectedStarters = state.selectedStarters.filter(id =>
            allChars.some(c => c.id === id)
        );

        if (state.selectedStarters.length === 3) {
            // Skip parents zone and starter selection, go straight to game
            const savedRating = localStorage.getItem('contentRating');
            if (savedRating) {
                state.contentRating = savedRating;
            }
            // Defer start to after DOM is fully ready
            setTimeout(() => {
                startGame();
                showToast('Challenge loaded! Same seed = same results');
            }, 100);
        }
    }
}

/**
 * Get a deterministic daily challenge seed based on today's date
 */
function getDailyChallengeSeed() {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    return hashString(`daily-brainrot-${dateStr}`);
}

/**
 * Start the daily challenge
 */
function startDailyChallenge() {
    const seed = getDailyChallengeSeed();
    const rng = new MersenneTwister(seed);
    const allChars = getAllBaseCharacters();

    // Pick 3 deterministic starters from the full roster
    const starterIndices = new Set();
    while (starterIndices.size < 3) {
        starterIndices.add(rng.random_int31() % allChars.length);
    }

    state.globalSeed = seed;
    state.challengeSeed = seed;
    state.isChallenge = true;
    state.selectedStarters = [...starterIndices].map(i => allChars[i].id);

    // Load saved content rating
    const savedRating = localStorage.getItem('contentRating');
    if (savedRating) {
        state.contentRating = savedRating;
    }

    startGame();
    showToast('Daily Challenge started! Same starters for everyone today');
}

/**
 * Show a styled toast notification
 */
function showToast(message, duration = 3000) {
    // Remove existing toast if any
    const existing = document.querySelector('.share-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
