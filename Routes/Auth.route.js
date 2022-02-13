const express = require("express");
const router = express.Router();
const AuthController = require("../Controllers/Auth.Controller");
const { verifyAccessToken } = require("../Helpers/jwt_helper");

//router.post("/register", AuthController.register);

router.post("/login", AuthController.login);

router.post("/logout", verifyAccessToken, AuthController.logout);

module.exports = router;  