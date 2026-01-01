/**
 * Gemini API Integration Tests
 * Run with: node tests/test-gemini.js
 */

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ GEMINI_API_KEY environment variable required');
    console.error('   Run: GEMINI_API_KEY=your_key node tests/test-gemini.js');
    process.exit(1);
}
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const GEMINI_MODEL = 'gemini-2.0-flash-exp-image-generation';

// Test characters
const testChar1 = {
    id: 'tung-tung-tung-sahur',
    name: 'Tung Tung Tung Sahur',
    species: 'Tungsten/Wood',
    emoji: '🪵',
    abilities: ['Baseball Bat', 'Giant Gorilla Form', 'Mech Transform']
};

const testChar2 = {
    id: 'bombardiro-crocodilo',
    name: 'Bombardiro Crocodilo',
    species: 'Crocodile/Bomber',
    emoji: '🐊',
    abilities: ['Aerial Bombing', 'Sky Chase', 'Crocodile Bite']
};

// Style prompts by content rating
const STYLE_PROMPTS = {
    kids: `Style: Cute, colorful, cartoon-style illustration
        - Friendly, happy expressions with big eyes
        - Bright, cheerful rainbow colors
        - Fun and playful composition`,
    pg: `Style: Classic Italian Brainrot meme aesthetic
        - Surreal but fun hybrid creature
        - Vibrant, bold colors
        - Quirky and humorous expression`,
    pg13: `Style: Maximum absurdity brainrot aesthetic
        - Surreal AI-generated style
        - Bold, striking composition
        - True to original meme energy`
};

function generateFusionPrompt(parent1, parent2, contentRating = 'pg') {
    const stylePrompt = STYLE_PROMPTS[contentRating];
    return `Create a fun, imaginative hybrid creature image that combines two Italian Brainrot characters.

FUSION OF:
Character 1: ${parent1.name}
- Type: ${parent1.species}
- Emoji: ${parent1.emoji}
- Traits: ${parent1.abilities.join(', ')}

Character 2: ${parent2.name}
- Type: ${parent2.species}
- Emoji: ${parent2.emoji}
- Traits: ${parent2.abilities.join(', ')}

${stylePrompt}

REQUIREMENTS:
- Create a SINGLE hybrid creature combining both parents
- Square composition (1:1 aspect ratio)
- White or transparent background
- Family-friendly game aesthetic

OUTPUT: One hybrid creature illustration, centered, high quality`;
}

async function testApiConnection() {
    console.log('🔌 Test 1: API Connection...');

    try {
        const response = await fetch(`${GEMINI_API_BASE}/models?key=${API_KEY}`);

        if (response.ok) {
            const data = await response.json();
            const imageModels = data.models?.filter(m => m.name.includes('image')) || [];
            console.log('   ✅ API connection successful');
            console.log(`   📋 Found ${data.models?.length || 0} models`);
            if (imageModels.length > 0) {
                console.log(`   🖼️  Image models: ${imageModels.map(m => m.name.split('/').pop()).join(', ')}`);
            }
            return true;
        } else {
            const error = await response.text();
            console.log(`   ❌ API error: ${response.status}`);
            console.log(`   ${error}`);
            return false;
        }
    } catch (error) {
        console.log(`   ❌ Connection failed: ${error.message}`);
        return false;
    }
}

async function testImageGeneration(contentRating = 'pg') {
    console.log(`\n🎨 Test 2: Image Generation (${contentRating.toUpperCase()})...`);

    const prompt = generateFusionPrompt(testChar1, testChar2, contentRating);
    console.log(`   📝 Prompt length: ${prompt.length} chars`);

    try {
        const startTime = Date.now();

        const response = await fetch(
            `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseModalities: ["TEXT", "IMAGE"]
                    }
                })
            }
        );

        const elapsed = Date.now() - startTime;

        if (!response.ok) {
            const error = await response.text();
            console.log(`   ❌ Generation failed: ${response.status}`);
            console.log(`   ${error}`);
            return false;
        }

        const data = await response.json();

        // Check for image in response
        let hasImage = false;
        let imageSize = 0;
        let textResponse = '';

        if (data.candidates?.[0]?.content?.parts) {
            for (const part of data.candidates[0].content.parts) {
                if (part.inlineData?.mimeType?.startsWith('image/')) {
                    hasImage = true;
                    imageSize = part.inlineData.data.length;
                }
                if (part.text) {
                    textResponse = part.text.substring(0, 100);
                }
            }
        }

        if (hasImage) {
            console.log(`   ✅ Image generated successfully`);
            console.log(`   ⏱️  Time: ${elapsed}ms`);
            console.log(`   📦 Image size: ${(imageSize / 1024).toFixed(1)} KB (base64)`);
            return true;
        } else {
            console.log(`   ⚠️  No image in response`);
            if (textResponse) {
                console.log(`   📄 Text: ${textResponse}...`);
            }
            console.log(`   📋 Response structure:`, JSON.stringify(data, null, 2).substring(0, 500));
            return false;
        }

    } catch (error) {
        console.log(`   ❌ Request failed: ${error.message}`);
        return false;
    }
}

async function testRateLimiting() {
    console.log('\n⏱️  Test 3: Rate Limiting (2 rapid requests)...');

    const prompt = 'Generate a simple test image of a happy cartoon character';

    try {
        const start = Date.now();

        // Send two requests rapidly
        const promises = [1, 2].map(async (n) => {
            const response = await fetch(
                `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
                    })
                }
            );
            return { n, status: response.status, ok: response.ok };
        });

        const results = await Promise.all(promises);
        const elapsed = Date.now() - start;

        const allOk = results.every(r => r.ok);
        const statuses = results.map(r => `Request ${r.n}: ${r.status}`).join(', ');

        console.log(`   ${allOk ? '✅' : '⚠️'} ${statuses}`);
        console.log(`   ⏱️  Total time: ${elapsed}ms`);

        return allOk;

    } catch (error) {
        console.log(`   ❌ Rate limit test failed: ${error.message}`);
        return false;
    }
}

async function runAllTests() {
    console.log('═══════════════════════════════════════════════');
    console.log('🧪 Italian Brainrot - Gemini API Tests');
    console.log('═══════════════════════════════════════════════');
    console.log(`📍 Model: ${GEMINI_MODEL}`);
    console.log(`🔑 API Key: ${API_KEY.substring(0, 10)}...${API_KEY.substring(API_KEY.length - 4)}`);
    console.log('');

    const results = {
        connection: await testApiConnection(),
        imageGen: await testImageGeneration('pg'),
        rateLimit: await testRateLimiting()
    };

    console.log('\n═══════════════════════════════════════════════');
    console.log('📊 Test Results:');
    console.log(`   Connection:  ${results.connection ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Image Gen:   ${results.imageGen ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`   Rate Limit:  ${results.rateLimit ? '✅ PASS' : '⚠️ LIMITED'}`);
    console.log('═══════════════════════════════════════════════');

    const allPassed = Object.values(results).every(r => r);
    process.exit(allPassed ? 0 : 1);
}

runAllTests();
