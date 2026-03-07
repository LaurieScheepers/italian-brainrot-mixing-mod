/**
 * Italian Brainrot Mixing Mod - Main Game Logic
 * by Luka & Pappa
 */

import { getAllBaseCharacters, getTierInfo, calculateDisplayFame } from './characters.js';
import { mixCharacters, checkSpecialCombo, applySpecialCombo, hashString } from './mixing.js';
import { MersenneTwister } from './mersenne.js';
import { getGeminiAPI, saveApiKey, initGeminiFromStorage } from './gemini-api.js';
import { getImageGenerator } from './image-generator.js';
import { markComboDiscovered, getComboStats, renderComboBook } from './combo-book.js';
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
import { checkAchievements, getEarnedAchievements, getAllAchievements } from './achievements.js';
import { renderFamilyTree } from './family-tree.js';

// Progressive unlock thresholds
const UNLOCK_THRESHOLDS = { 3: 5, 4: 15 }; // slots: mixCount needed

// Game State
const state = {
    screen: 'parents-zone',
    contentRating: 'pg',
    selectedStarters: [],
    collection: [],
    totalFame: 0,
    totalCoins: 0,
    mixCount: 0,
    maxSlots: 2,
    globalSeed: Date.now(),
    mixSlots: [null, null],
    lastResult: null,
    isFinalBoss: false,
    geminiConfigured: false,
    isChallenge: false,
    challengeSeed: null,
    specialCombosFound: 0,
    highestTierCreated: null,
    lastMixParentCount: 0,
    collectionSort: 'newest'
};

// Tap-to-place state (mobile support)
let selectedForMix = null;

/**
 * Render character image with fallback chain (DRY)
 * Priority: generatedImage > localImage > wikiImageUrl > emoji
 */
function renderCharacterImage(char, style = 'width: 100%; height: 100%; border-radius: 10px; object-fit: cover;') {
    if (char.generatedImage) {
        return `<img src="${char.generatedImage}" alt="${char.name}" style="${style}">`;
    }
    if (char.localImage) {
        return `<img src="${char.localImage}" alt="${char.name}" style="${style}" onerror="this.parentElement.innerHTML='${char.emoji}'">`;
    }
    if (char.wikiImageUrl) {
        return `<img src="${char.wikiImageUrl}" alt="${char.name}" style="${style}" onerror="this.parentElement.innerHTML='${char.emoji}'">`;
    }
    return char.emoji;
}

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

    // Achievement trophy button
    const trophyBtn = document.getElementById('achievement-btn');
    if (trophyBtn) {
        trophyBtn.addEventListener('click', showAchievementGallery);
    }
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
 * Save game state to localStorage (metadata only, images stay in IndexedDB)
 */
function saveGameState() {
    const saveData = {
        collection: state.collection.map(c => ({
            id: c.id, name: c.name, nickname: c.nickname, tier: c.tier, fameBase: c.fameBase,
            emoji: c.emoji, species: c.species, origin: c.origin,
            abilities: c.abilities, parents: c.parents, parentNames: c.parentNames,
            generationDepth: c.generationDepth, isCombo: c.isCombo, seed: c.seed,
            localImage: c.localImage, wikiImageUrl: c.wikiImageUrl,
            audio: c.audio, description: c.description
        })),
        totalFame: state.totalFame,
        totalCoins: state.totalCoins,
        mixCount: state.mixCount,
        maxSlots: state.maxSlots,
        globalSeed: state.globalSeed,
        selectedStarters: state.selectedStarters,
        specialCombosFound: state.specialCombosFound,
        highestTierCreated: state.highestTierCreated
    };
    localStorage.setItem('brainrot_save', JSON.stringify(saveData));
}

/**
 * Load saved game state from localStorage
 */
function loadGameState() {
    const saved = localStorage.getItem('brainrot_save');
    if (!saved) return false;

    try {
        const data = JSON.parse(saved);
        state.collection = data.collection || [];
        state.totalFame = data.totalFame || 0;
        state.totalCoins = data.totalCoins || 0;
        state.mixCount = data.mixCount || 0;
        state.maxSlots = data.maxSlots || 2;
        state.globalSeed = data.globalSeed || Date.now();
        state.selectedStarters = data.selectedStarters || [];
        state.specialCombosFound = data.specialCombosFound || 0;
        state.highestTierCreated = data.highestTierCreated || null;
        return true;
    } catch (e) {
        console.warn('Failed to load save data:', e);
        return false;
    }
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

    // Check for challenge URL first (overrides save)
    if (state.isChallenge) return;

    // Try to resume saved game
    if (savedRating && loadGameState() && state.collection.length > 0) {
        if (confirm('Continue where you left off?')) {
            switchScreen('game');
            renderMixSlots();
            renderCollection();
            updateStats();
            if (state.isChallenge && elements.challengeBanner) {
                elements.challengeBanner.classList.remove('hidden');
            }
            return;
        }
        // User chose not to continue - clear save
        localStorage.removeItem('brainrot_save');
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

    // Drag and drop for mixing bowl slots (dynamic for progressive unlock)
    setupSlotListeners();

    // Lightbox
    elements.lightbox?.querySelector('.lightbox-backdrop')?.addEventListener('click', closeLightbox);
    elements.lightbox?.querySelector('.lightbox-close')?.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });

    // Social feature buttons
    elements.dailyChallengeBtn?.addEventListener('click', startDailyChallenge);
    elements.shareFab?.addEventListener('click', shareChallenge);

    // Combo book button
    document.getElementById('combo-book-btn')?.addEventListener('click', openComboBook);

    // Family tree button
    document.getElementById('family-tree-btn')?.addEventListener('click', openFamilyTree);
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
        card.addEventListener('click', () => handleCardTap(char.id));
    } else if (mode === 'starter') {
        card.addEventListener('click', () => toggleStarterSelection(char.id));
    }

    const fame = calculateDisplayFame(char);
    const imageContent = renderCharacterImage(char);

    const displayName = char.nickname || char.name;
    const originalName = char.nickname ? `<div class="original-name">${char.name}</div>` : '';

    card.innerHTML = `
        <span class="tier-badge ${tierClass}">${char.tier}</span>
        <div class="character-image">${imageContent}</div>
        <div class="character-name">${displayName}</div>${originalName}
        <div class="character-fame">${fame.toLocaleString()}</div>
    `;

    // Nickname tap for mixed characters in collection
    if (mode === 'collection' && char.isCombo) {
        const nameEl = card.querySelector('.character-name');
        nameEl.style.cursor = 'pointer';
        nameEl.title = 'Tap to nickname';
        nameEl.addEventListener('click', (e) => {
            e.stopPropagation();
            promptNickname(char);
        });
    }

    // Long-press to view fullscreen (KISS for mobile)
    const imgEl = card.querySelector('.character-image img');
    if (imgEl) {
        let pressTimer;
        imgEl.style.cursor = 'zoom-in';
        card.addEventListener('touchstart', (e) => {
            pressTimer = setTimeout(() => {
                e.preventDefault();
                openLightbox(imgEl.src, char.name);
            }, 500);
        }, { passive: false });
        card.addEventListener('touchend', () => clearTimeout(pressTimer));
        card.addEventListener('touchmove', () => clearTimeout(pressTimer));
        // Desktop: double-click for lightbox
        imgEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            openLightbox(imgEl.src, char.name);
        });
    }

    return card;
}

/**
 * Prompt player to give a nickname to a mixed character
 */
function promptNickname(char) {
    const current = char.nickname || char.name;
    const nickname = prompt('Give a nickname:', current);
    if (nickname !== null && nickname.trim()) {
        char.nickname = nickname.trim();
        saveGameState();
        renderCollection();
    }
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

    // Render mixing bowl slots for current unlock level
    renderMixSlots();

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

    // Pulse empty slots
    elements.mixingBowl.querySelectorAll('.mix-slot').forEach((slot, i) => {
        slot.classList.toggle('awaiting-tap', !state.mixSlots[i]);
    });

    // Auto-place if there's an empty slot (KISS for Luka)
    const emptySlotIdx = state.mixSlots.findIndex(s => s === null);
    if (emptySlotIdx !== -1) {
        handleSlotTap(emptySlotIdx);
    }
}

/**
 * Handle tapping a mix slot (places selected card)
 */
function handleSlotTap(slotIndex) {
    if (!selectedForMix) return;

    const char = state.collection.find(c => c.id === selectedForMix);
    if (!char) return;

    // Check if already in another slot
    if (state.mixSlots.some((s, i) => i !== slotIndex && s?.id === selectedForMix)) {
        const slotEl = document.getElementById(`slot-${slotIndex + 1}`);
        if (slotEl) {
            slotEl.classList.add('shake');
            setTimeout(() => slotEl.classList.remove('shake'), 500);
        }
        playError();
        return;
    }

    // Place in slot
    state.mixSlots[slotIndex] = char;
    const slotEl = document.getElementById(`slot-${slotIndex + 1}`);
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
    elements.mixingBowl.querySelectorAll('.mix-slot').forEach(slot => {
        slot.classList.remove('awaiting-tap');
    });
}

/**
 * Render mixing bowl slots dynamically based on maxSlots
 */
function renderMixSlots() {
    const bowl = elements.mixingBowl;
    bowl.innerHTML = '';
    state.mixSlots = new Array(state.maxSlots).fill(null);

    for (let i = 0; i < state.maxSlots; i++) {
        if (i > 0) {
            const op = document.createElement('div');
            op.className = 'mix-operator';
            op.textContent = '+';
            bowl.appendChild(op);
        }
        const slot = document.createElement('div');
        slot.className = 'mix-slot';
        slot.dataset.slot = String(i + 1);
        slot.id = `slot-${i + 1}`;
        slot.innerHTML = '<span class="slot-label">Drop Here</span>';
        bowl.appendChild(slot);
    }

    setupSlotListeners();
    updateMixButton();
}

/**
 * Setup event listeners for all current mix slots
 */
function setupSlotListeners() {
    const slots = elements.mixingBowl.querySelectorAll('.mix-slot');
    slots.forEach((slot, i) => {
        slot.addEventListener('dragover', handleDragOver);
        slot.addEventListener('dragleave', handleDragLeave);
        slot.addEventListener('drop', handleDrop);
        slot.addEventListener('click', () => handleSlotTap(i));
    });
}

/**
 * Check and apply progressive unlock
 */
function checkProgressiveUnlock() {
    for (const [slots, threshold] of Object.entries(UNLOCK_THRESHOLDS)) {
        const slotCount = parseInt(slots);
        if (state.mixCount >= threshold && state.maxSlots < slotCount) {
            state.maxSlots = slotCount;
            renderMixSlots();
            showToast(`NEW SLOT UNLOCKED! You can now mix ${slotCount} characters!`, 4000);
            // Particle burst on the new slot
            const newSlot = document.getElementById(`slot-${slotCount}`);
            if (newSlot) {
                newSlot.classList.add('slot-unlock');
                setTimeout(() => spawnParticles(newSlot, 20, '#ffd700'), 100);
            }
        }
    }
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
 * Get collection sorted by current sort preference (purely visual)
 */
function getSortedCollection() {
    const TIER_ORDER = { MYTHIC: 5, LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 };
    const sorted = [...state.collection];

    switch (state.collectionSort) {
        case 'fame-desc':
            sorted.sort((a, b) => (b.fameBase || 0) - (a.fameBase || 0));
            break;
        case 'fame-asc':
            sorted.sort((a, b) => (a.fameBase || 0) - (b.fameBase || 0));
            break;
        case 'tier':
            sorted.sort((a, b) => (TIER_ORDER[b.tier] || 0) - (TIER_ORDER[a.tier] || 0));
            break;
        case 'name':
            sorted.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
        default:
            // Keep original order (insertion order)
            break;
    }
    return sorted;
}

/**
 * Render sort controls above the collection grid
 */
function renderSortControls() {
    const controls = document.getElementById('sort-controls');
    if (!controls) return;

    const options = [
        { value: 'newest', label: 'Newest' },
        { value: 'fame-desc', label: 'Fame \u2193' },
        { value: 'fame-asc', label: 'Fame \u2191' },
        { value: 'tier', label: 'Tier' },
        { value: 'name', label: 'A-Z' },
    ];

    controls.innerHTML = options.map(opt =>
        `<button class="sort-btn ${state.collectionSort === opt.value ? 'active' : ''}"
                 data-sort="${opt.value}">${opt.label}</button>`
    ).join('');

    controls.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.collectionSort = btn.dataset.sort;
            renderCollection();
        });
    });
}

/**
 * Render the collection grid
 */
function renderCollection() {
    elements.collectionGrid.innerHTML = '';

    const sorted = getSortedCollection();

    sorted.forEach((char, i) => {
        const card = createCharacterCard(char, 'collection');
        card.classList.add('card-enter');
        card.style.animationDelay = `${i * 50}ms`;
        elements.collectionGrid.appendChild(card);
    });

    renderSortControls();
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

    // Check if already in another slot
    if (state.mixSlots.some((s, i) => i !== slotIndex && s?.id === charId)) {
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
    const slotImage = renderCharacterImage(char);
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
    const filledCount = state.mixSlots.filter(Boolean).length;
    elements.mixButton.disabled = filledCount < 2;
    if (filledCount >= 2) {
        elements.mixButton.textContent = filledCount > 2 ? `MIX ${filledCount}!` : 'MIX!';
    }
    renderMixPreview();
}

/**
 * Get a preview hint for the current mix slot contents.
 * Returns tier range and special combo detection.
 */
function getMixPreview() {
    const parents = state.mixSlots.filter(Boolean);
    if (parents.length < 2) return null;

    // Check for special combo (2 parents only)
    let isSpecial = false;
    if (parents.length === 2) {
        isSpecial = checkSpecialCombo(parents[0], parents[1]) !== null;
    }

    // Predict tier range based on parents
    const TIER_ORDER = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
    const parentTiers = parents.map(p => TIER_ORDER.indexOf(p.tier));
    const maxTier = Math.max(...parentTiers);
    const baseTier = TIER_ORDER[maxTier];
    const upgradeTier = maxTier < 4 ? TIER_ORDER[maxTier + 1] : null;

    // Average fame hint
    const avgFame = Math.floor(parents.reduce((s, p) => s + p.fameBase, 0) / parents.length);

    return { baseTier, upgradeTier, avgFame, isSpecial, parentCount: parents.length };
}

/**
 * Render (or hide) the mix preview hint above the MIX button.
 */
function renderMixPreview() {
    let preview = document.getElementById('mix-preview');
    if (!preview) {
        preview = document.createElement('div');
        preview.id = 'mix-preview';
        preview.className = 'mix-preview';
        // Insert before the mix button
        elements.mixButton.parentNode.insertBefore(preview, elements.mixButton);
    }

    const info = getMixPreview();
    if (!info) {
        preview.innerHTML = '';
        preview.style.display = 'none';
        return;
    }

    preview.style.display = 'block';

    const tierColors = {
        COMMON: '#888',
        RARE: '#3498db',
        EPIC: '#9b59b6',
        LEGENDARY: '#f39c12',
        MYTHIC: '#ff6b9d'
    };

    const tierColor = tierColors[info.baseTier] || '#888';
    const upgradeHint = info.upgradeTier
        ? `<span class="preview-upgrade">or ${info.upgradeTier}!</span>`
        : '';
    const specialHint = info.isSpecial
        ? '<span class="preview-special">SPECIAL COMBO!</span>'
        : '';

    preview.innerHTML = `
        <span class="preview-tier" style="color: ${tierColor}">${info.baseTier}</span>
        ${upgradeHint}
        ${specialHint}
        <span class="preview-fame">~${info.avgFame} base fame</span>
    `;
}

/**
 * Perform the mix!
 */
async function performMix() {
    // Need at least 2 filled slots
    const parents = state.mixSlots.filter(Boolean);
    if (parents.length < 2) return;

    // Animate button + vortex
    elements.mixButton.classList.add('mixing');
    elements.mixButton.disabled = true;
    elements.mixButton.textContent = 'MIXING...';
    elements.mixingBowl.classList.add('mixing-vortex');

    // Play mixing sound
    playMixing();

    // Mix after animation
    setTimeout(async () => {
        // Perform mix with all parents
        let result = mixCharacters(parents, state.globalSeed);

        // Check for special combo (2-parent combos only)
        let specialCombo = null;
        if (parents.length === 2) {
            specialCombo = checkSpecialCombo(parents[0], parents[1]);
            if (specialCombo) {
                result = applySpecialCombo(result, specialCombo);
                markComboDiscovered(parents[0].id, parents[1].id);
            }
        }

        // Try to generate AI fusion image (first 2 parents for prompt)
        if (state.geminiConfigured) {
            elements.mixButton.textContent = 'GENERATING...';
            elements.resultArea.classList.remove('hidden');
            elements.resultCharacter.innerHTML = '<div class="generating-spinner"></div><p style="color: var(--accent-gold); font-family: Bangers, cursive;">Generating fusion...</p>';
            elements.collectBtn.style.display = 'none';
            try {
                const imageGenerator = getImageGenerator();
                const fusionImage = await imageGenerator.getFusionImage(parents[0], parents[1]);
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
        state.lastMixParentCount = parents.length;

        // Track special combos found
        if (specialCombo) {
            state.specialCombosFound++;
        }

        // Track highest tier created
        const TIER_RANK = { COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, MYTHIC: 5 };
        const resultRank = TIER_RANK[result.tier] || 0;
        const currentRank = TIER_RANK[state.highestTierCreated] || 0;
        if (resultRank > currentRank) {
            state.highestTierCreated = result.tier;
        }

        // Update collection size for achievement checks
        state.collectionSize = state.collection.length;

        // Check achievements
        const newAchievements = checkAchievements(state);
        newAchievements.forEach((ach, i) => {
            setTimeout(() => showAchievementToast(ach), i * 800);
        });

        // Show result
        showResult(result, specialCombo !== null);

        // Play success or special combo sound
        if (specialCombo) {
            playSpecialCombo();
        } else {
            playSuccess();
        }

        // Reset all slots
        state.mixSlots = new Array(state.maxSlots).fill(null);
        elements.mixingBowl.querySelectorAll('.mix-slot').forEach(slot => clearSlotDisplay(slot));

        elements.mixingBowl.classList.remove('mixing-vortex');
        elements.mixButton.classList.remove('mixing');
        elements.mixButton.textContent = 'MIX!';
        updateMixButton();

        // Check progressive unlock
        checkProgressiveUnlock();

    }, 1000);
}

/**
 * Show mix result
 */
function showResult(char, isSpecial) {
    const fame = calculateDisplayFame(char);

    const resultImgStyle = 'width: 100px; height: 100px; border-radius: 10px; object-fit: cover;';
    const imageContent = renderCharacterImage(char, resultImgStyle);

    elements.resultCharacter.innerHTML = `
        <div class="character-card ${char.tier.toLowerCase()}" style="width: auto; max-width: 200px; margin: 0 auto;">
            <span class="tier-badge ${char.tier.toLowerCase()}">${char.tier}</span>
            <div class="character-image" style="width: 100px; height: 100px; font-size: 3rem; overflow: hidden;">
                ${imageContent}
            </div>
            <div class="character-name">${char.name}</div>
            <div class="character-fame">${fame.toLocaleString()}</div>
            ${isSpecial ? '<div style="color: #39ff14; margin-top: 5px;">SPECIAL COMBO!</div>' : ''}
            ${char.generatedImage ? '<div style="color: #00f5ff; font-size: 0.7rem; margin-top: 3px;">AI Generated</div>' : ''}
            <div style="font-size: 0.7rem; color: #888; margin-top: 5px;">
                ${char.parentNames.join(' + ')}
            </div>
        </div>
    `;

    elements.resultArea.classList.remove('hidden');

    // Bug 2 fix: attach lightbox to result image
    const resultImg = elements.resultCharacter.querySelector('.character-image img');
    if (resultImg) {
        resultImg.style.cursor = 'zoom-in';
        resultImg.addEventListener('click', () => openLightbox(resultImg.src, char.name));
    }

    // Enhanced particles based on tier and parent count
    const tierColors = {
        COMMON: '#888888',
        RARE: '#3498db',
        EPIC: '#9b59b6',
        LEGENDARY: '#f39c12',
        MYTHIC: '#ff6b9d'
    };
    const particleColor = isSpecial ? '#ffd700' : (tierColors[char.tier] || '#ffd700');
    const parentCount = char.parentNames?.length || 2;
    const particleCount = (isSpecial ? 40 : 20) + (parentCount * 5);
    setTimeout(() => spawnParticles(elements.resultCharacter, particleCount, particleColor), 100);

    // Screen shake for Legendary/Mythic
    if (char.tier === 'LEGENDARY' || char.tier === 'MYTHIC') {
        document.getElementById('game-screen').classList.add('screen-shake');
        setTimeout(() => document.getElementById('game-screen').classList.remove('screen-shake'), 500);
    }

    // Tier flash for upgraded results
    const resultCard = elements.resultCharacter.querySelector('.character-card');
    if (resultCard) {
        resultCard.classList.add('tier-flash');
    }
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

    // Update UI + save
    renderCollection();
    updateStats();
    saveGameState();
}

/**
 * Become the Final Boss!
 */
function becomeFinalBoss(finalChar) {
    state.isFinalBoss = true;

    // Check achievements after becoming final boss
    state.collectionSize = state.collection.length;
    const newAchievements = checkAchievements(state);
    newAchievements.forEach((ach, i) => {
        setTimeout(() => showAchievementToast(ach), i * 800);
    });

    // Play epic fanfare
    playFinalBoss();

    // Show boss screen
    const bossImage = renderCharacterImage(finalChar);

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
    state.mixSlots = new Array(state.maxSlots).fill(null);
    state.mixCount = 0;
    state.lastResult = null;
    // Keep some fame as bonus
    state.totalFame = Math.floor(state.totalFame * 0.1);
    state.totalCoins = 0;
    state.isFinalBoss = false;

    localStorage.removeItem('brainrot_save');
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
 * Show an achievement toast notification (slides in from top)
 */
function showAchievementToast(achievement) {
    const toast = document.createElement('div');
    toast.className = 'achievement-toast';
    toast.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-text">
            <div class="achievement-title">Achievement Unlocked!</div>
            <div class="achievement-name">${achievement.name}</div>
        </div>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

/**
 * Show the achievements gallery modal
 */
function showAchievementGallery() {
    const earned = getEarnedAchievements();
    const all = getAllAchievements();

    const modal = document.createElement('div');
    modal.className = 'achievement-modal';
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });

    const grid = document.createElement('div');
    grid.className = 'achievement-grid';

    all.forEach(ach => {
        const isEarned = earned.includes(ach.id);
        const card = document.createElement('div');
        card.className = `achievement-card ${isEarned ? 'earned' : 'locked'}`;
        card.innerHTML = `
            <div class="icon">${isEarned ? ach.icon : '?'}</div>
            <div class="name">${isEarned ? ach.name : '???'}</div>
            <div class="desc">${isEarned ? ach.description : 'Keep playing to unlock!'}</div>
        `;
        grid.appendChild(card);
    });

    const closeBtn = document.createElement('button');
    closeBtn.className = 'achievement-close-btn';
    closeBtn.textContent = 'CLOSE';
    closeBtn.addEventListener('click', () => modal.remove());

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; flex-direction: column; align-items: center; gap: 15px;';

    const title = document.createElement('h2');
    title.className = 'achievement-gallery-title';
    title.textContent = `ACHIEVEMENTS (${earned.length}/${all.length})`;

    wrapper.appendChild(title);
    wrapper.appendChild(grid);
    wrapper.appendChild(closeBtn);
    modal.appendChild(wrapper);
    document.body.appendChild(modal);
}

/**
 * Open the Combo Discovery Book modal
 */
function openComboBook() {
    // Remove existing if open
    document.getElementById('combo-book-modal')?.remove();
    const html = renderComboBook();
    document.body.insertAdjacentHTML('beforeend', html);
}

/**
 * Open the Family Tree modal
 */
function openFamilyTree() {
    document.getElementById('family-tree-modal')?.remove();
    const html = renderFamilyTree(state.collection);
    document.body.insertAdjacentHTML('beforeend', html);
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
