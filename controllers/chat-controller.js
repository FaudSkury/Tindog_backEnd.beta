const HttpError = require("../models/http-error");
const Conversation = require("../models/conversation-model");

const getConversations = async (req, res, next) => {
  const userId = req.params.id;

  let userConversations;
  try {
    userConversations = await Conversation.find({ ofUsers: userId })
      .select("-messages")
      .populate({
        path: "ofUsers",
        select: ["-password", "-email"],
      });
  } catch (err) {
    console.log(err);
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (!userConversations) {
    res.status(204).json({ message: "No conversation found" });
  } else {
    res.status(200).json(userConversations);
  }
};

const getMessages = async (req, res, next) => {
  const conversationId = req.params.id;

  let foundConversation;
  try {
    foundConversation = await Conversation.findById(conversationId).select(
      "-ofUsers"
    );
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (!foundConversation) {
    return res.status(200).json({ message: "No messages found" });
  } else {
    return res.status(200).json(foundConversation.messages);
  }
};

const createConversation = async (req, res, next) => {
  const { myId, hisId } = req.body;
  let existingConversation;
  try {
    existingConversation = await Conversation.findOne({
      ofUsers: [myId, hisId],
    });
  } catch (err) {
    const error = new HttpError("Something went wrong", 500);
    return next(error);
  }
  if (existingConversation) {
    return 
  } else {
    console.log(existingConversation);
    const createdConversation = new Conversation({
      ofUsers: [myId, hisId],
    });
    try {
      await createdConversation.save();
    } catch (err) {
      console.log(err);
      const error = new HttpError("Something went wrong", 500);
      return next(error);
    }
  }
};

exports.getConversations = getConversations;

exports.createConversation = createConversation;

exports.getMessages = getMessages;
