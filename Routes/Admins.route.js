const express = require("express");
const router = express.Router();
const UsersController = require("../Controllers/Admins.Controller");
const { resolveTenant } = require("../Middlewares/connectionResolver");

router.post("/:tenant", resolveTenant, UsersController.create);
router.get("/:tenant", resolveTenant, UsersController.getByTenant);
router.delete("/:tenant/:id", resolveTenant, UsersController.delete);
router.patch("/:tenant/:id", resolveTenant, UsersController.update);
router.get("/:tenant/:id", resolveTenant, UsersController.findById);

module.exports = router;