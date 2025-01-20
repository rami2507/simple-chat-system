const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const { promisify } = require("util");
const asyncHandler = require("express-async-handler");
const User = require("./../models/userModel");
const sendEmail = require("./../utils/sendEmail");
const crypto = require("crypto");

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const generateJwt = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};
// Protect Middleware
exports.protect = asyncHandler(async (req, res, next) => {
  // 1) Getting Token And Check If It's There
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token)
    return next(
      new AppError("Your are not logged in! Please login to get access", 401)
    );
  // 2) Validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // 3) Check If User Still Exist
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("the user belonging to this token does no longer exist")
    );
  }
  // 4) Check if user has changed his password
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again.", 401)
    );
  }
  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.signup = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return next(new AppError("Email/username already exists", 400));
  }

  const newUser = await User.create({
    username,
    email,
    password,
  });

  const verificationToken = newUser.createEmailVerificationToken();

  const message = `Use this link to verify your email: ${
    req.protocol
  }://${req.get("host")}/api/v1/auth/verify-email/${verificationToken}`;

  try {
    await sendEmail(newUser.email, "Email Verification", message);

    // Save the user with the new token and expiration
    await newUser.save();

    res.status(200).json({
      message: "Verification email sent!",
    });
  } catch (err) {
    // Clear token and expiration if email fails to send
    newUser.emailVerificationToken = undefined;
    newUser.emailVerificationExpires = undefined;
    await newUser.save(); // Save the changes

    next(err.message, 400);
  }
});

exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const token = req.params.token;

  if (!token) {
    return next(new AppError("No token provided", 400));
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiration: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired token", 400));
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiration = undefined;

  await user.save();

  res.status(200).json({ message: "Email verified successfully" });
});

exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  if (!user.isVerified) {
    return next(new AppError("Your account is not verified yet!", 403));
  }

  // Password correct => generate JWT
  const token = generateJwt(user);

  // Send JWT as a cookie
  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    },
  });
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You are not authorized to perform this action"),
        401
      );
    }
    next();
  };
};
