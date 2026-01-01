/**
 * Gemini API Wrapper for Italian Brainrot Mixing Mod
 * Uses gemini-3-pro-image-preview (Nano Banana Pro) for fusion image generation
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-2.0-flash-preview-image-generation';

// Content rating style prompts
const STYLE_PROMPTS = {
    kids: `
        Style: Cute, colorful, cartoon-style illustration
        - Friendly, happy expressions with big eyes
        - Bright, cheerful rainbow colors
        - Fun and playful composition
        - Like a children's book illustration
        - Round, soft shapes - nothing scary
        - Whimsical and magical feeling
    `,
    pg: `
        Style: Classic Italian Brainrot meme aesthetic
        - Surreal but fun hybrid creature
        - Vibrant, bold colors
        - Quirky and humorous expression
        - Weird animal-object fusion (kid-safe)
        - Meme-worthy composition
        - Embraces the absurd in a fun way
    `,
    pg13: `
        Style: Maximum absurdity brainrot aesthetic
        - Surreal AI-generated style
        - Bold, striking composition
        - Embraces the weird and wonderful
        - True to original meme energy
        - Uncanny but not disturbing
        - Peak internet humor vibes
    `
};

/**
 * Generate a fusion image prompt for two characters
 */
export function generateFusionPrompt(parent1, parent2, contentRating = 'pg') {
    const stylePrompt = STYLE_PROMPTS[contentRating] || STYLE_PROMPTS.pg;

    return `Create a fun, imaginative hybrid creature image that combines two Italian Brainrot characters.

FUSION OF:
Character 1: ${parent1.name}
- Type: ${parent1.species || 'Unknown creature'}
- Emoji representation: ${parent1.emoji}
- Key traits: ${parent1.abilities ? parent1.abilities.join(', ') : 'mysterious powers'}

Character 2: ${parent2.name}
- Type: ${parent2.species || 'Unknown creature'}
- Emoji representation: ${parent2.emoji}
- Key traits: ${parent2.abilities ? parent2.abilities.join(', ') : 'mysterious powers'}

${stylePrompt}

REQUIREMENTS:
- Create a SINGLE hybrid creature that clearly combines elements of both parents
- The creature should look like it belongs in a fun mobile game
- Square composition (1:1 aspect ratio)
- White or transparent background
- The hybrid should be instantly recognizable as a mix of both characters
- Keep it appropriate for a family-friendly game

OUTPUT: One hybrid creature illustration, centered, high quality`;
}

/**
 * GeminiAPI class for image generation
 */
export class GeminiAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.requestCount = 0;
        this.lastRequestTime = 0;
    }

    /**
     * Check if API key is configured
     */
    isConfigured() {
        return !!this.apiKey && this.apiKey !== 'your_api_key_here';
    }

    /**
     * Rate limiting - max 10 requests per minute
     */
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;

        // Minimum 6 seconds between requests (10 per minute)
        if (timeSinceLastRequest < 6000) {
            await new Promise(resolve => setTimeout(resolve, 6000 - timeSinceLastRequest));
        }

        this.lastRequestTime = Date.now();
        this.requestCount++;
    }

    /**
     * Generate a fusion image using Gemini
     * @param {Object} parent1 - First parent character
     * @param {Object} parent2 - Second parent character
     * @param {string} contentRating - Content rating (kids, pg, pg13)
     * @returns {Promise<string>} - Base64 image data or null on failure
     */
    async generateFusionImage(parent1, parent2, contentRating = 'pg') {
        if (!this.isConfigured()) {
            console.warn('Gemini API key not configured');
            return null;
        }

        await this.waitForRateLimit();

        const prompt = generateFusionPrompt(parent1, parent2, contentRating);

        try {
            const response = await fetch(
                `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${this.apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }],
                        generationConfig: {
                            responseModalities: ["TEXT", "IMAGE"]
                        }
                    })
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API error:', response.status, errorText);
                return null;
            }

            const data = await response.json();

            // Extract image from response
            if (data.candidates && data.candidates[0]?.content?.parts) {
                for (const part of data.candidates[0].content.parts) {
                    if (part.inlineData?.mimeType?.startsWith('image/')) {
                        return {
                            data: part.inlineData.data,
                            mimeType: part.inlineData.mimeType
                        };
                    }
                }
            }

            console.warn('No image in Gemini response:', data);
            return null;

        } catch (error) {
            console.error('Gemini API request failed:', error);
            return null;
        }
    }

    /**
     * Test API connection
     */
    async testConnection() {
        if (!this.isConfigured()) {
            return { success: false, error: 'API key not configured' };
        }

        try {
            const response = await fetch(
                `${GEMINI_API_BASE}/models?key=${this.apiKey}`
            );

            if (response.ok) {
                return { success: true };
            } else {
                const errorText = await response.text();
                return { success: false, error: `API error: ${response.status}` };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}

// Singleton instance
let geminiInstance = null;

/**
 * Get or create Gemini API instance
 */
export function getGeminiAPI(apiKey = null) {
    if (apiKey) {
        geminiInstance = new GeminiAPI(apiKey);
    }
    return geminiInstance;
}

/**
 * Initialize Gemini API from localStorage or input
 */
export function initGeminiFromStorage() {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) {
        return getGeminiAPI(storedKey);
    }
    return null;
}

/**
 * Save API key to localStorage
 */
export function saveApiKey(apiKey) {
    localStorage.setItem('gemini_api_key', apiKey);
    return getGeminiAPI(apiKey);
}
