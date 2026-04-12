// Agrupación de aminoácidos por propiedades físico-químicas
const AA_GROUPS = {
    'A': 'nonpolar', 'V': 'nonpolar', 'I': 'nonpolar', 'L': 'nonpolar', 'M': 'nonpolar', 'F': 'nonpolar', 'Y': 'nonpolar', 'W': 'nonpolar',
    'S': 'polar', 'T': 'polar', 'N': 'polar', 'Q': 'polar', 'C': 'polar',
    'D': 'acidic', 'E': 'acidic',
    'K': 'basic', 'R': 'basic', 'H': 'basic',
    'G': 'special', 'P': 'special' // Prolina y Glicina tienen propiedades estructurales únicas
};

// Sistema de penalizaciones (Scores)
const SCORES = {
    MATCH: 5,               // Coincidencia exacta
    CONSERVATIVE: 2,        // Mutación conservadora (mismo grupo químico)
    MISMATCH: -3,           // Mutación no conservadora (distinto grupo)
    GAP: -4                 // Penalización por inserción/deleción (hueco)
};

/**
 * Compara dos aminoácidos y devuelve el puntaje correspondiente.
 */
function getScore(aa1, aa2) {
    if (aa1 === aa2) return SCORES.MATCH;
    
    // Validar que ambos aminoácidos existan en nuestro diccionario
    if (AA_GROUPS[aa1] && AA_GROUPS[aa2] && AA_GROUPS[aa1] === AA_GROUPS[aa2]) {
        return SCORES.CONSERVATIVE;
    }
    
    return SCORES.MISMATCH;
}

/**
 * Identifica la relación entre dos aminoácidos para la interfaz visual.
 */
function getRelationType(aa1, aa2) {
    if (aa1 === '-' || aa2 === '-') return 'gap';
    if (aa1 === aa2) return 'match';
    if (AA_GROUPS[aa1] === AA_GROUPS[aa2]) return 'conservative';
    return 'mismatch';
}

module.exports = {
    AA_GROUPS,
    SCORES,
    getScore,
    getRelationType
};