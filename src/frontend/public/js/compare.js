// src/frontend/public/js/compare.js
const AA_GROUPS = {
    'A': 'nonpolar', 'V': 'nonpolar', 'I': 'nonpolar', 'L': 'nonpolar', 'M': 'nonpolar', 'F': 'nonpolar', 'Y': 'nonpolar', 'W': 'nonpolar',
    'S': 'polar', 'T': 'polar', 'N': 'polar', 'Q': 'polar', 'C': 'polar',
    'D': 'acidic', 'E': 'acidic',
    'K': 'basic', 'R': 'basic', 'H': 'basic',
    'G': 'special', 'P': 'special'
};

document.addEventListener('DOMContentLoaded', async () => {
    // Cargar selectores al iniciar
    try {
        const res = await fetch('/api/organisms');
        if (!res.ok) throw new Error('Sesión inválida');
        const organisms = await res.json();
        
        const select1 = document.getElementById('org1');
        const select2 = document.getElementById('org2');
        select1.innerHTML = ''; select2.innerHTML = '';
        
        organisms.forEach(org => {
            const opt = `<option value="${org.organism_id}">${org.common_name} (${org.scientific_name})</option>`;
            select1.innerHTML += opt;
            select2.innerHTML += opt;
        });

        // Preseleccionar diferentes si hay al menos 2
        if(organisms.length > 1) select2.selectedIndex = 1;

    } catch (e) {
        window.location.href = '/login'; // Expulsar si la API falla por auth
    }

    // Configurar Botón
    document.getElementById('btn-analyze').addEventListener('click', runComparison);
});

async function runComparison() {
    const id1 = document.getElementById('org1').value;
    const id2 = document.getElementById('org2').value;
    const btn = document.getElementById('btn-analyze');
    
    btn.disabled = true;
    btn.innerText = "Calculando...";

    try {
        const res = await fetch('/api/compare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id1, id2 })
        });
        
        const data = await res.json();
        if (res.ok) renderResults(data);
        else alert(data.error);
        
    } catch (e) {
        console.error(e);
        alert("Error de conexión al analizar.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Ejecutar Análisis";
    }
}

function renderResults(data) {
    document.getElementById('results-panel').classList.remove('hidden');
    
    // 1. Textos Generales
    document.getElementById('metric-identity').innerText = `${data.metrics.identityPercentage}%`;
    document.getElementById('metric-similarity').innerText = `${data.metrics.similarityPercentage}%`;
    document.getElementById('metric-length').innerText = data.metrics.alignmentLength;
    document.getElementById('label-org1').innerText = data.org1.common_name.substring(0, 15);
    document.getElementById('label-org2').innerText = data.org2.common_name.substring(0, 15);

    // 2. Grilla de Alineamiento
    const seq1Container = document.getElementById('seq1-render');
    const seqSymbolsContainer = document.getElementById('seq-symbols');
    const seq2Container = document.getElementById('seq2-render');
    
    seq1Container.innerHTML = '';
    seqSymbolsContainer.innerHTML = '';
    seq2Container.innerHTML = '';

    const seq1 = data.metrics.alignedSeq1;
    const seq2 = data.metrics.alignedSeq2;

    for (let i = 0; i < data.metrics.alignmentLength; i++) {
        const char1 = seq1[i];
        const char2 = seq2[i];

        // Calcular símbolo del medio
        let symbol = ' ';
        if (char1 === char2 && char1 !== '-') symbol = '*';
        else if (char1 !== '-' && char2 !== '-' && AA_GROUPS[char1] === AA_GROUPS[char2]) symbol = ':';

        // Agregar spans
        seq1Container.appendChild(createAASpan(char1));
        seq2Container.appendChild(createAASpan(char2));
        
        const symSpan = document.createElement('span');
        symSpan.innerText = symbol;
        seqSymbolsContainer.appendChild(symSpan);
    }

    // 3. Interpretación Dinámica
    const identity = parseFloat(data.metrics.identityPercentage);
    let interpretation = `Al comparar la secuencia de <b>${data.org1.common_name}</b> con <b>${data.org2.common_name}</b>, se observa una identidad exacta del ${identity}%. `;
    
    if (identity > 90) interpretation += "Esto sugiere una divergencia evolutiva muy reciente o una presión selectiva altísima para conservar la función de la proteína intacta (típico entre primates o especies muy afines).";
    else if (identity > 70) interpretation += "Esto indica un grado de parentesco moderado, común entre distintas familias de la misma clase (ej. distintos mamíferos).";
    else interpretation += "Esta baja identidad refleja una lejanía evolutiva significativa. A pesar de los cambios (mismos que generan menor parentesco taxonómico), es probable que la estructura tridimensional fundamental se conserve si la 'Similitud' sigue siendo moderada.";

    document.getElementById('interpretation-text').innerHTML = interpretation;
}

function createAASpan(char) {
    const span = document.createElement('span');
    span.innerText = char;
    if (char === '-') {
        span.className = 'aa-gap';
    } else {
        const group = AA_GROUPS[char] || 'gap';
        span.className = `aa-${group}`;
    }
    return span;
}