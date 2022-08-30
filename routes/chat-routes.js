const express = require("express");
const chatController = require("../controllers/chat-controller");
const Router = express.Router();

Router.get("/tindog/conversations/:id", chatController.getConversations);
Router.get("/tindog/messages/:id", chatController.getMessages);
module.exports = Router;
