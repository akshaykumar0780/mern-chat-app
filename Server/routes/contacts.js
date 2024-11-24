const express = require("express");
const { verifyToken } = require("../middlewares/auth");
const {
  searchContact,
  getContactsForDMlist,
  getAllContacts,
} = require("../controllers/contacts");
const router = express.Router();

router.post("/search", verifyToken, searchContact);
router.get("/get-contacts-for-dm", verifyToken, getContactsForDMlist);
router.get("/get-all-contacts", verifyToken, getAllContacts);

module.exports = router;
