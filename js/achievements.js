/**
 * Italian Brainrot Mixing Mod - Achievement System
 * by Luka & Pappa
 */

const ACHIEVEMENTS = [
    { id: 'first-mix', name: 'First Mix!', description: 'Mix your first character', icon: '\u{1F9EA}', condition: (state) => state.mixCount >= 1 },
    { id: 'five-mixes', name: 'Mix Master', description: 'Complete 5 mixes', icon: '\u{2697}\uFE0F', condition: (state) => state.mixCount >= 5 },
    { id: 'ten-mixes', name: 'Mad Scientist', description: 'Complete 10 mixes', icon: '\u{1F52C}', condition: (state) => state.mixCount >= 10 },
    { id: 'triple-mix', name: 'Triple Threat', description: 'Use 3 characters in one mix', icon: '\u{1F300}', condition: (state) => state.lastMixParentCount >= 3 },
    { id: 'quad-mix', name: 'Quad Power', description: 'Use 4 characters in one mix', icon: '\u{1F4A5}', condition: (state) => state.lastMixParentCount >= 4 },
    { id: 'special-combo', name: 'Combo Hunter', description: 'Discover a special combo', icon: '\u{2B50}', condition: (state) => state.specialCombosFound >= 1 },
    { id: 'three-combos', name: 'Combo Master', description: 'Find 3 special combos', icon: '\u{1F3C6}', condition: (state) => state.specialCombosFound >= 3 },
    { id: 'legendary', name: 'Legendary Creator', description: 'Create a Legendary character', icon: '\u{1F536}', condition: (state) => state.highestTierCreated === 'LEGENDARY' || state.highestTierCreated === 'MYTHIC' },
    { id: 'mythic', name: 'Mythic Master', description: 'Create a Mythic character', icon: '\u{1F48E}', condition: (state) => state.highestTierCreated === 'MYTHIC' },
    { id: 'collector-10', name: 'Collector', description: 'Have 10 characters', icon: '\u{1F4DA}', condition: (state) => state.collectionSize >= 10 },
    { id: 'final-boss', name: 'FINAL BOSS', description: 'Become the Final Boss!', icon: '\u{1F451}', condition: (state) => state.isFinalBoss },
    { id: 'fame-5000', name: 'Famous', description: 'Earn 5000 total fame', icon: '\u{1F31F}', condition: (state) => state.totalFame >= 5000 },
];

const STORAGE_KEY = 'brainrot_achievements';

/**
 * Get list of earned achievement IDs from localStorage
 */
export function getEarnedAchievements() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        return [];
    }
}

/**
 * Save earned achievement IDs to localStorage
 */
function saveEarnedAchievements(earned) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(earned));
}

/**
 * Check all achievements against current game state.
 * Returns array of newly earned achievement objects.
 */
export function checkAchievements(gameState) {
    const earned = getEarnedAchievements();
    const newlyEarned = [];

    for (const achievement of ACHIEVEMENTS) {
        if (earned.includes(achievement.id)) continue;

        try {
            if (achievement.condition(gameState)) {
                earned.push(achievement.id);
                newlyEarned.push(achievement);
            }
        } catch (e) {
            // Skip achievements that fail condition check
        }
    }

    if (newlyEarned.length > 0) {
        saveEarnedAchievements(earned);
    }

    return newlyEarned;
}

/**
 * Get an achievement definition by its ID
 */
export function getAchievementById(id) {
    return ACHIEVEMENTS.find(a => a.id === id) || null;
}

/**
 * Get all achievement definitions
 */
export function getAllAchievements() {
    return ACHIEVEMENTS;
}

export { ACHIEVEMENTS };
