const mongoose = require("mongoose");
const User = require("../Models/user");
const Message = require("../Models/messages");

async function searchContact(req, res, next) {
  try {
    const { searchTerm } = req.body;
    if (searchTerm === undefined || searchTerm === null) {
      return res.status(400).send("SearchTerm is required.");
    }

    const sanitizedSearchTerm = searchTerm.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const regx = new RegExp(sanitizedSearchTerm, "i");

    const contacts = await User.find({
      $and: [
        { _id: { $ne: req.userId } },
        {
          $or: [
            {
              firstName: regx,
            },
            {
              lastName: regx,
            },
            {
              email: regx,
            },
          ],
        },
      ],
    });

    return res.status(200).json({ contacts });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

async function getContactsForDMlist(req, res, next) {
  try {
    let { userId } = req;
    userId = new mongoose.Types.ObjectId(userId);
    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { recipient: userId }],
        },
      },
      {
        $sort: { Timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userId] },
              then: "$recipient",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          email: "$contactInfo.email",
          firstName: "$contactInfo.firstName",
          lastName: "$contactInfo.lastName",
          profileImage: "$contactInfo.profileImage",
          color: "$contactInfo.color",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return res.status(200).json({ contacts });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

async function getAllContacts(req, res, next) {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } },
      "firstName lastName _id email"
    );
    const contacts = users.map((user) => ({
      label: user.firstName
        ? `${user.firstName} ${user.lastName} `
        : user.email,
      value: user._id,
    }));

    return res.status(200).json({ contacts });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  searchContact,
  getContactsForDMlist,
  getAllContacts,
};
