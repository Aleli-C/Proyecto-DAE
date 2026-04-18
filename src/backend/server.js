const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const dbManager = require('./db_manager');
const { needlemanWunsch } = require('../bio_core/needleman');

const app = express();
const PORT = 3000;

// 1. Middlewares Base
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use(session({
    secret: 'dae_secreto_critico_2026',
    resave: false,
    saveUninitialized: false
}));

// 2. Middlewares de Acceso
const requireAuth = (req, res, next) => {
    if (req.session.userId) return next();
    res.redirect('/login');
};

// ==========================================
// 3. RUTAS API - AUTENTICACIÓN (Públicas)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    const { user, pass } = req.body;
    if (!user || !pass) return res.status(400).json({ error: 'Datos incompletos' });

    try {
        const hash = await bcrypt.hash(pass, 10);
        // Asegúrate de que tu db_manager.js tenga la función saveUser
        dbManager.createUser(user, hash); 
        res.json({ success: true, message: 'Usuario creado' });
    } catch (e) {
        res.status(500).json({ error: 'El usuario ya existe o error en BD' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { user, pass } = req.body;
    try {
        const userData = dbManager.getUser(user);
        if (userData && await bcrypt.compare(pass, userData.password_hash)) {
            req.session.userId = userData.id;
            req.session.username = userData.username;
            return res.json({ success: true });
        }
        res.status(401).json({ error: 'Credenciales inválidas' });
    } catch (error) {
        res.status(500).json({ error: 'Error interno' });
    }
});

app.get('/api/auth/logout', (req, res) => {
    // Destruye la sesión actual en el servidor
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al destruir la sesión:", err);
            return res.status(500).send("Error interno al cerrar sesión.");
        }
        // Limpia la cookie del navegador (opcional pero recomendado)
        res.clearCookie('connect.sid'); 
        // Redirige al login físico
        res.redirect('/login');
    });
});
// ==========================================
// 4. RUTAS DE VISTAS (HTML)
// ==========================================
app.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/home');
    res.sendFile(path.join(__dirname, '../frontend/views/login.html'));
});

app.get('/register', (req, res) => {
    if (req.session.userId) return res.redirect('/home');
    res.sendFile(path.join(__dirname, '../frontend/views/register.html'));
});

// Protegidas
app.get('/home', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/home.html')));
app.get('/listado', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/listado.html')));
app.get('/comparar', requireAuth, (req, res) => res.sendFile(path.join(__dirname, '../frontend/views/comparar.html')));

app.get('/', (req, res) => {
    res.redirect(req.session.userId ? '/home' : '/login');
});

// ==========================================
// 5. RUTAS API - BIOINFORMÁTICA (Protegidas)
// ==========================================
app.get('/api/organisms', requireAuth, (req, res) => {
    res.json(dbManager.getAllOrganismsABC());
});

app.post('/api/compare', requireAuth, (req, res) => {
    const { id1, id2 } = req.body;
    const seq1 = dbManager.getOrganismSequence(id1);
    const seq2 = dbManager.getOrganismSequence(id2);
    if (!seq1 || !seq2) return res.status(404).json({ error: 'Secuencia no encontrada' });
    
    const result = needlemanWunsch(seq1.sequence_data, seq2.sequence_data);
    res.json({ org1: seq1, org2: seq2, metrics: result });
});

app.listen(3000, () => console.log("Servidor en puerto 3000"));;