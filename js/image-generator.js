/**
 * Image Generator for Italian Brainrot Mixing Mod
 * Handles AI-generated fusion images with IndexedDB caching
 */

import { getGeminiAPI } from './gemini-api.js';

const DB_NAME = 'ItalianBrainrotDB';
const DB_VERSION = 1;
const IMAGE_STORE = 'fusionImages';

let db = null;

/**
 * Initialize IndexedDB for image caching
 */
async function initDB() {
    if (db) return db;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            // Create object store for fusion images
            if (!database.objectStoreNames.contains(IMAGE_STORE)) {
                const store = database.createObjectStore(IMAGE_STORE, { keyPath: 'id' });
                store.createIndex('parents', 'parentKey', { unique: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

/**
 * Generate a cache key from parent character IDs
 */
function getCacheKey(parent1Id, parent2Id) {
    return [parent1Id, parent2Id].sort().join('_');
}

/**
 * Get cached image from IndexedDB
 */
async function getCachedImage(parent1Id, parent2Id) {
    try {
        await initDB();
        const cacheKey = getCacheKey(parent1Id, parent2Id);

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([IMAGE_STORE], 'readonly');
            const store = transaction.objectStore(IMAGE_STORE);
            const index = store.index('parents');
            const request = index.get(cacheKey);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn('Cache read error:', error);
        return null;
    }
}

/**
 * Save image to IndexedDB cache
 */
async function cacheImage(parent1Id, parent2Id, imageData, mimeType) {
    try {
        await initDB();
        const cacheKey = getCacheKey(parent1Id, parent2Id);
        const id = `fusion_${cacheKey}_${Date.now()}`;

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([IMAGE_STORE], 'readwrite');
            const store = transaction.objectStore(IMAGE_STORE);

            const record = {
                id,
                parentKey: cacheKey,
                parent1Id,
                parent2Id,
                imageData,
                mimeType,
                timestamp: Date.now()
            };

            const request = store.put(record);
            request.onsuccess = () => resolve(record);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn('Cache write error:', error);
    }
}

/**
 * Convert base64 to blob URL for display
 */
function base64ToBlobUrl(base64Data, mimeType) {
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    return URL.createObjectURL(blob);
}

/**
 * Image Generator class
 */
export class ImageGenerator {
    constructor() {
        this.contentRating = localStorage.getItem('contentRating') || 'pg';
        this.generationQueue = [];
        this.isGenerating = false;
    }

    /**
     * Set content rating
     */
    setContentRating(rating) {
        this.contentRating = rating;
        localStorage.setItem('contentRating', rating);
    }

    /**
     * Get content rating
     */
    getContentRating() {
        return this.contentRating;
    }

    /**
     * Generate or retrieve fusion image
     * Returns image URL or null
     */
    async getFusionImage(parent1, parent2) {
        // Check cache first
        const cached = await getCachedImage(parent1.id, parent2.id);
        if (cached) {
            console.log('Using cached fusion image');
            return base64ToBlobUrl(cached.imageData, cached.mimeType);
        }

        // Try to generate with Gemini
        const gemini = getGeminiAPI();
        if (!gemini || !gemini.isConfigured()) {
            console.log('Gemini not configured, using fallback');
            return null;
        }

        console.log('Generating fusion image with Gemini...');

        try {
            const result = await gemini.generateFusionImage(
                parent1,
                parent2,
                this.contentRating
            );

            if (result) {
                // Cache the result
                await cacheImage(parent1.id, parent2.id, result.data, result.mimeType);

                // Return blob URL
                return base64ToBlobUrl(result.data, result.mimeType);
            }
        } catch (error) {
            console.error('Image generation failed:', error);
        }

        return null;
    }

    /**
     * Create a fallback image by combining parent emojis
     */
    createFallbackImage(parent1, parent2, newCharacter) {
        // Use emoji combination as fallback
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 200;
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, 200, 200);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 200, 200);

        // Draw parent emojis overlapping
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // First parent emoji (top-left)
        ctx.fillText(parent1.emoji, 70, 70);

        // Second parent emoji (bottom-right)
        ctx.fillText(parent2.emoji, 130, 130);

        // New character emoji (center, larger)
        ctx.font = '80px Arial';
        ctx.fillText(newCharacter.emoji || '?', 100, 100);

        return canvas.toDataURL('image/png');
    }

    /**
     * Clear all cached images
     */
    async clearCache() {
        try {
            await initDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([IMAGE_STORE], 'readwrite');
                const store = transaction.objectStore(IMAGE_STORE);
                const request = store.clear();

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.warn('Cache clear error:', error);
        }
    }

    /**
     * Get cache statistics
     */
    async getCacheStats() {
        try {
            await initDB();

            return new Promise((resolve, reject) => {
                const transaction = db.transaction([IMAGE_STORE], 'readonly');
                const store = transaction.objectStore(IMAGE_STORE);
                const countRequest = store.count();

                countRequest.onsuccess = () => {
                    resolve({
                        count: countRequest.result,
                        storeName: IMAGE_STORE
                    });
                };
                countRequest.onerror = () => reject(countRequest.error);
            });
        } catch (error) {
            return { count: 0, error: error.message };
        }
    }
}

// Singleton instance
let imageGeneratorInstance = null;

/**
 * Get the ImageGenerator singleton
 */
export function getImageGenerator() {
    if (!imageGeneratorInstance) {
        imageGeneratorInstance = new ImageGenerator();
    }
    return imageGeneratorInstance;
}
