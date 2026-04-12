const { SCORES, getScore, getRelationType, AA_GROUPS } = require('./matrices');

function needlemanWunsch(seq1, seq2) {
    const len1 = seq1.length;
    const len2 = seq2.length;

    // 1. Inicializar la matriz de puntuaciones con ceros
    const matrix = Array.from(Array(len1 + 1), () => new Array(len2 + 1).fill(0));

    // Llenar la primera fila y columna con las penalizaciones por Gap
    for (let i = 0; i <= len1; i++) matrix[i][0] = i * SCORES.GAP;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j * SCORES.GAP;

    // 2. Llenar la matriz calculando el puntaje máximo para cada celda
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const matchScore = matrix[i - 1][j - 1] + getScore(seq1[i - 1], seq2[j - 1]);
            const deleteScore = matrix[i - 1][j] + SCORES.GAP;
            const insertScore = matrix[i][j - 1] + SCORES.GAP;

            matrix[i][j] = Math.max(matchScore, deleteScore, insertScore);
        }
    }

    // 3. Traceback (Rastreo hacia atrás para encontrar el alineamiento)
    let align1 = '';
    let align2 = '';
    let i = len1;
    let j = len2;
    
    let matches = 0;
    let conservatives = 0;
    let gaps = 0;

    while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && matrix[i][j] === matrix[i - 1][j - 1] + getScore(seq1[i - 1], seq2[j - 1])) {
            align1 = seq1[i - 1] + align1;
            align2 = seq2[j - 1] + align2;
            
            if (seq1[i - 1] === seq2[j - 1]) matches++;
            else if (AA_GROUPS[seq1[i-1]] === AA_GROUPS[seq2[j-1]]) conservatives++;
            
            i--; j--;
        } else if (i > 0 && matrix[i][j] === matrix[i - 1][j] + SCORES.GAP) {
            align1 = seq1[i - 1] + align1;
            align2 = '-' + align2;
            gaps++;
            i--;
        } else {
            align1 = '-' + align1;
            align2 = seq2[j - 1] + align2;
            gaps++;
            j--;
        }
    }

    // 4. Calcular métricas consolidadas
    const alignmentLength = align1.length;
    // Identidad: Porcentaje de coincidencias exactas respecto a la longitud del alineamiento
    const identityPercentage = ((matches / alignmentLength) * 100).toFixed(2);
    // Similitud: Incluye coincidencias exactas + mutaciones conservadoras
    const similarityPercentage = (((matches + conservatives) / alignmentLength) * 100).toFixed(2);

    return {
        score: matrix[len1][len2],
        alignmentLength,
        identityPercentage: parseFloat(identityPercentage),
        similarityPercentage: parseFloat(similarityPercentage),
        metrics: { matches, conservatives, gaps },
        alignedSeq1: align1,
        alignedSeq2: align2
    };
}

module.exports = { needlemanWunsch };