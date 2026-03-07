/**
 * Family Tree Viewer for Italian Brainrot Mixing Mod
 * Shows parent-child mix lineage
 */

/**
 * Build a tree structure from the collection
 * Returns array of root nodes (characters with no parents in collection)
 * Each node: { char, children: [nodes] }
 */
export function buildFamilyTree(collection) {
    const byId = new Map(collection.map(c => [c.id, c]));
    const childMap = new Map(); // parentId -> [child chars]

    collection.forEach(char => {
        if (char.parents && char.isCombo) {
            char.parents.forEach(parentId => {
                if (!childMap.has(parentId)) childMap.set(parentId, []);
                childMap.get(parentId).push(char);
            });
        }
    });

    return { byId, childMap };
}

/**
 * Render the family tree modal
 */
export function renderFamilyTree(collection) {
    const { byId, childMap } = buildFamilyTree(collection);

    // Group: base characters (no parents) and mixed characters
    const baseChars = collection.filter(c => !c.isCombo);
    const mixedChars = collection.filter(c => c.isCombo);

    // Build lineage cards for mixed characters
    const lineageCards = mixedChars.map(char => {
        const parentEmojis = (char.parentNames || []).map((name, i) => {
            const parentId = char.parents?.[i];
            const parent = parentId ? byId.get(parentId) : null;
            return `<span class="tree-parent">${parent?.emoji || '?'} ${name}</span>`;
        }).join(' <span class="tree-plus">+</span> ');

        return `<div class="tree-lineage-card ${char.tier?.toLowerCase() || ''}">
            <div class="tree-parents-row">${parentEmojis}</div>
            <div class="tree-arrow">&#9660;</div>
            <div class="tree-result">
                <span class="tree-result-emoji">${char.emoji || '?'}</span>
                <span class="tree-result-name">${char.name}</span>
                <span class="tree-result-tier">${char.tier}</span>
            </div>
            ${char.generationDepth > 1 ? `<div class="tree-gen">Gen ${char.generationDepth}</div>` : ''}
        </div>`;
    }).join('');

    // Stats
    const maxGen = mixedChars.length > 0 ? Math.max(...mixedChars.map(c => c.generationDepth || 0)) : 0;

    return `
        <div class="family-tree-modal" id="family-tree-modal">
            <div class="family-tree-content">
                <div class="family-tree-header">
                    <h2>Family Tree</h2>
                    <div class="family-tree-stats">${mixedChars.length} mixes | Gen ${maxGen} deep</div>
                    <button class="family-tree-close" onclick="document.getElementById('family-tree-modal').remove()">&times;</button>
                </div>
                ${mixedChars.length === 0
                    ? '<div class="tree-empty">Mix some characters to see your family tree!</div>'
                    : `<div class="tree-lineage-list">${lineageCards}</div>`
                }
            </div>
        </div>
    `;
}
