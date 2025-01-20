const User = require("./../models/userModel");
const asyncHandler = require("express-async-handler");
const AppError = require("./../utils/appError");

exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  res
    .status(200)
    .json({ status: "success", results: users.length, data: users });
});

exports.getOneUser = asyncHandler(async (req, res, next) => {
  if (!req.params.id) {
    return next(new AppError("No user ID provided", 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({ status: "success", data: user });
});

exports.deleteAllUsers = asyncHandler(async (req, res) => {
  await User.deleteMany();
  res.status(204).json({ message: "All users deleted" });
});
