const express = require("express");
const authController = require("../controllers/authController");
const validationChecker = require("./../middlewares/validationChecker");
const authValidators = require("./../middlewares/validators/authValidator");
const router = express.Router();

router.post(
  "/signup",
  authValidators.signupValidators,
  validationChecker,
  authController.signup
);
router.post(
  "/verify-email/:token",
  authValidators.verifyEmailValidators,
  validationChecker,
  authController.verifyEmail
);
router.post(
  "/login",
  authValidators.loginValidators,
  validationChecker,
  authController.login
);

module.exports = router;
