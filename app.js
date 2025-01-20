const express = require("express");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const messagesRoutes = require("./routes/messagesRoutes");
const globalErrorHandling = require("./controllers/errorController");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

// Load environment variables from.env file
dotenv.config();

// Create a rate limiter middleware (You can impelemt it just for some specific endpoints like login/signup)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour in milliseconds
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after an hour", // Response message
  headers: true, // Include rate limit info in the response headers
});

const app = express();

// Apply rate limiting to all requests
app.use(limiter);

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messagesRoutes);

// Error handling middleware
app.use(globalErrorHandling);

module.exports = app;
