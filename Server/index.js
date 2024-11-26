const express = require("express");
const dotenv = require("dotenv");
const { connectToMongoDB } = require("./connection");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
const contactRoute = require("./routes/contacts");
const channelRoute = require("./routes/channel");
const messageRoute = require("./routes/messages");
const { setupSocket } = require("./socket");

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

// Allowed origins for CORS
const allowedOrigins = [
  "https://mern-chat-app-server-delta.vercel.app",
  "https://mern-chat-app-three-xi.vercel.app",
];

// Middleware to dynamically set CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  next();
});

// Handle OPTIONS preflight requests
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  res.sendStatus(200);
});

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// Routes
app.use("/auth", authRoute);
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));
app.use("/contacts", contactRoute);
app.use("/messages", messageRoute);
app.use("/channel", channelRoute);

// Connect to MongoDB
connectToMongoDB(process.env.MONGODB_URL).then(() => {
  console.log("Connected to MongoDB");
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});

// Set up WebSocket
setupSocket(server);
