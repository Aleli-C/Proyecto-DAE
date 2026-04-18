const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../data/bio_database.sqlite');
// OJO: Quitado el readonly temporalmente para permitir registrar usuarios
const db = new Database(dbPath);

// -- Auth --
function createUser(username, hash) {
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    return stmt.run(username, hash);
}

function getUser(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
}

// -- Biología --
// src/backend/db_manager.js
function getAllOrganismsABC() {
    return db.prepare(`
        SELECT organism_id, common_name, scientific_name, clade 
        FROM organisms 
        ORDER BY common_name ASC
    `).all();
}

function getOrganismSequence(organism_id) {
    return db.prepare(`
        SELECT o.common_name, o.scientific_name, s.sequence_data 
        FROM sequences s 
        JOIN organisms o ON s.organism_id = o.organism_id 
        WHERE o.organism_id = ?
    `).get(organism_id);
}

module.exports = { createUser, getUser, getAllOrganismsABC, getOrganismSequence };