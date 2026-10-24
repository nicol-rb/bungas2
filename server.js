const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Criar e ligar à base de dados SQLite local
const db = new sqlite3.Database("./chat.db", (err) => {
  if (err) {
    console.error("Erro ao abrir a base de dados", err.message);
  } else {
    console.log("Conectado à base de dados SQLite com sucesso.");
  }
});

// Criar a tabela de mensagens se ela ainda não existir
db.run(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT,
  text TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("Um utilizador conectou-se!");

  // Enviar as últimas 50 mensagens guardadas assim que alguém entra
  db.all("SELECT user, text FROM messages ORDER BY id ASC LIMIT 50", [], (err, rows) => {
    if (!err) {
      socket.emit("load history", rows);
    }
  });

  // Quando uma nova mensagem é enviada
  socket.on("chat message", (data) => {
    // Guardar a mensagem na base de dados
    db.run(`INSERT INTO messages (user, text) VALUES (?, ?)`, [data.user, data.text], (err) => {
      if (!err) {
        // Enviar a mensagem para todos os utilizadores ligados
        io.emit("chat message", data);
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("Um utilizador desconectou-se.");
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor a funcionar na porta ${PORT}`);
});
