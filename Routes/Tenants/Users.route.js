const express = require("express");
const router = express.Router();
const UsersController = require("../Controllers/Users.Controller");
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.post("/", verifyAccessToken, UsersController.create);
router.get("/", verifyAccessToken, UsersController.getAll);
router.delete("/:id", verifyAccessToken, UsersController.delete);
router.patch("/:id", verifyAccessToken, UsersController.update);
router.get("/:id", verifyAccessToken, UsersController.findById);

module.exports = router;