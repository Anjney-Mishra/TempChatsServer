const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
const server = createServer(app);
const io = new Server(server,{
  cors: {
    origin: 'https://tempchats.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true,
},
});

//TODO: Add socket.io middleware

const corsOptions = {
  origin: "https://tempchats.onrender.com",
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

io.on("connection", (socket) => {
  console.log("User connected: ", socket.id);

  socket.on("joinRoom", ({ roomId, name }) => {
    console.log(`${socket.id} User joined room: `, roomId);
    socket.join(roomId);
    const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
    socket.to(roomId).emit("userjoined", { name, roomSize });
    io.in(roomId).emit("roomsize", roomSize);
  });

  socket.on("message", (data) => {
    // console.log(`${socket.id} Message: `, data);
    // socket.broadcast.emit("response",data); //send to all the socket except the one who send
    io.to(data.room).emit("response", data); //send to particular socket by using their socket id as roomid
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
