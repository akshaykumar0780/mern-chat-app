const express = require("express");
const multer = require("multer");
const { verifyToken } = require("../middlewares/auth");

const { getMessages, uploadFile } = require("../controllers/messages");
const router = express.Router();

const upload = multer({ dest: "uploads/files" });

router.post("/get-messages", verifyToken, getMessages);
router.post("/upload-file", verifyToken, upload.single('file'), uploadFile );

module.exports = router;
