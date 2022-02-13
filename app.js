const express = require("express");
const gitApi = require('@tinacms/api-git')
const morgan = require("morgan");
const createError = require("http-errors");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const AuthRoute = require("./Routes/Auth.route");
const SuperAdminsRoute = require("./Routes/SuperAdmins.route");
const TenantsRoute = require("./Routes/Tenants.route");
const AdminsRoute = require("./Routes/Admins.route");
const EmployeeRoute = require("./Routes/Employee.route");
const ResponseRoute = require("./Routes/Response.route");
const PublicDisplayRoute = require("./Routes/PublicDisplay.route");
const LandingRoute = require("./Routes/Landing.route");
const CountryCodeRoute = require("./Routes/CountryCode.route");
const ProfileRoute = require("./Routes/Profile.Route");
const { verifyAccessToken, verifySuperAdmin } = require("./Helpers/jwt_helper");

const path = require('path');
const compression = require('compression')
// const { createNamespace } = require("continuation-local-storage");
// let nameSpace = createNamespace("unique context");
const app = express();
const connectionResolver = require("./Middlewares/connectionResolver");

const {connectAllDb} = require('./Middlewares/connectionManager')
connectAllDb()
const fs = require('fs');
const dir1 = './images';
const dir2 = './Media';
const dir3 = './Background';
const dir4 = './VCards';
const dir5 = './Excel';
const dir6 = './pages';
if (!fs.existsSync(dir1)) {
  fs.mkdirSync(dir1);
}
if (!fs.existsSync(dir2)) {
  fs.mkdirSync(dir2);
}
if (!fs.existsSync(dir3)) {
  fs.mkdirSync(dir3);
}

if (!fs.existsSync(dir4)) {
  fs.mkdirSync(dir4);
}
if (!fs.existsSync(dir5)) {
  fs.mkdirSync(dir5);
}
if (!fs.existsSync(dir6)) {
  fs.mkdirSync(dir6);
}

app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(compression())
app.use(function (req, res, next) {
  let allowedOrigins = ["http://localhost:3000"]
  let origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin); // restrict it to the required domain
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

//app.use("/authSuperAdmin", AuthSuperAdminRoute);
app.use("/superAdmins",[verifyAccessToken, verifySuperAdmin, connectionResolver.resolveTenant] ,SuperAdminsRoute)
app.use("/profile", [verifyAccessToken, connectionResolver.resolveTenant], ProfileRoute);
app.use("/tenants", [verifyAccessToken, verifySuperAdmin, connectionResolver.resolveTenant], TenantsRoute)
app.use("/admins", [verifyAccessToken], AdminsRoute)
//app.use("/authAdmin", AuthAdminRoute);
app.use("/auth", AuthRoute);
app.use("/employee", connectionResolver.resolveTenant, EmployeeRoute);
//app.use("/users", connectionResolver.resolveTenant, UsersRoute)
app.use('/static', express.static('images'));
app.use("/response", connectionResolver.resolveTenant, ResponseRoute);
app.use("/publicDisplay", connectionResolver.resolveTenant, PublicDisplayRoute);
app.use("/landing", connectionResolver.resolveTenant, LandingRoute);
app.use("/countryCode", connectionResolver.resolveTenant, CountryCodeRoute);
app.use("/QRs", express.static('./files.zip'));
app.use("/Contacts", express.static('./Excel.xlsx'));
app.use("/Errors", express.static('./ErrorsExcel.xlsx'));
app.use("/sampleExcel", express.static('./sampleExcel.xlsx'));

app.use('/___tina', gitApi.router({
  pathToRepo: process.cwd(),
  pathToContent: "/Media",
}))
app.use('/Media', express.static('Media'));
app.use('/Background', express.static('Background'));

app.use(express.static(path.join(__dirname, "../qradmininterface/build")))
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, "../qradmininterface/build", "index.html"))
})
app.use(async (req, res, next) => {
  next(createError.NotFound());
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

const PORT = process.env.PORT || 3007;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});