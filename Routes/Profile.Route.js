const express = require("express");
const router = express.Router();
const ProfileController = require("../Controllers/Profile.Controller");

//Get Profile me
router.get("/profile-me", ProfileController.get);

//Update Password
router.put("/password", ProfileController.updatePassword);


//Update Email
router.put("/email", ProfileController.updateEmail);

module.exports = router;
