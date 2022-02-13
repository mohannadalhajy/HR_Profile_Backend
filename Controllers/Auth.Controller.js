const createError = require("http-errors");
const { authSchema } = require("../Helpers/validation_schema");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const { ErrorResponse, SuccessResponse } = require("../Helpers/Response.Helper");
const { signAccessToken } = require("../Helpers/jwt_helper");
const modelName = "Admin"
const schema = require("../Models/Admin.model")
const { resolveLoginTenant } = require("../Middlewares/connectionResolver");
const SuperAdminService = require("../Services/SuperAdmin.Service");
module.exports = {
    login: async (req, res, next) => {
        try {
            const result = await authSchema.validateAsync(req.body);
            const tenant = req.body.tenant
            const conn = resolveLoginTenant(req.body.tenant)
            if (!conn) throw createError.NotFound({
                array_error: [
                    new ErrorResponse("body", "email", "Admin not registered."),
                ],
                code: SERVER_ERRORS.USER_NOT_REGISTERED,
            });
            let admin = await conn.model(modelName, schema).findOne(
                { email: req.body.email },
                { id: 1, email: 1, password: 1, tenantId: 1, role:1 }
            );

            if (!admin && req.body.tenant != "admin") throw createError.NotFound({
                array_error: [
                    new ErrorResponse("body", "email", "Admin not registered"),
                ],
                code: SERVER_ERRORS.USER_NOT_REGISTERED,
            });


            if (!admin) {
                const adminsCount = await conn.model(modelName, schema).countDocuments();
                console.log("adminsCount", adminsCount)
                if (adminsCount)
                  throw createError.NotFound({
                    array_error: [
                      new ErrorResponse("body", "email", "Admin not registered"),
                    ],
                    code: SERVER_ERRORS.USER_NOT_REGISTERED,
                  });
                admin = await SuperAdminService.create({ email: result.email, password: result.password }, conn.model(modelName, schema));
                admin = admin.result
              }
              else {
                const isMatch = await admin.isValidPassword(result.password);
                if (!isMatch)
                  throw createError.Forbidden({
                    array_error: [
                      new ErrorResponse("body", "password", `Email/Password not valid`),
                    ],
                    code: SERVER_ERRORS.INVALID_PASSWORD,
                  });
              }
            const accessToken = await signAccessToken(admin);
            res.send(new SuccessResponse(true, { accessToken, admin }));
        } catch (error) {
            if (error.isJoi === true)
                return next(createError.BadRequest("Invalid Admin name/Password"));
            next(error);
        }
    },

    logout: async (req, res, next) => {
        try {
            console.log("userId : ", req.payload.userId);
            console.log("role   : ", req.payload.role);
            res.send(new SuccessResponse(true, {}));
        } catch (error) {
            next(error);
        }
    }
};
/*register: async (req, res, next) => {
    try {
      const result = await authSchema.validateAsync(req.body);

      const doesExist = await Admin.findOne({ email: result.email });
      if (doesExist)
        throw createError.Conflict(
          `${result.email} is already registered`
        );
      const admin = new Admin(result);
      admin.password = await admin.hashedPassword(admin.password)
      const savedUser = await admin.save();
      const accessToken = await signAccessToken(savedUser.id);
      res.send(
        new SuccessResponse(true, {accessToken})
      );
    } catch (error) {
      if (error.isJoi === true) error.status = 422;
      next(error);
    }
  },
*/