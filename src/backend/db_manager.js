const Database = require('better-sqlite3');
const path = require('path');

// Conexión en modo solo lectura
const dbPath = path.resolve(__dirname, '../../data/bio_database.sqlite');
const db = new Database(dbPath, { readonly: true });

function getHumanSequence() {
    return db.prepare(`
        SELECT o.scientific_name, o.common_name, s.sequence_data
        FROM sequences s
        JOIN organisms o ON s.organism_id = o.organism_id
        WHERE o.scientific_name = 'Homo sapiens'
    `).get();
}

function getOtherSequences() {
    return db.prepare(`
        SELECT o.scientific_name, o.common_name, o.clade, s.accession_number, s.sequence_data
        FROM sequences s
        JOIN organisms o ON s.organism_id = o.organism_id
        WHERE o.scientific_name != 'Homo sapiens'
    `).all();
}

module.exports = {
    getHumanSequence,
    getOtherSequences
};