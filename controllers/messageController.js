const asyncHandler = require("express-async-handler");
const Message = require("./../models/messageModel");
const AppError = require("../utils/appError");

// GET All Messages
exports.getAllMessages = asyncHandler(async (req, res, next) => {
  const messages = await Message.find()
    .populate("senderId", "-password")
    .populate("receiverId", "-password");

  res.status(200).json({
    status: "success",
    results: messages.length,
    data: messages,
  });
});

// DELETE All Messages
exports.deleteAllMessages = asyncHandler(async (req, res, next) => {
  await Message.deleteMany();

  res.status(204).json({ message: "All messages deleted" });
});

// Send a message to a specific user
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { content } = req.body;
  const { receiverId } = req.params;
  const senderId = req.user._id;

  // Validate inputs
  if (!receiverId || !content) {
    return next(new AppError("Please provide receiver ID and content", 400));
  }

  // Create new message
  const newMessage = new Message({
    senderId,
    receiverId,
    content,
  });

  await newMessage.save();

  res.status(201).json({
    status: "success",
    message: "Message sent successfuly!",
    data: newMessage,
  });
});

// Get all messages between two users
exports.getMessagesForUser = asyncHandler(async (req, res, next) => {
  const userId1 = req.user._id;
  const userId2 = req.params.userId;

  // Validate inputs
  if (!userId1 || !userId2) {
    return next(new AppError("Please provide both user IDs", 400));
  }

  const messages = await Message.find({
    $or: [
      { senderId: userId1, receiverId: userId2 },
      { senderId: userId2, receiverId: userId1 },
    ],
  })
    .sort({ timestamp: -1 })
    .populate("senderId", "username")
    .populate("receiverId", "username");

  res.status(200).json({
    status: "success",
    data: messages,
  });
});
