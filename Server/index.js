const express = require("express");
const dotenv = require("dotenv");
const { connectToMongoDB } = require("./connection");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoute = require("./routes/auth");
dotenv.config();
PORT = process.env.PORT || 5000;
const contactRoute = require("./routes/contacts");

const channelRoute = require("./routes/channel");

const messageRoute = require("./routes/messages");
const { setupSocket } = require("./socket");
const app = express();

//middleware
const allowedOrigins = process.env.ORIGIN.split(",");

app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Allow requests from specific origins
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use(cookieParser());
app.use(express.json());

//routes
app.use("/auth", authRoute);
app.use("/uploads/profiles", express.static("uploads/profiles"));
app.use("/uploads/files", express.static("uploads/files"));

app.use("/contacts", contactRoute);
app.use("/messages", messageRoute);
app.use("/channel", channelRoute);

connectToMongoDB(process.env.MONGODB_URL).then(() => {
  console.log("connected to MongoDB");
});

const server = app.listen(PORT, () => {
  console.log(`server started at ${PORT}`);
});

setupSocket(server);
