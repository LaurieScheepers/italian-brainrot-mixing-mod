/**
 * Daily Challenge Rotation System
 * by Luka & Pappa
 */

const CHALLENGE_TYPES = [
    { id: 'speed-boss', name: 'Speed Boss', icon: '⚡', objective: 'Reach Final Boss in fewest mixes', metric: 'mixCount', limit: null },
    { id: 'collector', name: 'Collection Frenzy', icon: '📦', objective: 'Collect most characters in 10 mixes', metric: 'collectionSize', limit: 10 },
    { id: 'tier-hunter', name: 'Tier Hunter', icon: '👑', objective: 'Create highest tier in 5 mixes', metric: 'highestTier', limit: 5 },
    { id: 'combo-seeker', name: 'Combo Seeker', icon: '🔮', objective: 'Find most special combos in 12 mixes', metric: 'specialCombosFound', limit: 12 },
    { id: 'depth-diver', name: 'Depth Diver', icon: '🌊', objective: 'Reach max generation depth in 8 mixes', metric: 'maxDepth', limit: 8 },
    { id: 'fame-rush', name: 'Fame Rush', icon: '🌟', objective: 'Earn most fame in 8 mixes', metric: 'totalFame', limit: 8 }
];

const TIER_RANK = { COMMON: 1, RARE: 2, EPIC: 3, LEGENDARY: 4, MYTHIC: 5 };
const STORAGE_KEY = 'brainrot_challenge_scores';

// Score calculators keyed by challenge type id (DRY dispatch table)
const SCORE_CALCULATORS = {
    'speed-boss': ({ mixCount }) => Math.max(10, 100 - (mixCount * 5)),
    'collector': ({ collectionSize }) => Math.min(100, collectionSize * 10),
    'tier-hunter': ({ highestTier }) => Math.min(100, (TIER_RANK[highestTier] || 0) * 20),
    'combo-seeker': ({ specialCombosFound }) => Math.min(100, specialCombosFound * 25),
    'depth-diver': ({ maxDepth }) => Math.min(100, maxDepth * 15),
    'fame-rush': ({ totalFame }) => Math.min(100, totalFame / 100)
};

/**
 * Deterministic challenge type for a given seed
 */
export function getDailyChallengeType(seed) {
    return CHALLENGE_TYPES[seed % CHALLENGE_TYPES.length];
}

/**
 * Calculate score for a challenge type given current game state
 */
export function calculateChallengeScore(type, gameState) {
    const calc = SCORE_CALCULATORS[type.id];
    if (!calc) return 0;
    return Math.round(calc(gameState));
}

/**
 * Convert score to 1-3 star rating
 */
export function getStarRating(score) {
    if (score >= 85) return 3;
    if (score >= 60) return 2;
    if (score >= 30) return 1;
    return 0;
}

/**
 * Save a completed challenge score to localStorage
 */
export function saveChallengeScore(date, result) {
    const scores = loadChallengeScores();
    scores[date] = result;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

/**
 * Load all saved challenge scores from localStorage
 */
export function loadChallengeScores() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
        return {};
    }
}

/**
 * Get the best score ever recorded for a given challenge type id
 */
export function getBestScore(challengeTypeId) {
    const scores = loadChallengeScores();
    return Object.values(scores)
        .filter(r => r.typeId === challengeTypeId)
        .reduce((best, r) => (r.score > best ? r.score : best), 0);
}

/**
 * Count consecutive days (ending today) with a completed challenge
 */
export function getStreak() {
    const scores = loadChallengeScores();
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        if (scores[key]) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}
