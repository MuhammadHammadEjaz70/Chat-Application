const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
require("dotenv").config();

app.use(cors());
app.use(express.json());
//New imports
const http = require("http").Server(app);

// const socketIO = require("socket.io")(http, {
//   cors: {
//     origin: "http://localhost:3000",
//   },
// });

// let users = [];

// //Add this before the app.get() block
// socketIO.on("connection", (socket) => {
//   console.log(`⚡: ${socket.id} user just connected!`);
//   //Listens and logs the message to the console
//   socket.on("message", (data) => {
//     console.log(data);
//     socketIO.emit("messageResponse", data);
//   });

//   socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));
//   //Listens when a new user joins the server
//   socket.on("newUser", (data) => {
//     //Adds the new user to the list of users
//     users.push(data);
//     // console.log(users);
//     //Sends the list of users to the client
//     socketIO.emit("newUserResponse", users);
//   });
//   socket.on("disconnect", () => {
//     console.log("🔥: A user disconnected");
//     //Updates the list of users when a user disconnects from the server
//     users = users.filter((user) => user.socketID !== socket.id);
//     // console.log(users);
//     //Sends the list of users to the client
//     socketIO.emit("newUserResponse", users);
//     socket.disconnect();
//   });
// });

// app.get("/api", (req, res) => {
//   res.json({
//     message: "Hello world",
//   });
// });

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB connected successfully");
  })
  .catch((error) => {
    console.log("DB connection error");
  });

http.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
});
