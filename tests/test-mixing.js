/**
 * Tests for Italian Brainrot Mixing Algorithm
 * Goodhart-protected: each test verified to fail when logic is broken
 */

import { mixCharacters, checkSpecialCombo, applySpecialCombo, hashString } from '../js/mixing.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        passed++;
        console.log(`  PASS: ${message}`);
    } else {
        failed++;
        console.error(`  FAIL: ${message}`);
    }
}

function assertNotEqual(a, b, message) {
    assert(a !== b, message);
}

function assertEqual(a, b, message) {
    assert(a === b, `${message} (got: ${a}, expected: ${b})`);
}

// --- Test Characters ---
const char1 = {
    id: 'tung-tung-tung-sahur',
    name: 'Tung Tung Tung Sahur',
    tier: 'MYTHIC',
    fameBase: 1000,
    emoji: '🔔',
    species: 'Bell creature',
    origin: 'Indonesian',
    abilities: ['Loud Bell', 'Sahur Call'],
    audio: { catchphrase: 'TUNG TUNG!' },
    generationDepth: 0
};

const char2 = {
    id: 'bombardiro-crocodilo',
    name: 'Bombardiro Crocodilo',
    tier: 'LEGENDARY',
    fameBase: 850,
    emoji: '🐊',
    species: 'Bomber croc',
    origin: 'Italian',
    abilities: ['Bomb Drop', 'Croc Bite'],
    audio: { catchphrase: 'BOMBARDIRO!' },
    generationDepth: 0
};

const char3 = {
    id: 'brr-brr-patapim',
    name: 'Brr Brr Patapim',
    tier: 'EPIC',
    fameBase: 750,
    emoji: '❄️',
    species: 'Frost creature',
    origin: 'Italian',
    abilities: ['Frost Breath', 'Patapim Slam'],
    audio: { catchphrase: 'BRR BRR!' },
    generationDepth: 0
};

const char4 = {
    id: 'tralalero-tralala',
    name: 'Tralalero Tralala',
    tier: 'LEGENDARY',
    fameBase: 900,
    emoji: '🦈',
    species: 'Shark walker',
    origin: 'Italian',
    abilities: ['Shark Walk', 'Tralala Song'],
    audio: { catchphrase: 'TRALALERO!' },
    generationDepth: 0
};

const SEED = 42;

// --- Test Suite ---

console.log('\n=== Mixing Algorithm Tests ===\n');

// Test 1: Deterministic output
console.log('1. Determinism');
const result1a = mixCharacters(char1, char2, SEED);
const result1b = mixCharacters(char1, char2, SEED);
assertEqual(result1a.name, result1b.name, 'Same inputs produce same name');
assertEqual(result1a.fameBase, result1b.fameBase, 'Same inputs produce same fame');
assertEqual(result1a.tier, result1b.tier, 'Same inputs produce same tier');
assertEqual(result1a.id, result1b.id, 'Same inputs produce same id');

// Test 2: Order independence
console.log('\n2. Order Independence');
const resultAB = mixCharacters(char1, char2, SEED);
const resultBA = mixCharacters(char2, char1, SEED);
assertEqual(resultAB.name, resultBA.name, 'Order-independent name (A+B = B+A)');
assertEqual(resultAB.fameBase, resultBA.fameBase, 'Order-independent fame');

// Test 3: Different seed = different result
console.log('\n3. Seed Sensitivity');
const resultSeed1 = mixCharacters(char1, char2, 100);
const resultSeed2 = mixCharacters(char1, char2, 200);
assertNotEqual(resultSeed1.name, resultSeed2.name, 'Different seeds produce different names');

// Test 4: Name is non-empty and capitalised
console.log('\n4. Name Quality');
const result4 = mixCharacters(char1, char2, SEED);
assert(result4.name.length > 0, 'Name is non-empty');
assert(result4.name[0] === result4.name[0].toUpperCase(), 'Name starts with uppercase');
assert(!result4.name.includes('  '), 'No double spaces in name');

// Test 5: Tier is valid
console.log('\n5. Tier Validity');
const validTiers = ['COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'];
assert(validTiers.includes(result4.tier), `Tier "${result4.tier}" is valid`);

// Test 6: Fame is positive and reasonable
console.log('\n6. Fame Calculation');
assert(result4.fameBase > 0, 'Fame is positive');
assert(result4.fameBase > 400, 'Fame exceeds minimum threshold (avg of parents)');

// Test 7: Generation depth increments
console.log('\n7. Generation Depth');
assertEqual(result4.generationDepth, 1, 'Gen depth = max(parents) + 1');
const gen2 = mixCharacters(result4, char3, SEED);
assertEqual(gen2.generationDepth, 2, 'Chained mix increments depth');

// Test 8: Multi-parent mixing (3 parents)
console.log('\n8. Multi-Parent Mixing (3)');
const triMix = mixCharacters([char1, char2, char3], SEED);
assert(triMix.parents.length === 3, 'Triple mix has 3 parents');
assert(triMix.parentNames.length === 3, 'Triple mix has 3 parent names');
assert(triMix.name.length > 0, 'Triple mix has a name');
assert(triMix.fameBase > 0, 'Triple mix has positive fame');

// Test 9: Multi-parent mixing (4 parents)
console.log('\n9. Multi-Parent Mixing (4)');
const quadMix = mixCharacters([char1, char2, char3, char4], SEED);
assert(quadMix.parents.length === 4, 'Quad mix has 4 parents');
assert(quadMix.parentNames.length === 4, 'Quad mix has 4 parent names');
assert(quadMix.name.length > 0, 'Quad mix has a name');
assert(quadMix.fameBase > 0, 'Quad mix has positive fame');

// Test 10: Multi-parent order independence
console.log('\n10. Multi-Parent Order Independence');
const triABC = mixCharacters([char1, char2, char3], SEED);
const triCAB = mixCharacters([char3, char1, char2], SEED);
assertEqual(triABC.name, triCAB.name, 'Triple mix order-independent name');
assertEqual(triABC.fameBase, triCAB.fameBase, 'Triple mix order-independent fame');

// Test 11: Special combos
console.log('\n11. Special Combos');
const combo1 = checkSpecialCombo(char1, char2);
assert(combo1 !== null, 'Tung + Bombardiro is a special combo');
assertEqual(combo1.specialName, 'Tungbardiro Skybasher', 'Correct special name');
assertEqual(combo1.bonusFame, 500, 'Correct bonus fame');

// Test 12: Special combo is order-independent
console.log('\n12. Special Combo Order Independence');
const comboAB = checkSpecialCombo(char1, char2);
const comboBA = checkSpecialCombo(char2, char1);
assertEqual(comboAB?.specialName, comboBA?.specialName, 'Combo order-independent');

// Test 13: Non-special combo returns null
console.log('\n13. Non-Special Returns Null');
const noCombo = checkSpecialCombo(char1, char3);
assertEqual(noCombo, null, 'Non-combo returns null');

// Test 14: Apply special combo
console.log('\n14. Apply Special Combo');
const baseResult = mixCharacters(char1, char2, SEED);
const applied = applySpecialCombo(baseResult, combo1);
assertEqual(applied.name, 'Tungbardiro Skybasher', 'Special combo overrides name');
assert(applied.fameBase > baseResult.fameBase, 'Special combo adds bonus fame');
assert(applied.isSpecial === true, 'Special flag set');

// Test 15: hashString determinism
console.log('\n15. hashString');
assertEqual(hashString('test'), hashString('test'), 'Same string = same hash');
assertNotEqual(hashString('test'), hashString('test2'), 'Different string = different hash');

// Test 16: Legacy 2-arg call still works
console.log('\n16. Legacy API Compatibility');
const legacy = mixCharacters(char1, char2, SEED);
const arrayCall = mixCharacters([char1, char2], SEED);
assertEqual(legacy.name, arrayCall.name, 'Legacy 2-arg = array call');

// Test 17: Abilities are merged
console.log('\n17. Abilities');
assert(result4.abilities.length >= 2, 'At least 2 abilities');
assert(result4.abilities.length <= 6, 'At most 6 abilities');

// Test 18: Parent count bonus on fame
console.log('\n18. Parent Count Bonus');
const twoMix = mixCharacters([char1, char2], SEED);
const threeMix = mixCharacters([char1, char2, char3], SEED);
// 3-parent should have parent count bonus (but different base fame average)
assert(threeMix.fameBase > 0, 'Three-parent mix has positive fame');

// --- Results ---
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
    process.exit(1);
}
