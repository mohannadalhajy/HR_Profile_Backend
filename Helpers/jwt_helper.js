const JWT = require("jsonwebtoken");
const createError = require("http-errors");
const superAdminRole = "superAdmin"

module.exports = {
  signAccessToken: (admin) => {
    return new Promise((resolve, reject) => {
      const payload = {admin};
      const secret = process.env.ACCESS_TOKEN_SECRET;
      const options = {
        expiresIn: "45d",
        issuer: "pickurpage.com",
      };
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) {
          console.log(err.message);
          reject(createError.InternalServerError());
          return;
        }
        resolve(token);
      });
    });
  },
  verifyAccessToken: (req, res, next) => {
    if (!req.headers["authorization"]) return next(createError.Unauthorized());
    const authHeader = req.headers["authorization"];
    const bearerToken = authHeader.split(" ");
    const token = bearerToken[1];
    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
      if (err) {
        const message =
          err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
        return next(createError.Unauthorized(message));
      }
      req.payload = payload;
      next();
    });
  },
  verifySuperAdmin: (req, res, next) => {
    if(req.payload.admin.role === superAdminRole) return next()
    return next(createError.Unauthorized());
  }

};
