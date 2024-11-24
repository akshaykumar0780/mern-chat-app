const { compare } = require("bcrypt");
const User = require("../Models/user");
const jwt = require("jsonwebtoken");
const { renameSync, unlinkSync } = require("fs");
const maxAge = 3 * 24 + 60 * 60 * 1000;

function createToken(email, userId) {
  return jwt.sign({ email, userId }, process.env.JWT_KEY, {
    expiresIn: maxAge,
  });
}

async function handleUserSignup(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password is required");
    }

    const user = await User.create({ email, password });

    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "lax",
    });
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,

        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

async function handleUserLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and Password is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found.");
    }

    const auth = await compare(password, user.password);
    if (!auth) {
      return res.status(400).send("Password is incorrect.");
    }

    res.cookie("jwt", createToken(email, user.id), {
      maxAge,
      secure: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        color: user.color,
      },
    });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

async function getUserInfo(req, res, next) {
  try {
    const userData = await User.findById(req.userId);
    if (!userData) {
      return res.status(404).send("User with the given id not found");
    }

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImage: userData.profileImage,
      color: userData.color,
    });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

async function updateProfile(req, res, next) {
  try {
    const { userId } = req;
    const { firstName, lastName, color } = req.body;

    if (!firstName || !lastName) {
      return res.status(404).send("Firstname lastname and color is required.");
    }

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        profileSetup: true,
      },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImage: userData.profileImage,
      color: userData.color,
    });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

async function removeProfileImage(req, res, next) {
  try {
    const { userId } = req;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.profileImage) {
      unlinkSync(user.profileImage);
    }
    user.profileImage = null;
    await user.save();

    return res.status(200).send("Profile Image removed successfully");
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

async function addProfileImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).send("File is required");
    }
    const date = Date.now();
    let fileName = "uploads/profiles/" + date + req.file.originalname;
    renameSync(req.file.path, fileName);
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        profileImage: fileName,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

async function logout(req, res, next) {
  try {
    res.cookie("jwt", "", { maxAge: 1, secure: true, sameSite: "none" });

    return res.status(200).send("Logout successfull.");
  } catch (error) {
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
  getUserInfo,
  updateProfile,
  addProfileImage,
  removeProfileImage, logout
};
