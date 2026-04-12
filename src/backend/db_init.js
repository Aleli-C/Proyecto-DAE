const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio de datos existe
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar la base de datos
const db = new Database(path.join(dataDir, 'bio_database.sqlite'));

// Construcción del esquema (Transacción segura)
db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS organisms (
        organism_id INTEGER PRIMARY KEY AUTOINCREMENT,
        scientific_name TEXT NOT NULL UNIQUE,
        common_name TEXT NOT NULL,
        clade TEXT NOT NULL,
        ncbi_tax_id INTEGER UNIQUE
    );

    CREATE TABLE IF NOT EXISTS sequences (
        sequence_id INTEGER PRIMARY KEY AUTOINCREMENT,
        organism_id INTEGER NOT NULL,
        accession_number TEXT NOT NULL UNIQUE,
        protein_name TEXT NOT NULL,
        sequence_data TEXT NOT NULL,
        FOREIGN KEY (organism_id) REFERENCES organisms (organism_id) ON DELETE CASCADE
    );
`);

// Preparar sentencias de inserción
const insertOrganism = db.prepare(`
    INSERT OR IGNORE INTO organisms (scientific_name, common_name, clade, ncbi_tax_id)
    VALUES (@scientific_name, @common_name, @clade, @ncbi_tax_id)
`);

const insertSequence = db.prepare(`
    INSERT OR IGNORE INTO sequences (organism_id, accession_number, protein_name, sequence_data)
    VALUES (
        (SELECT organism_id FROM organisms WHERE scientific_name = @scientific_name),
        @accession_number, @protein_name, @sequence_data
    )
`);

// Datos iniciales de prueba (Hemoglobina alfa - fragmentos simulados de ~50aa)
const seedData = [
    {
        scientific_name: 'Homo sapiens',
        common_name: 'Humano',
        clade: 'Mammalia',
        ncbi_tax_id: 9606,
        accession_number: 'P69905',
        protein_name: 'Hemoglobin subunit alpha',
        // Fragmento representativo
        sequence_data: 'VLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHG'
    },
    {
        scientific_name: 'Pan troglodytes',
        common_name: 'Chimpancé',
        clade: 'Mammalia',
        ncbi_tax_id: 9598,
        accession_number: 'P69907',
        protein_name: 'Hemoglobin subunit alpha',
        // 100% de identidad en este bloque, o con 1 mutación mínima
        sequence_data: 'VLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHG'
    },
    {
        scientific_name: 'Danio rerio',
        common_name: 'Pez Cebra',
        clade: 'Actinopterygii',
        ncbi_tax_id: 7955,
        accession_number: 'P69924',
        protein_name: 'Hemoglobin subunit alpha',
        // Divergencia evolutiva notable
        sequence_data: 'SLSDKDKAAVVKWAKDIQAQQGYDVEALELMFKTFPTTKTYFPHFDLSHG'
    }
];

// Ejecutar el sembrado de datos
const seedDatabase = db.transaction((data) => {
    for (const item of data) {
        insertOrganism.run({
            scientific_name: item.scientific_name,
            common_name: item.common_name,
            clade: item.clade,
            ncbi_tax_id: item.ncbi_tax_id
        });
        
        insertSequence.run({
            scientific_name: item.scientific_name,
            accession_number: item.accession_number,
            protein_name: item.protein_name,
            sequence_data: item.sequence_data
        });
    }
});

seedDatabase(seedData);

console.log("Base de datos y tablas creadas. Datos de prueba insertados correctamente.");