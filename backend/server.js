const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// 📦 Banco de dados
const db = new sqlite3.Database('./chamados.db');

// 🧱 Criar tabela de chamados
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

// 👤 Criar tabela de usuários
db.run(`
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT,
    senha TEXT
)
`);


// =========================
// 📌 ROTAS
// =========================

// 🔎 GET - listar chamados abertos
app.get('/chamados', (req, res) => {
    db.all(
        "SELECT * FROM chamados WHERE dataFim IS NULL",
        [],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ erro: 'Erro ao buscar chamados' });
            }
            res.json(rows);
        }
    );
});


// ➕ POST - criar chamado
app.post('/chamados', (req, res) => {
    const { numero, cliente, titulo, prioridade, dataAbertura, link } = req.body;

    db.run(
        `INSERT INTO chamados 
        (numero, cliente, titulo, prioridade, dataAbertura, link)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [numero, cliente, titulo, prioridade, dataAbertura, link],
        function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ erro: 'Erro ao salvar chamado' });
            }

            res.json({ id: this.lastID });
        }
    );
});


// 🔐 LOGIN
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    db.get(
        "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?",
        [usuario, senha],
        (err, row) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ erro: 'Erro no login' });
            }

            if (row) {
                res.json({ sucesso: true, user: row });
            } else {
                res.json({ sucesso: false });
            }
        }
    );
});


// =========================
// 🚀 START SERVIDOR (SEMPRE POR ÚLTIMO)
// =========================
app.listen(3000, () => {
    console.log('🚀 Servidor rodando em http://localhost:3000');
});