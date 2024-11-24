const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const {
  createChannel,
  getUsersChannels,
  getChannelMessages,
} = require("../controllers/channel");
const router = express.Router();

router.post("/create-channel", verifyToken, createChannel);
router.get("/get-user-channles", verifyToken, getUsersChannels);
router.get("/get-channel-messages/:channelId", verifyToken, getChannelMessages);

module.exports = router;
