const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./chamados.db');

// Criar tabela
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

// GET - listar
app.get('/chamados', (req, res) => {
    db.all("SELECT * FROM chamados WHERE dataFim IS NULL", [], (err, rows) => {
        res.json(rows);
    });
});

// POST - criar
app.post('/chamados', (req, res) => {
    const { numero, cliente, titulo, prioridade, dataAbertura, link } = req.body;

    db.run(`
        INSERT INTO chamados (numero, cliente, titulo, prioridade, dataAbertura, link)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [numero, cliente, titulo, prioridade, dataAbertura, link],
    function(err) {
        res.json({ id: this.lastID });
    });
});

app.listen(3000, () => {
    console.log('rodando na porta 3000');
});