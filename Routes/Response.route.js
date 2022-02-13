const express = require("express");
const router = express.Router();
const responseController = require("../Controllers/Response.Controller");
const { verifyAccessToken } = require("../Helpers/jwt_helper");


//Get a list of all responses
router.get("/", verifyAccessToken, responseController.getAll);

//Create a new response
router.post("/" ,verifyAccessToken, responseController.create);

//Get a response by code
router.get("/code/:code", responseController.findByCode);
//Get a response by id
router.get("/:id", responseController.findById);

//Update a response by id
router.patch("/:id", verifyAccessToken, responseController.update);

//Delete a response by id
router.delete("/:id", verifyAccessToken, responseController.delete);

module.exports = router;
