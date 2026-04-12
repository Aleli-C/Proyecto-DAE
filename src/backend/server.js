const express = require('express');
const path = require('path');
const dbManager = require('./db_manager');
const { needlemanWunsch } = require('../bio_core/needleman');

const app = express();
const PORT = 3000;

// Middleware para servir el frontend estático
app.use(express.static(path.join(__dirname, '../frontend')));

// Endpoint principal de procesamiento
app.get('/api/alignments', (req, res) => {
    try {
        const humanTarget = dbManager.getHumanSequence();
        const organisms = dbManager.getOtherSequences();

        if (!humanTarget) {
            return res.status(500).json({ error: "Falta la secuencia base (Homo sapiens) en la BD." });
        }

        // Ejecutar los análisis en serie
        const results = organisms.map(org => {
            const alignment = needlemanWunsch(humanTarget.sequence_data, org.sequence_data);
            
            return {
                organism: {
                    scientific_name: org.scientific_name,
                    common_name: org.common_name,
                    clade: org.clade,
                    accession: org.accession_number
                },
                metrics: alignment
            };
        });

        // Ordenar ranking: mayor a menor porcentaje de identidad
        results.sort((a, b) => b.metrics.identityPercentage - a.metrics.identityPercentage);

        res.json({
            target: humanTarget,
            alignments: results
        });
    } catch (error) {
        console.error("Error en procesamiento bioinformático:", error);
        res.status(500).json({ error: "Error interno en el servidor de alineamiento." });
    }
});

app.listen(PORT, () => {
    console.log(`[Bio-App] Servidor ejecutándose en http://localhost:${PORT}`);
});