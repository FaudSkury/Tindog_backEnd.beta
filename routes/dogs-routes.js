const express = require("express");
const dogsController = require("../controllers/dogs-controller");
const chatController = require("../controllers/chat-controller");
const Router = express.Router();

Router.get("/tindog/users", dogsController.getUsers);
Router.get("/tindog/relations/:userId", dogsController.getRelations);
Router.post(
  "/tindog/like",
  dogsController.postLike,
  dogsController.postPairs,
  chatController.createConversation
);
module.exports = Router;
