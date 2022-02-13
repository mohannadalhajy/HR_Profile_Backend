const express = require("express");
const router = express.Router();
const LandingController = require("../Controllers/Landing.Controller");
const multer = require("multer");
const path = require('path');
const connectionResolver = require("../Middlewares/connectionResolver");
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Background');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }  
});  
const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype == 'image/jpg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}
const upload = multer({ storage: storage, fileFilter: fileFilter });

//Get a list of all Landings
router.get("/", LandingController.get);
router.get("/image", LandingController.getBackground);

router.post("/changeBackground",[upload.single("image"),connectionResolver.resolveTenant], LandingController.changeBackground);

//Create a new Landing
//router.post("/",LandingController.createNewLanding);

//Get a Landing by id
//router.get("/:id", LandingController.findLandingById);

//Update a Landing by id
router.patch("/", LandingController.update);

//Delete a Landing by id
//router.delete("/:id", verifyAccessToken, LandingController.deleteALanding);

module.exports = router;
