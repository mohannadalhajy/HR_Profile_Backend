const createError = require("http-errors");
const { ErrorResponse, SuccessResponse } = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const { authSchema } = require("../Helpers/validation_schema");
const superAdminRole = "superAdmin"
module.exports = {
  create: async (requestBody, model) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const result = await authSchema.validateAsync(requestBody);
          const doesExist = await model.findOne({ email: result.email });
          if (doesExist)
            throw createError.Conflict(
              {
                array_error: [
                  new ErrorResponse(
                    "addSuperAdmin",
                    "email",
                    `${result.email} is already registered`
                  ),
                ],
                code: SERVER_ERRORS.USER_IS_ALREADY_EXIST,
              }
            );
          const admin = new model(result);
          admin.password = await admin.hashedPassword(admin.password)
          admin.role = superAdminRole
          const savedAdmin = await admin.save();

          resolve(new SuccessResponse(true, { email: savedAdmin.email, _id: savedAdmin._id }));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  update: async (requestBody, id, model) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const result = await authSchema.validateAsync(requestBody);
          let admin = await model.findById(id);
          const doesExist = await model.findOne({ email: result.email });
          if (doesExist && admin.email !== result.email)
            throw createError.Conflict(
              {
                array_error: [
                  new ErrorResponse(
                    "updateAdmin",
                    "email",
                    `${result.email} is already registered`
                  ),
                ],
                code: SERVER_ERRORS.USER_IS_ALREADY_EXIST,
              }
            );

          const options = { new: true };
          admin.password = await admin.hashedPassword(result.password)
          admin.email = result.email
          const resultEdit = await model.findByIdAndUpdate(id, admin, options);
          if (!resultEdit) throw createError.BadRequest({
            array_error: [
              new ErrorResponse(
                "updateEmployee",
                "Employee",
                "Employee is not valid"
              ),
            ],
            code: SERVER_ERRORS.EMPLOYEE_ID_EXIST,
          })
          resolve(new SuccessResponse(true, { admin: { email: resultEdit.email, _id: resultEdit._id } }));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },

  getAll: async (model) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const result = await model.find({}, { password: 0 });
          resolve(new SuccessResponse(true, result));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },

  delete: async (id, model) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const result = await model.findByIdAndDelete(id);
          if (!result) throw createError.NotFound(

            {
              array_error: [
                new ErrorResponse(
                  "deleteSuperAdmin",
                  "id",
                  `${id} does not exist.`
                ),
              ],
              code: SERVER_ERRORS.USER_IS_ALREADY_EXIST,
            }
          );
          resolve(new SuccessResponse(true, {}));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
};
