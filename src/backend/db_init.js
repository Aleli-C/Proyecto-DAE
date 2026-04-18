const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'bio_database.sqlite'));

db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS organisms (
        organism_id INTEGER PRIMARY KEY AUTOINCREMENT,
        scientific_name TEXT UNIQUE NOT NULL,
        common_name TEXT NOT NULL,
        clade TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sequences (
        sequence_id INTEGER PRIMARY KEY AUTOINCREMENT,
        organism_id INTEGER NOT NULL,
        sequence_data TEXT NOT NULL,
        FOREIGN KEY(organism_id) REFERENCES organisms(organism_id) ON DELETE CASCADE
    );
`);

const insertOrganism = db.prepare(`INSERT OR IGNORE INTO organisms (scientific_name, common_name, clade) VALUES (@scientific_name, @common_name, @clade)`);
const insertSequence = db.prepare(`INSERT OR IGNORE INTO sequences (organism_id, sequence_data) VALUES ((SELECT organism_id FROM organisms WHERE scientific_name = @scientific_name), @sequence_data)`);

const seedData = [
    // --- Primates (Id: >95%) ---
    { scientific_name: 'Homo sapiens', common_name: 'Humano', clade: 'Mammalia', sequence_data: 'VLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHG' },
    { scientific_name: 'Pan troglodytes', common_name: 'Chimpancé', clade: 'Mammalia', sequence_data: 'VLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHG' },
    { scientific_name: 'Gorilla gorilla', common_name: 'Gorila', clade: 'Mammalia', sequence_data: 'VLSPADKTNVKAAWGKVGAHAGDYGAEALERMFLSFPTTKTYFPHFDLSHG' },
    { scientific_name: 'Pongo abelii', common_name: 'Orangután', clade: 'Mammalia', sequence_data: 'LLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHG' },
    { scientific_name: 'Macaca mulatta', common_name: 'Macaco', clade: 'Mammalia', sequence_data: 'VLSPADKTNIKAAWGKVGGHAGEYGAEALERMFLSFPTTKTYFPHFDLSHG' },

    // --- Otros Mamíferos (Id: 80% - 90%) ---
    { scientific_name: 'Mus musculus', common_name: 'Ratón', clade: 'Mammalia', sequence_data: 'VLSGEDKSNIKAAWGKIGGHGAEYGAEALERMFASFPTTKTYFPHFDVSHG' },
    { scientific_name: 'Rattus norvegicus', common_name: 'Rata', clade: 'Mammalia', sequence_data: 'VLSADDKTNIKAAWGKIGGHGAEYGAEALERMFASFPTTKTYFPHFDVSHG' },
    { scientific_name: 'Canis lupus familiaris', common_name: 'Perro', clade: 'Mammalia', sequence_data: 'VLSPADKTNIKSTWDKIGGHAGDYGAEALERMFASFPTTKTYFPHFDLSHG' },
    { scientific_name: 'Felis catus', common_name: 'Gato', clade: 'Mammalia', sequence_data: 'VLSAADKSNVKAAWGKVGGHAAEYGAEALERMFLSFPTTKTYFPHFDLSHG' },
    { scientific_name: 'Equus caballus', common_name: 'Caballo', clade: 'Mammalia', sequence_data: 'VLSAADKTNVKAAWSKVGGHAGEYGAEALERMFLGFPTTKTYFPHFDLSHG' },
    { scientific_name: 'Bos taurus', common_name: 'Vaca', clade: 'Mammalia', sequence_data: 'VLSAADKGNVKAAWGKVGGHAAEYGAEALERMFLSFPTTKTYFPHFDLSHG' },
    { scientific_name: 'Sus scrofa', common_name: 'Cerdo', clade: 'Mammalia', sequence_data: 'VLSAADKANVKAAWGKVGGQAGAHGAEALERMFLSFPTTKTYFPHFNLSHG' },
    { scientific_name: 'Oryctolagus cuniculus', common_name: 'Conejo', clade: 'Mammalia', sequence_data: 'VLSPADKTNIKTAWEKIGSHGGEYGAEALERMFLSFPTTKTYFPHFDFSHG' },

    // --- Aves y Reptiles (Id: 70% - 80%) ---
    { scientific_name: 'Gallus gallus', common_name: 'Pollo', clade: 'Aves', sequence_data: 'VLSAADKNNVKGIFTKIAGHAEEYGAETLERMFTTYPPTKTYFPHFDLSHG' },
    { scientific_name: 'Taeniopygia guttata', common_name: 'Diamante Mandarín', clade: 'Aves', sequence_data: 'VLSAADKNNVKGIFSKIAGHAEEYGAETLERMFTTYPPTKTYFPHFDLSHG' },
    { scientific_name: 'Alligator mississippiensis', common_name: 'Caimán', clade: 'Reptilia', sequence_data: 'VLSAADKNNVKAVWSKVAGHLEEYGSETLERMFTTFPPTKTYFPHFDLSHG' },
    { scientific_name: 'Chrysemys picta', common_name: 'Tortuga', clade: 'Reptilia', sequence_data: 'VLSAADKTNVKGVFSKIAGHAEEYGAETLERMFTTYPPTKTYFPHFDLSHG' },

    // --- Anfibios y Peces (Id: 50% - 70%) ---
    { scientific_name: 'Xenopus laevis', common_name: 'Rana Africana', clade: 'Amphibia', sequence_data: 'VLSADDKNHVKAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHG' },
    { scientific_name: 'Danio rerio', common_name: 'Pez Cebra', clade: 'Actinopterygii', sequence_data: 'SLSDKDKAAVVKWAKDIQAQQGYDVEALELMFKTFPTTKTYFPHFDLSHG' },
    { scientific_name: 'Salmo salar', common_name: 'Salmón', clade: 'Actinopterygii', sequence_data: 'SLSDKDKAAVVKWAKDIQAQQGYDVEALELMFKTFPSTKTYFPHFDLSHG' },
    { scientific_name: 'Callorhinchus milii', common_name: 'Tiburón Elefante', clade: 'Chondrichthyes', sequence_data: 'SLTAKDKSVKAVWGKIGGHADEFGAEALERMFAAFPTTKTYFPHFDFSHG' },

    // --- Invertebrados (Globinas análogas, Id: < 50%) ---
    { scientific_name: 'Drosophila melanogaster', common_name: 'Mosca de la Fruta', clade: 'Insecta', sequence_data: 'TLTEEDKAHVSKWAANILGIQGYDVETLELMFSKFPNTKTYFPHFDLSHG' },
    { scientific_name: 'Caenorhabditis elegans', common_name: 'Gusano C. elegans', clade: 'Nematoda', sequence_data: 'PLTEEDKAHVSKWAANILGIQGYDVETLELMFSKFPNTKTFFPHFDLAH' },
    { scientific_name: 'Lumbricus terrestris', common_name: 'Lombriz de Tierra', clade: 'Annelida', sequence_data: 'GLSAAQRQVIAATWKDIAGNDNGAGVGKDCLIKFLSAHPQMAAVFGFSG' },
    { scientific_name: 'Aplysia californica', common_name: 'Liebre de Mar', clade: 'Mollusca', sequence_data: 'SLSAAQKQNVKAAWGKVGGHAAEYGAEALERMFLSFPTTKTYFPHFDLS' }
];

const seedDatabase = db.transaction((data) => {
    for (const item of data) {
        insertOrganism.run(item);
        insertSequence.run(item);
    }
});

seedDatabase(seedData);
console.log("Base de datos inicializada con usuarios y organismos.");