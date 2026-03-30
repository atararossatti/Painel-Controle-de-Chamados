const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = 'segredo_super_secreto';

// 📦 Banco
const db = new sqlite3.Database('./chamados.db');

// 🧱 Tabelas
db.run(`
CREATE TABLE IF NOT EXISTS chamados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT,
    cliente TEXT,
    titulo TEXT,
    prioridade TEXT,
    dataAbertura TEXT,
    dataFim TEXT,
    link TEXT
)
`);

db.run(`
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT,
    senha TEXT
)
`);

// 🔐 Middleware
function verificarToken(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ erro: 'Sem token' });
    }

    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ erro: 'Token inválido' });
        }

        req.user = decoded;
        next();
    });
}

// 🔎 GET
app.get('/chamados', verificarToken, (req, res) => {
    db.all("SELECT * FROM chamados WHERE dataFim IS NULL", [], (err, rows) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar' });
        res.json(rows);
    });
});

// ➕ POST
app.post('/chamados', verificarToken, (req, res) => {
    const { numero, cliente, titulo, prioridade, dataAbertura, link } = req.body;

    db.run(
        `INSERT INTO chamados (numero, cliente, titulo, prioridade, dataAbertura, link)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [numero, cliente, titulo, prioridade, dataAbertura, link],
        function (err) {
            if (err) return res.status(500).json({ erro: 'Erro ao salvar' });
            res.json({ id: this.lastID });
        }
    );
});

// 🔐 LOGIN (AGORA COM TOKEN)
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    db.get(
        "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?",
        [usuario, senha],
        (err, row) => {
            if (err) return res.status(500).json({ erro: 'Erro no login' });

            if (row) {
                const token = jwt.sign(
                    { id: row.id, usuario: row.usuario },
                    SECRET,
                    { expiresIn: '8h' }
                );

                res.json({ sucesso: true, token });
            } else {
                res.json({ sucesso: false });
            }
        }
    );
});

// 🚀 START
app.listen(3000, () => {
    console.log('🚀 Servidor rodando em http://localhost:3000');
});