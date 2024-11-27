const http = require("http");
const socketIo = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const uniqueId = uuidv4();
const server = http.createServer();

const io = socketIo(server, {
  // pingTimeout: 60000,
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  socket.on("join-room", ({ roomId, userName }) => {
    socket.join(roomId);
    socket.data.roomId = roomId;
    console.log(`${userName} joined room: ${roomId}`);
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
    io.to(roomId).emit("receive-message", { userName, message });
  });
});

server.listen(4040, () => {
  console.log("Socket.IO server running on port 4040");
});
