const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// 🔐 segredo do token (em projeto real vai em .env)
const SECRET = "segredo_super_secreto";

// ================= BANCO =================
const db = new sqlite3.Database("./database.db");

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

// ================= CADASTRO =================
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // validação
    if (!username || !password) {
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    if (password.length < 4) {
      return res.status(400).json({ error: "Senha muito curta" });
    }

    const hash = await bcrypt.hash(password, 10);

    db.run(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, hash],
      function (err) {
        if (err) {
          return res.status(400).json({ error: "Usuário já existe" });
        }

        res.json({ message: "Cadastro realizado com sucesso" });
      }
    );

  } catch (err) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// ================= LOGIN =================
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Erro no servidor" });
      }

      if (!user) {
        return res.status(400).json({ error: "Usuário não encontrado" });
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(400).json({ error: "Senha incorreta" });
      }

      // cria token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        SECRET,
        { expiresIn: "1h" }
      );

      res.json({
        message: "Login realizado",
        token,
      });
    }
  );
});

// ================= MIDDLEWARE (PROTEÇÃO) =================
function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ error: "Acesso negado" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Token inválido" });
  }
}

// ================= ROTA PROTEGIDA =================
app.get("/dashboard", auth, (req, res) => {
  res.json({
    message: "Área protegida 🔒",
    user: req.user,
  });
});

// ================= SERVIDOR =================
app.listen(3000, () => {
  console.log("🚀 Servidor rodando em http://localhost:3000");
});