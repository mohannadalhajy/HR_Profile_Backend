const express = require("express");
const router = express.Router();
const CountryCodeController = require("../Controllers/CountryCode.Controller");
const { verifyAccessToken } = require("../Helpers/jwt_helper");

//Get a list of all public display
//router.get("/", verifyAccessToken, CountryCodeController.getAll);

//Init a public display
router.get("/",verifyAccessToken, CountryCodeController.get);
//router.post("/create",verifyAccessToken, CountryCodeController.create);
router.patch("/",verifyAccessToken, CountryCodeController.update);

module.exports = router;
