// Diccionario de grupos químicos (Mismo que el backend para pintar colores)
const AA_GROUPS = {
    'A': 'nonpolar', 'V': 'nonpolar', 'I': 'nonpolar', 'L': 'nonpolar', 'M': 'nonpolar', 'F': 'nonpolar', 'Y': 'nonpolar', 'W': 'nonpolar',
    'S': 'polar', 'T': 'polar', 'N': 'polar', 'Q': 'polar', 'C': 'polar',
    'D': 'acidic', 'E': 'acidic',
    'K': 'basic', 'R': 'basic', 'H': 'basic',
    'G': 'special', 'P': 'special'
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/alignments');
        const data = await response.json();
        renderRanking(data.alignments);
    } catch (error) {
        document.getElementById('ranking-list').innerHTML = '<p style="color:red">Error de conexión al servidor.</p>';
    }
});

function renderRanking(alignments) {
    const listContainer = document.getElementById('ranking-list');
    listContainer.innerHTML = '';

    alignments.forEach((item, index) => {
        const identity = item.metrics.identityPercentage;
        
        // Lógica de color de la barra (Rojo < 50%, Amarillo < 80%, Verde > 80%)
        let barColor = '#e74c3c'; // Rojo
        if (identity >= 80) barColor = '#2ecc71'; // Verde
        else if (identity >= 50) barColor = '#f1c40f'; // Amarillo

        const div = document.createElement('div');
        div.className = 'ranking-item';
        div.innerHTML = `
            <h4>${index + 1}. ${item.organism.common_name}</h4>
            <span class="clade">${item.organism.scientific_name} | ${item.organism.clade}</span>
            <div style="margin-top: 5px; font-weight: bold;">${identity}% Identidad</div>
            <div class="progress-bg">
                <div class="progress-fill" style="width: ${identity}%; background-color: ${barColor};"></div>
            </div>
        `;

        div.addEventListener('click', () => {
            // Remueve clase activa a los demás
            document.querySelectorAll('.ranking-item').forEach(el => el.classList.remove('active'));
            div.classList.add('active');
            renderDetails(item);
        });

        listContainer.appendChild(div);
    });
}

function renderDetails(data) {
    // 1. Mostrar paneles
    document.getElementById('placeholder-msg').classList.add('hidden');
    document.getElementById('alignment-view').classList.remove('hidden');

    // 2. Llenar textos
    document.getElementById('detail-title').innerText = `Alineamiento: Humano vs ${data.organism.common_name}`;
    document.getElementById('metric-identity').innerText = `${data.metrics.identityPercentage}%`;
    document.getElementById('metric-similarity').innerText = `${data.metrics.similarityPercentage}%`;
    document.getElementById('metric-length').innerText = data.metrics.alignmentLength;
    document.getElementById('label-target').innerText = `${data.organism.common_name.substring(0, 10)}:`;

    // 3. Renderizar Grilla
    const seqHuman = document.getElementById('seq-human');
    const seqSymbols = document.getElementById('seq-symbols');
    const seqTarget = document.getElementById('seq-target');
    
    seqHuman.innerHTML = ''; seqSymbols.innerHTML = ''; seqTarget.innerHTML = '';

    for (let i = 0; i < data.metrics.alignmentLength; i++) {
        const char1 = data.metrics.alignedSeq1[i];
        const char2 = data.metrics.alignedSeq2[i];

        // Símbolo del medio
        let symbol = ' ';
        if (char1 === char2 && char1 !== '-') symbol = '*'; // Match exacto
        else if (char1 !== '-' && char2 !== '-' && AA_GROUPS[char1] === AA_GROUPS[char2]) symbol = ':'; // Conservador

        seqHuman.appendChild(createAASpan(char1));
        seqTarget.appendChild(createAASpan(char2));
        
        const symSpan = document.createElement('span');
        symSpan.innerText = symbol;
        seqSymbols.appendChild(symSpan);
    }

    // 4. Generación de texto en lenguaje natural
    const identity = data.metrics.identityPercentage;
    let interpretation = `Al comparar la secuencia de la hemoglobina humana con la del ${data.organism.common_name.toLowerCase()}, se observa una identidad del ${identity}%. `;
    
    if (identity > 90) interpretation += "Esto sugiere una divergencia evolutiva muy reciente, típica entre primates cercanos. La proteína conserva prácticamente la misma estructura y función.";
    else if (identity > 70) interpretation += "Esto indica un grado de parentesco moderado, común entre distintos mamíferos. La función principal de transporte de oxígeno se mantiene intacta.";
    else interpretation += "Esta baja identidad refleja una lejanía evolutiva significativa, propia de vertebrados lejanos. Hubo una alta acumulación de mutaciones en el tiempo geológico.";

    document.getElementById('interpretation-text').innerText = interpretation;
}

function createAASpan(char) {
    const span = document.createElement('span');
    span.innerText = char;
    if (char === '-') {
        span.style.backgroundColor = 'var(--aa-gap)';
        span.style.color = '#333';
    } else {
        const group = AA_GROUPS[char] || 'gap';
        span.style.backgroundColor = `var(--aa-${group})`;
    }
    return span;
}