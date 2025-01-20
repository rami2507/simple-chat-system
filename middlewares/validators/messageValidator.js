const { body, param } = require("express-validator");

exports.sendMessageValidators = [
  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required.")
    .isLength({ max: 1000 })
    .withMessage("Content cannot exceed 1000 characters.")
    .escape(),
  param("receiverId")
    .notEmpty()
    .withMessage("Receiver ID is required.")
    .bail()
    .isMongoId()
    .withMessage("The provided receiver ID is not a valid MongoDB ID."),
];

exports.getMessagesForUser = [
  param("userId2")
    .notEmpty()
    .withMessage("userId2 is required.")
    .bail()
    .isMongoId()
    .withMessage("The provided user ID is not a valid MongoDB ID."),
];
