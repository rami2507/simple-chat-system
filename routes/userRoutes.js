const express = require("express");
const userController = require("./../controllers/userController");
const userValidators = require("./../middlewares/validators/userValidator");
const validationChecker = require("./../middlewares/validationChecker");

const router = express.Router();

router
  .route("/")
  .get(userController.getAllUsers)
  .delete(userController.deleteAllUsers);
router
  .route("/:id")
  .get(
    userValidators.getOneUserValidators,
    validationChecker,
    userController.getOneUser
  );

module.exports = router;
