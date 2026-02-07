/**
 * Italian Brainrot Mixing Mod - Audio System
 * Web Audio API for SFX + HTML5 Audio for music
 */

// Audio Context (created on first user interaction)
let audioCtx = null;

// State
const audioState = {
    musicEnabled: true,
    sfxEnabled: true,
    musicVolume: 0.3,
    sfxVolume: 0.5,
    currentMusic: null,
    isInitialized: false
};

// Audio file paths
const AUDIO_PATHS = {
    music: {
        menu: 'assets/audio/music/menu-theme.mp3',
        game: 'assets/audio/music/game-theme.mp3',
        boss: 'assets/audio/music/boss-theme.mp3'
    },
    sfx: {
        select: 'assets/audio/sfx/select.mp3',
        drop: 'assets/audio/sfx/drop.mp3',
        mixing: 'assets/audio/sfx/mixing.mp3',
        success: 'assets/audio/sfx/success.mp3',
        specialCombo: 'assets/audio/sfx/special-combo.mp3',
        finalBoss: 'assets/audio/sfx/final-boss.mp3',
        collect: 'assets/audio/sfx/collect.mp3',
        error: 'assets/audio/sfx/error.mp3'
    },
    names: {} // Populated dynamically for character names
};

/**
 * Initialize audio context (must be called from user interaction)
 */
export function initAudio() {
    if (audioState.isInitialized) return;

    try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        audioState.isInitialized = true;
        loadPreferences();
        console.log('🔊 Audio system initialized');
    } catch (error) {
        console.warn('Audio not supported:', error);
    }
}

/**
 * Load audio preferences from localStorage
 */
function loadPreferences() {
    const prefs = localStorage.getItem('audioPrefs');
    if (prefs) {
        const parsed = JSON.parse(prefs);
        Object.assign(audioState, parsed);
    }
}

/**
 * Save audio preferences to localStorage
 */
function savePreferences() {
    localStorage.setItem('audioPrefs', JSON.stringify({
        musicEnabled: audioState.musicEnabled,
        sfxEnabled: audioState.sfxEnabled,
        musicVolume: audioState.musicVolume,
        sfxVolume: audioState.sfxVolume
    }));
}

/**
 * Toggle music on/off
 */
export function toggleMusic() {
    audioState.musicEnabled = !audioState.musicEnabled;
    if (!audioState.musicEnabled && audioState.currentMusic) {
        audioState.currentMusic.pause();
    }
    savePreferences();
    return audioState.musicEnabled;
}

/**
 * Toggle SFX on/off
 */
export function toggleSFX() {
    audioState.sfxEnabled = !audioState.sfxEnabled;
    savePreferences();
    return audioState.sfxEnabled;
}

/**
 * Set music volume (0-1)
 */
export function setMusicVolume(volume) {
    audioState.musicVolume = Math.max(0, Math.min(1, volume));
    if (audioState.currentMusic) {
        audioState.currentMusic.volume = audioState.musicVolume;
    }
    savePreferences();
}

/**
 * Set SFX volume (0-1)
 */
export function setSFXVolume(volume) {
    audioState.sfxVolume = Math.max(0, Math.min(1, volume));
    savePreferences();
}

/**
 * Get current audio state
 */
export function getAudioState() {
    return { ...audioState };
}

// ============================================
// SYNTHESIZED SOUNDS (Fallback when no files)
// ============================================

/**
 * Play a synthesized beep/tone
 */
function playTone(frequency, duration, type = 'sine', volumeMod = 1) {
    if (!audioCtx || !audioState.sfxEnabled) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    const volume = audioState.sfxVolume * volumeMod;
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
}

/**
 * Play a chord (multiple frequencies)
 */
function playChord(frequencies, duration, type = 'sine') {
    frequencies.forEach((freq, i) => {
        setTimeout(() => playTone(freq, duration, type, 0.5), i * 50);
    });
}

/**
 * Play synthesized select sound
 */
function synthSelect() {
    playTone(440, 0.1, 'sine');
    setTimeout(() => playTone(550, 0.1, 'sine'), 50);
}

/**
 * Play synthesized drop sound
 */
function synthDrop() {
    playTone(200, 0.15, 'triangle');
    setTimeout(() => playTone(150, 0.1, 'triangle'), 100);
}

/**
 * Play synthesized mixing sound
 */
function synthMixing() {
    if (!audioCtx || !audioState.sfxEnabled) return;

    // Swirling sound effect
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.5);
    oscillator.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 1);

    gainNode.gain.setValueAtTime(audioState.sfxVolume * 0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 1);
}

/**
 * Play synthesized success sound
 */
function synthSuccess() {
    playChord([523.25, 659.25, 783.99], 0.3, 'sine'); // C major chord
    setTimeout(() => playChord([587.33, 739.99, 880], 0.4, 'sine'), 200); // D major
}

/**
 * Play synthesized special combo sound
 */
function synthSpecialCombo() {
    // Arpeggio
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25];
    notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 0.15, 'sine'), i * 80);
    });
}

/**
 * Play synthesized Final Boss fanfare
 */
function synthFinalBoss() {
    if (!audioCtx || !audioState.sfxEnabled) return;

    // Epic fanfare
    const fanfare = [
        { freq: 261.63, time: 0 },
        { freq: 329.63, time: 150 },
        { freq: 392, time: 300 },
        { freq: 523.25, time: 450 },
        { freq: 659.25, time: 600 },
        { freq: 783.99, time: 750 },
        { freq: 1046.5, time: 900 }
    ];

    fanfare.forEach(({ freq, time }) => {
        setTimeout(() => playTone(freq, 0.4, 'sine'), time);
    });

    // Add bass
    setTimeout(() => {
        playTone(130.81, 0.8, 'triangle', 0.7);
        playTone(196, 0.8, 'triangle', 0.5);
    }, 900);
}

/**
 * Play synthesized collect sound
 */
function synthCollect() {
    playTone(880, 0.1, 'sine');
    setTimeout(() => playTone(1108.73, 0.15, 'sine'), 80);
}

/**
 * Play synthesized error sound
 */
function synthError() {
    playTone(200, 0.2, 'square', 0.3);
    setTimeout(() => playTone(150, 0.2, 'square', 0.3), 100);
}

// ============================================
// FILE-BASED AUDIO (when files exist)
// ============================================

const audioCache = new Map();

/**
 * Load an audio file
 */
async function loadAudio(path) {
    if (audioCache.has(path)) {
        return audioCache.get(path);
    }

    try {
        const audio = new Audio(path);
        await new Promise((resolve, reject) => {
            audio.oncanplaythrough = resolve;
            audio.onerror = reject;
            audio.load();
        });
        audioCache.set(path, audio);
        return audio;
    } catch (error) {
        return null;
    }
}

/**
 * Play audio file or fallback to synth
 */
async function playAudioOrSynth(path, synthFallback) {
    if (!audioState.sfxEnabled) return;

    try {
        const audio = await loadAudio(path);
        if (audio) {
            const clone = audio.cloneNode();
            clone.volume = audioState.sfxVolume;
            clone.play();
            return;
        }
    } catch (error) {
        // Fallback to synth
    }

    synthFallback();
}

// ============================================
// PUBLIC SFX API
// ============================================

/**
 * Play select sound (character selected on starter screen)
 */
export function playSelect() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.select, synthSelect);
}

/**
 * Play drop sound (character dropped in mixing bowl)
 */
export function playDrop() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.drop, synthDrop);
}

/**
 * Play mixing sound (mixing in progress)
 */
export function playMixing() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.mixing, synthMixing);
}

/**
 * Play success sound (mix complete)
 */
export function playSuccess() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.success, synthSuccess);
}

/**
 * Play special combo sound
 */
export function playSpecialCombo() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.specialCombo, synthSpecialCombo);
}

/**
 * Play Final Boss fanfare
 */
export function playFinalBoss() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.finalBoss, synthFinalBoss);
}

/**
 * Play collect sound (character added to collection)
 */
export function playCollect() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.collect, synthCollect);
}

/**
 * Play error sound (invalid action)
 */
export function playError() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.error, synthError);
}

/**
 * Play character name audio
 */
export async function playCharacterName(characterId) {
    initAudio();
    if (!audioState.sfxEnabled) return;

    const path = `assets/audio/names/${characterId}.mp3`;
    try {
        const audio = await loadAudio(path);
        if (audio) {
            const clone = audio.cloneNode();
            clone.volume = audioState.sfxVolume;
            clone.play();
        }
    } catch (error) {
        // No audio file for this character - silent fallback
    }
}

// ============================================
// MUSIC API
// ============================================

/**
 * Play background music for a screen
 */
export async function playMusic(track) {
    initAudio();
    if (!audioState.musicEnabled) return;

    // Stop current music
    stopMusic();

    const path = AUDIO_PATHS.music[track];
    if (!path) return;

    try {
        const audio = await loadAudio(path);
        if (audio) {
            audioState.currentMusic = audio.cloneNode();
            audioState.currentMusic.loop = true;
            audioState.currentMusic.volume = audioState.musicVolume;
            audioState.currentMusic.play();
        }
    } catch (error) {
        // No music file - silent fallback
    }
}

/**
 * Stop current background music
 */
export function stopMusic() {
    if (audioState.currentMusic) {
        audioState.currentMusic.pause();
        audioState.currentMusic.currentTime = 0;
        audioState.currentMusic = null;
    }
}

/**
 * Pause current background music
 */
export function pauseMusic() {
    if (audioState.currentMusic) {
        audioState.currentMusic.pause();
    }
}

/**
 * Resume current background music
 */
export function resumeMusic() {
    if (audioState.currentMusic && audioState.musicEnabled) {
        audioState.currentMusic.play();
    }
}

// ============================================
// UTILITIES
// ============================================

/**
 * Play a random brainrot sound (for fun)
 */
export function playRandomBrainrot() {
    initAudio();
    if (!audioState.sfxEnabled) return;

    const sounds = [synthSelect, synthDrop, synthSuccess, synthCollect];
    const random = sounds[Math.floor(Math.random() * sounds.length)];
    random();
}

/**
 * Create audio controls UI element
 */
export function createAudioControls() {
    const container = document.createElement('div');
    container.className = 'audio-controls';
    container.innerHTML = `
        <button id="toggle-music" class="audio-btn" title="Toggle Music">
            ${audioState.musicEnabled ? '🎵' : '🔇'}
        </button>
        <button id="toggle-sfx" class="audio-btn" title="Toggle Sound Effects">
            ${audioState.sfxEnabled ? '🔊' : '🔈'}
        </button>
    `;

    container.querySelector('#toggle-music').addEventListener('click', () => {
        const enabled = toggleMusic();
        container.querySelector('#toggle-music').textContent = enabled ? '🎵' : '🔇';
    });

    container.querySelector('#toggle-sfx').addEventListener('click', () => {
        const enabled = toggleSFX();
        container.querySelector('#toggle-sfx').textContent = enabled ? '🔊' : '🔈';
    });

    return container;
}
