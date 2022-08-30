const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");
const app = express();

const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");

const Conversation = require("./models/conversation-model");

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

const userRoutes = require("./routes/user-routes");
const dogsRoutes = require("./routes/dogs-routes");
const chatRoutes = require("./routes/chat-routes");

app.use(cors());

io.on("connection", (socket) => {
  console.log("user connected");
  const id = socket.handshake.query.myId;
  socket.join(id);

  socket.on("send-message", async (msg) => {
    socket.broadcast.to(msg.sendTo).emit("recieve-message", msg);
    const foundConversation = await Conversation.findById(msg.convId);
    delete msg.convId;
    delete msg.sendTo;
    foundConversation.messages.push(msg);
    try {
      await foundConversation.save();
    } catch (error) {
      return next(error);
    }
  });
  socket.on("disconnect", async () => {
    console.log("user disconnected");
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use(userRoutes);
app.use(dogsRoutes);
app.use(chatRoutes);

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error has occured" });
});

mongoose
  .connect(
   
  )
  .then(
    server.listen(5000, () => {
      console.log("Listening at port 5000");
    })
  )
  .catch((e) => {
    console.log(e);
  });
