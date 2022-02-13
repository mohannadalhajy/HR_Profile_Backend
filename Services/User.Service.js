const createError = require("http-errors");
const { ErrorResponse } = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const { authSchema } = require("../Helpers/validation_schema");

module.exports = {
  create: async (requestBody, user, model, tenantId) => {
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
                    "addUser",
                    "email",
                    `${result.email} is already registered`
                  ),
                ],
                code: SERVER_ERRORS.USER_IS_ALREADY_EXIST,
              }
            );
          user.email = requestBody.email
          user.password = await user.hashedPassword(requestBody.password)
          user.tenantId = tenantId
          resolve(user);
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  update: async (requestBody, user, model, tenantId) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const result = await authSchema.validateAsync(requestBody);
          const doesExist = await model.findOne({ email: result.email });
          if (doesExist && requestBody.email !== user.email)
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
          user.email = requestBody.email
          user.password = await user.hashedPassword(requestBody.password)
          user.tenantId = tenantId
          resolve(user);
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  
  getByTenant: async (model) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const users = await model.find().lean();
          resolve(users);
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  getByUser: async (model) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const users = await model.find().lean();
          resolve(users);
        } catch (error) {
          reject(error);
        }
      })();
    });
  }
};
