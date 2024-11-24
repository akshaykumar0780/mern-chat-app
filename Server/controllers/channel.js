const { default: mongoose } = require("mongoose");
const Channel = require("../Models/channel");
const User = require("../Models/user");

async function createChannel(req, res, next) {
  try {
    const { name, members } = req.body;
    const userId = req.userId;
    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(400).send("Admin User not found.");
    }

    const validMembers = await User.find({
      _id: {
        $in: members,
      },
    });
    if (validMembers.length !== members.length) {
      return res.status(400).send("Some members are not valid users.");
    }

    const newChannel = new Channel({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();

    return res.status(201).json({ channel: newChannel });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

async function getUsersChannels(req, res, next) {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Channel.find({
      $or: [{ admin: userId }, { members: userId }],
    }).sort({ updatedAt: -1 });

    return res.status(201).json({ channels });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

async function getChannelMessages(req, res, next) {
  try {
    const { channelId } = req.params;
    const channel = await Channel.findById(channelId).populate({
      path: "messages",
      populate: {
        path: "sender",
        select: "firstName lastName email _id profileImage color",
      },
    });

    if (!channel) return res.status(404).send("Channel not found.");
    
    const messages = channel.messages;

    return res.status(201).json({ messages });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  createChannel,
  getUsersChannels,
  getChannelMessages,
};
