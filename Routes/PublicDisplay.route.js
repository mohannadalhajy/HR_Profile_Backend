const express = require("express");
const router = express.Router();
const publicDisplayController = require("../Controllers/PublicDisplay.Controller");
const { verifyAccessToken } = require("../Helpers/jwt_helper");

//Get a list of all public display
router.get("/", verifyAccessToken, publicDisplayController.getAll);

//Init a public display
router.post("/init",verifyAccessToken, publicDisplayController.init);

//Create a new public display
router.post("/", verifyAccessToken, publicDisplayController.create);

//Get a public display by id
router.get("/:id", verifyAccessToken, publicDisplayController.findById);

//Update a public display by id
router.patch("/:id",verifyAccessToken, publicDisplayController.update);
router.patch("/",verifyAccessToken, publicDisplayController.updateAll);

//Delete a public display by id
router.delete("/:id", verifyAccessToken, publicDisplayController.delete);

module.exports = router;
