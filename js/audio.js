/**
 * Italian Brainrot Mixing Mod - Audio System
 * Web Audio API for SFX + HTML5 Audio for music
 */

import { getCharacterById } from './characters.js';

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
        console.log('Audio system initialized');
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
// SHARED AUDIO HELPERS
// ============================================

/**
 * Create and connect a gain node to destination
 */
function makeGain(value = 1) {
    const gain = audioCtx.createGain();
    gain.gain.value = value * audioState.sfxVolume;
    gain.connect(audioCtx.destination);
    return gain;
}

/**
 * Create an oscillator connected to a gain node
 */
function makeOsc(type, frequency, gain) {
    const osc = audioCtx.createOscillator();
    osc.type = type;
    osc.frequency.value = frequency;
    osc.connect(gain);
    return osc;
}

/**
 * Schedule attack-decay envelope on a gain node
 */
function scheduleAD(gain, volume, attack, decay) {
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * audioState.sfxVolume, now + attack);
    gain.gain.exponentialRampToValueAtTime(0.001, now + attack + decay);
    return now + attack + decay;
}

/**
 * Create a noise buffer (white noise)
 */
function makeNoiseBuffer(duration) {
    const frames = Math.ceil(audioCtx.sampleRate * duration);
    const buffer = audioCtx.createBuffer(1, frames, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
}

/**
 * Play a noise burst through a filter
 */
function playNoiseBurst(filterType, filterFreq, duration, volumeMod = 1) {
    const source = audioCtx.createBufferSource();
    source.buffer = makeNoiseBuffer(duration);
    const filter = audioCtx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;
    const gain = makeGain(0);
    const end = scheduleAD(gain, volumeMod * 0.4, 0.005, duration);
    source.connect(filter);
    filter.connect(gain);
    source.start();
    source.stop(end);
}

/**
 * Play a single tone with attack-decay envelope
 */
function playToneAD(frequency, type, attack, decay, volumeMod = 1) {
    const gain = makeGain(0);
    const end = scheduleAD(gain, volumeMod, attack, decay);
    const osc = makeOsc(type, frequency, gain);
    osc.start();
    osc.stop(end);
}

// Legacy playTone kept for synthError (unchanged)
function playTone(frequency, duration, type = 'sine', volumeMod = 1) {
    if (!audioCtx || !audioState.sfxEnabled) return;
    const gain = makeGain(0);
    const volume = audioState.sfxVolume * volumeMod;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    const osc = makeOsc(type, frequency, gain);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

// ============================================
// SYNTHESIZED SOUNDS
// ============================================

/**
 * Select: two rising tones + harmonic overtone on each
 */
function synthSelect() {
    playToneAD(440, 'sine', 0.01, 0.12);
    playToneAD(880, 'sine', 0.01, 0.10, 0.25); // overtone at 2x
    setTimeout(() => {
        playToneAD(550, 'sine', 0.01, 0.12);
        playToneAD(1100, 'sine', 0.01, 0.10, 0.25); // overtone at 2x
    }, 55);
}

/**
 * Drop: low triangle + noise burst through low-pass for "plop" texture
 */
function synthDrop() {
    playToneAD(200, 'triangle', 0.005, 0.15);
    playNoiseBurst('lowpass', 300, 0.08, 0.6);
    setTimeout(() => playToneAD(150, 'triangle', 0.005, 0.10), 100);
}

/**
 * Mixing: sawtooth sweep with LFO modulation + stereo panning
 */
function synthMixing() {
    if (!audioCtx || !audioState.sfxEnabled) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const panner = audioCtx.createStereoPanner();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();

    // LFO modulates frequency depth
    lfo.frequency.value = 6;
    lfoGain.gain.value = 40;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.5);
    osc.frequency.linearRampToValueAtTime(200, audioCtx.currentTime + 1);

    // Panning sweep L -> R
    panner.pan.setValueAtTime(-0.6, audioCtx.currentTime);
    panner.pan.linearRampToValueAtTime(0.6, audioCtx.currentTime + 1);

    gain.gain.setValueAtTime(audioState.sfxVolume * 0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);

    osc.connect(gain);
    gain.connect(panner);
    panner.connect(audioCtx.destination);

    lfo.start();
    osc.start();
    lfo.stop(audioCtx.currentTime + 1);
    osc.stop(audioCtx.currentTime + 1);
}

/**
 * Success: vibrato C→D chord with staggered attacks and sustain tail
 */
function synthSuccess() {
    const cMajor = [523.25, 659.25, 783.99];
    const dMajor = [587.33, 739.99, 880];

    cMajor.forEach((freq, i) => {
        setTimeout(() => {
            playToneAD(freq, 'sine', 0.02, 0.35);
            _playWithVibrato(freq, 0.35); // vibrato shimmer
        }, i * 30);
    });
    setTimeout(() => {
        dMajor.forEach((freq, i) => {
            setTimeout(() => playToneAD(freq, 'sine', 0.02, 0.5), i * 30);
        });
    }, 220);
}

/**
 * Add vibrato layer on top of a note (thin, decorative)
 */
function _playWithVibrato(baseFreq, duration) {
    if (!audioCtx || !audioState.sfxEnabled) return;

    const osc = audioCtx.createOscillator();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    const gain = makeGain(0);

    lfo.frequency.value = 5;
    lfoGain.gain.value = 6;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.type = 'sine';
    osc.frequency.value = baseFreq;
    osc.connect(gain);

    scheduleAD(gain, 0.15, 0.03, duration);

    lfo.start();
    osc.start();
    lfo.stop(audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
}

/**
 * Special combo: arpeggio with echo delay, richer triangle waveform
 */
function synthSpecialCombo() {
    if (!audioCtx || !audioState.sfxEnabled) return;

    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25];
    const delay = audioCtx.createDelay(1.0);
    const delayFeedback = audioCtx.createGain();
    delay.delayTime.value = 0.18;
    delayFeedback.gain.value = 0.35;
    delay.connect(delayFeedback);
    delayFeedback.connect(delay);
    delay.connect(audioCtx.destination);

    notes.forEach((freq, i) => {
        setTimeout(() => {
            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(audioState.sfxVolume * 0.45, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
            const osc = makeOsc('triangle', freq, gain);
            gain.connect(delay);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.18);
        }, i * 80);
    });
}

/**
 * Final Boss: sub-bass rumble + cymbal crash + wider chord voicing
 */
function synthFinalBoss() {
    if (!audioCtx || !audioState.sfxEnabled) return;

    // Sub-bass rumble at 40 Hz
    playToneAD(40, 'sine', 0.05, 1.2, 0.7);

    // Cymbal crash: high-pass filtered noise
    playNoiseBurst('highpass', 6000, 1.0, 0.5);

    // Wider chord voicing (add 5th and octave layers)
    const fanfare = [
        { freq: 130.81, time: 0 },    // bass C
        { freq: 261.63, time: 0 },
        { freq: 329.63, time: 150 },
        { freq: 392, time: 300 },
        { freq: 523.25, time: 450 },
        { freq: 659.25, time: 600 },
        { freq: 783.99, time: 750 },
        { freq: 1046.5, time: 900 },
        { freq: 1318.5, time: 900 }   // high E added
    ];

    fanfare.forEach(({ freq, time }) => {
        setTimeout(() => playToneAD(freq, 'sine', 0.01, 0.45), time);
    });

    // Bass foundation
    setTimeout(() => {
        playToneAD(130.81, 'triangle', 0.02, 0.8, 0.7);
        playToneAD(196, 'triangle', 0.02, 0.8, 0.5);
    }, 900);
}

/**
 * Collect: shimmer — two detuned high sines
 */
function synthCollect() {
    playToneAD(880, 'sine', 0.01, 0.12);
    playToneAD(892, 'sine', 0.01, 0.14, 0.5);   // slightly detuned
    setTimeout(() => {
        playToneAD(1108.73, 'sine', 0.01, 0.18);
        playToneAD(1122, 'sine', 0.01, 0.18, 0.5); // slightly detuned pair
    }, 85);
}

/**
 * Error: unchanged
 */
function synthError() {
    playTone(200, 0.2, 'square', 0.3);
    setTimeout(() => playTone(150, 0.2, 'square', 0.3), 100);
}

// ============================================
// TTS — CHARACTER VOICE
// ============================================

// Voice cache: resolved after voiceschanged fires
let _ttsVoices = null;

/**
 * Get available voices, resolving the Chrome empty-on-first-call bug
 */
function getVoicesAsync() {
    return new Promise((resolve) => {
        if (_ttsVoices) { resolve(_ttsVoices); return; }
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) { _ttsVoices = voices; resolve(voices); return; }
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            _ttsVoices = window.speechSynthesis.getVoices();
            resolve(_ttsVoices);
        }, { once: true });
    });
}

/**
 * Speak text using Italian voice if available, with comedic kid-friendly parameters
 */
export async function speakCatchphrase(text) {
    if (!audioState.sfxEnabled) return;
    if (!window.speechSynthesis) return;

    const voices = await getVoicesAsync();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.3;
    utterance.pitch = 1.4;

    const italianVoice = voices.find(v => v.lang.startsWith('it'));
    if (italianVoice) utterance.voice = italianVoice;

    window.speechSynthesis.speak(utterance);
}

// ============================================
// FILE-BASED AUDIO (when files exist)
// ============================================

const audioCache = new Map();

/**
 * Load an audio file
 */
async function loadAudio(path) {
    if (audioCache.has(path)) return audioCache.get(path);

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

export function playSelect() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.select, synthSelect);
}

export function playDrop() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.drop, synthDrop);
}

export function playMixing() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.mixing, synthMixing);
}

export function playSuccess() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.success, synthSuccess);
}

export function playSpecialCombo() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.specialCombo, synthSpecialCombo);
}

export function playFinalBoss() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.finalBoss, synthFinalBoss);
}

export function playCollect() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.collect, synthCollect);
}

export function playError() {
    initAudio();
    playAudioOrSynth(AUDIO_PATHS.sfx.error, synthError);
}

/**
 * Play character name audio.
 * Tries audio file first; falls back to SpeechSynthesis catchphrase.
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
            return;
        }
    } catch (error) {
        // fall through to TTS
    }

    const character = getCharacterById(characterId);
    if (character && character.audio && character.audio.catchphrase) {
        speakCatchphrase(character.audio.catchphrase);
    }
}

// ============================================
// MUSIC API
// ============================================

export async function playMusic(track) {
    initAudio();
    if (!audioState.musicEnabled) return;
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

export function stopMusic() {
    if (audioState.currentMusic) {
        audioState.currentMusic.pause();
        audioState.currentMusic.currentTime = 0;
        audioState.currentMusic = null;
    }
}

export function pauseMusic() {
    if (audioState.currentMusic) audioState.currentMusic.pause();
}

export function resumeMusic() {
    if (audioState.currentMusic && audioState.musicEnabled) {
        audioState.currentMusic.play();
    }
}

// ============================================
// UTILITIES
// ============================================

export function playRandomBrainrot() {
    initAudio();
    if (!audioState.sfxEnabled) return;
    const sounds = [synthSelect, synthDrop, synthSuccess, synthCollect];
    sounds[Math.floor(Math.random() * sounds.length)]();
}

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
