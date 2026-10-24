const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve a pasta "public" onde fica o HTML
app.use(express.static("public"));

// Gerencia conexões em tempo real
io.on("connection", (socket) => {
  console.log("Um usuário conectou!");

  socket.on("chat message", (data) => {
    io.emit("chat message", data);
  });

  socket.on("disconnect", () => {
    console.log("Um usuário desconectou.");
  });
});

// Usa a porta que o Render definir ou a 3000
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
