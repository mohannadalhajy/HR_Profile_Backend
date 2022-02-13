const express = require("express");
const router = express.Router();
const employeeController = require("../Controllers/Employee.Controller");
const multer = require("multer");
const path = require('path');
const { verifyAccessToken } = require("../Helpers/jwt_helper");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images');
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
const connectionResolver = require("../Middlewares/connectionResolver");

/*
const storageVCard = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'VCards');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }  
});*/  
const storageExcel = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Excel');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }  
});  
//const uploadVCard = multer({ storage: storageVCard });
const uploadExcel = multer({ storage: storageExcel });


//Get a list of all employees
router.get("/",verifyAccessToken, employeeController.getEmployees);
//test add 5000 employee
//router.get("/testAddEmployee", employeeController.testAdd5000Employee);
//router.get("/testDeleteEmployee", employeeController.testDeleteEmployee);

//Create a new employee
router.post("/", verifyAccessToken, employeeController.createEmployee);
//Search Employee
router.post("/search", verifyAccessToken, employeeController.search);

//Export Excel
router.post("/excel", verifyAccessToken, employeeController.exportExcel);
//import VCard
//router.post("/importVCard", uploadVCard.single("File"), employeeController.importVCard);
router.post("/importExcel", uploadExcel.single("File"), employeeController.importExcel);

router.post("/uploadimage",[connectionResolver.resolveTenant, upload.single("image")], employeeController.UploadImage);
//router.get("/qr/:id", employeeController.editQREmployee);
router.get("/importProgressPercentage", verifyAccessToken, employeeController.getImportProgressPercentage);
router.get("/exportProgressPercentage", verifyAccessToken, employeeController.getExportProgressPercentage);

//Get a employee by id
router.get("/:id", verifyAccessToken, employeeController.findEmployeeById);

//Get a employee by id to guest
router.get("/guest/:id/:tenant", connectionResolver.resolveTenant, employeeController.findEmployeeByIdToGuest);

//Download VCard
router.get("/vcard/:id", verifyAccessToken, employeeController.downloadVCard);
//Download VCard
router.get("/vcardGuest/:id",connectionResolver.resolveTenant, employeeController.downloadVCardGuest);

//Download VCards
router.post("/vcards", verifyAccessToken, employeeController.downloadVCards);

//Download QRs
router.post("/qrs", verifyAccessToken, employeeController.downloadQRs);

//Update a employee by id
router.patch("/:id",verifyAccessToken, employeeController.updateEmployee);

//Delete a employee by id
router.delete("/:id", verifyAccessToken, employeeController.deleteEmployee);

//Delete a employees
router.post("/deleteEmployees", verifyAccessToken, employeeController.deleteEmployees);

module.exports = router;
