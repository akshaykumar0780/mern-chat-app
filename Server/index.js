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
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://localhost:5173");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.options(
  "*",
  cors({
    origin: "https://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

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
