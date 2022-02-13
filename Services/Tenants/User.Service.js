const createError = require("http-errors");
const { ErrorResponse, SuccessResponse } = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const { authSchema } = require("../Helpers/validation_schema");

module.exports = {
  create: async (requestBody, User) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const result = await authSchema.validateAsync(requestBody);
          const doesExist = await User.findOne({ email: result.email });
          if (doesExist)
            throw createError.Conflict(
              {
                array_error: [
                  new ErrorResponse(
                    "addUser",
                    "email",
                    `${result.email} is already registered`
                  ),
                ],
                code: SERVER_ERRORS.USER_IS_ALREADY_EXIST,
              }
            );
          const user = new User(result);
          user.tenantId = requestBody.tenant;
          user.password = await user.hashedPassword(user.password)
          const savedUser = await user.save();

          resolve(new SuccessResponse(true, { user: { email: savedUser.email, _id: savedUser._id } }));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  update: async (requestBody, id, User) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const result = await authSchema.validateAsync(requestBody);
          let user = await User.findById(id);
          const doesExist = await User.findOne({ email: result.email });
          if (doesExist && user.email !== result.email)
            throw createError.Conflict(
              {
                array_error: [
                  new ErrorResponse(
                    "updateUser",
                    "email",
                    `${result.email} is already registered`
                  ),
                ],
                code: SERVER_ERRORS.USER_IS_ALREADY_EXIST,
              }
            );

          const options = { new: true };
          user.password = await user.hashedPassword(result.password)
          user.tenantId = requestBody.tenant;
          user.email = result.email
          const resultEdit = await User.findByIdAndUpdate(id, user, options);
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
          resolve(new SuccessResponse(true, { user: { email: resultEdit.email, _id: resultEdit._id } }));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },

  getAll: async (User) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const result = await User.find({}, { password: 0 });
          resolve(new SuccessResponse(true, result));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },

  delete: async (id, User) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const result = await User.findByIdAndDelete(id);
          if (!result) throw createError.NotFound(

            {
              array_error: [
                new ErrorResponse(
                  "deleteUser",
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
