const express = require("express");
const {
  handleUserSignup,
  handleUserLogin,
  getUserInfo,
  updateProfile,
  addProfileImage,
  removeProfileImage,
  logout,
} = require("../controllers/auth");

const { verifyToken } = require("../middlewares/auth");

const router = express.Router();
const multer = require("multer");

router.post("/signup", handleUserSignup);
router.post("/login", handleUserLogin);
router.get("/user-info", verifyToken, getUserInfo);
router.post("/update-profile", verifyToken, updateProfile);
router.post("/logout", logout);

const upload = multer({ dest: "uploads/profiles/" });

router.post(
  "/add-profile-image",
  verifyToken,
  upload.single("profile-image"),
  addProfileImage
);

router.delete("/remove-profile-image", verifyToken, removeProfileImage);

module.exports = router;
