const express = require("express");
const messageController = require("./../controllers/messageController");
const authController = require("../controllers/authController");
const validationChecker = require("../middlewares/validationChecker");
const messageValidators = require("../middlewares/validators/messageValidator");

const router = express.Router();

router.use(authController.protect);

router
  .route("/")
  .get(authController.restrictTo("admin"), messageController.getAllMessages)
  .delete(
    authController.restrictTo("admin"),
    messageController.deleteAllMessages
  );

// GET messages for specific users
router.get(
  "/get-messages/:userId",
  messageValidators.getMessagesForUser,
  validationChecker,
  messageController.getMessagesForUser
);

// Send Message
router.post(
  "/send-message/:receiverId",
  messageValidators.sendMessageValidators,
  validationChecker,
  messageController.sendMessage
);

module.exports = router;
