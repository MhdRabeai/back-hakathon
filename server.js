const express = require("express");
const app = express();

const path = require("path");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const uniqueId = uuidv4();
const http = require("http");
const { connectDB, getDB } = require("./config/db");
const server = http.createServer(app);
require("dotenv").config();
const port = process.env.PRTO || 4000;
const io = require("socket.io")(server, {
  // pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/", express.static(path.join(__dirname, "uploads")));

require("./routes")(app);

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join-room", ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    console.log(`${uniqueId} joined room: ${roomId}`);
    socket.to(roomId).emit("user-joined", { uniqueId, socketId: socket.id });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    const roomId = socket.data.roomId;
    if (roomId) {
      socket.to(roomId).emit("user-left", { socketId: socket.id });
    }
  });

  socket.on("send-message", ({ roomId, message, userName }) => {
    io.to(roomId).emit("receive-message", { message, uniqueId });
  });
});

connectDB().then(() => {
  app.listen(port, async () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
