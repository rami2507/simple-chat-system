const { param } = require("express-validator");

exports.getOneUserValidators = [
  param("id")
    .notEmpty()
    .withMessage("id is required")
    .isMongoId()
    .withMessage("the id provided is not a valid mongoDB id"),
];
