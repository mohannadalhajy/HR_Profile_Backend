const express = require("express");
const router = express.Router();
const AdminController = require("../Controllers/SuperAdmins.Controller");
const { setAdminDb } = require("../Middlewares/connectionResolver");
const { verifyAccessToken } = require("../Helpers/jwt_helper");

router.post("/", AdminController.create);
router.get("/", AdminController.getAll);
router.delete("/:id", AdminController.delete);
router.patch("/:id", AdminController.update);
router.get("/:id", AdminController.findById);

module.exports = router;