const express = require("express");
const router = express.Router();
const tenantController = require("../Controllers/Tenants.Controller");


//Get a list of all responses
router.get("/", tenantController.getAll);

//Create a new response
router.post("/", tenantController.create);

//Get a response by id
router.get("/:id", tenantController.findById);

//Update a response by id
router.patch("/:id", tenantController.update);

//Delete a response by id
router.delete("/:id", tenantController.delete);

module.exports = router;
