const createError = require("http-errors");
//const User = require("../Models/User.model");
const mongoose = require("mongoose");
const {
  SuccessResponse,
  ErrorResponse,
} = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const modelName = "Admin"
const schema = require("../Models/Admin.model")
const { getNamespace } = require("continuation-local-storage");

//const { generateCodeAndSendMail } = require("../Helpers/NodeMailer.Helper");
//const OTP = require("../Models/OTP");
//const userService = require("../Services/User.Service");
//const OTPServices = require("../Services/OTP.Service");

module.exports = {
  get: async (req, res, next) => {
    try {
      const id = req.payload.admin._id;
      const nameSpace = getNamespace("unique context");
      const Admin = nameSpace.get("connection").model(modelName, schema);
      const admin = await Admin.findById(id);

      if (!admin) {
        throw createError.NotFound({
          array_error: [
            new ErrorResponse("payload", "userId", "User not registered"),
          ],
          code: SERVER_ERRORS.USER_NOT_REGISTERED,
        });
      }

      res.send(new SuccessResponse(true, { admin }));
    } catch (error) {
      if (error instanceof mongoose.CastError)
        return next(
          createError.BadRequest({
            array_error: [new ErrorResponse("payload", "id", "Invalid id")],
            code: SERVER_ERRORS.INVALID_ID,
          })
        );
      next(error);
    }
  },
  updatePassword: async (req, res, next) => {
    try {
      const id = req.payload.admin._id;
      const { oldPassword, newPassword } = req.body;

      const nameSpace = getNamespace("unique context");
      const User = nameSpace.get("connection").model(modelName, schema);
      const user = await User.findById(id);
      if (!user) {
        throw createError.NotFound({
          array_error: [
            new ErrorResponse("payload", "userId", "User not registered"),
          ],
          code: SERVER_ERRORS.USER_NOT_REGISTERED,
        });
      }

      // check if old password is correct
      const isMatch = await user.isValidPassword(oldPassword);
      if (!isMatch) {
        throw createError.BadRequest({
          array_error: [
            new ErrorResponse(
              "body",
              "password",
              "old password is not correct"
            ),
          ],
          code: SERVER_ERRORS.OLD_PASSWORD_IS_NOT_CORRECT,
        });
      }

      const hPassword = await user.hashedPassword(newPassword);
      user.password = hPassword;
      await user.save();

      res.send(new SuccessResponse(true, {}));
    } catch (error) {
      if (error instanceof mongoose.CastError)
        return next(
          createError.BadRequest({
            array_error: [new ErrorResponse("payload", "id", "Invalid id")],
            code: SERVER_ERRORS.INVALID_ID,
          })
        );
      next(error);
    }
  },

  updateEmail: async (req, res, next) => {
    try {
      const { newEmail, oldPassword } = req.body;
      const id = req.payload.admin._id;
      const nameSpace = getNamespace("unique context");
      const User = nameSpace.get("connection").model(modelName, schema);
      const user = await User.findById(id);
      if (!user) {
        throw createError.NotFound({
          array_error: [
            new ErrorResponse("payload", "userId", "User not registered"),
          ],
          code: SERVER_ERRORS.USER_NOT_REGISTERED,
        });
      }

      // check if old password is correct
      const isMatch = await user.isValidPassword(oldPassword);
      if (!isMatch) {
        throw createError.BadRequest({
          array_error: [
            new ErrorResponse(
              "body",
              "password",
              "old password is not correct"
            ),
          ],
          code: SERVER_ERRORS.OLD_PASSWORD_IS_NOT_CORRECT,
        });
      }
      await User.findOneAndUpdate({ _id: id }, { email: newEmail });

      res.send(new SuccessResponse(true, {}));
    } catch (error) {
      if (error instanceof mongoose.CastError)
        return next(
          createError.BadRequest({
            array_error: [new ErrorResponse("payload", "id", "Invalid id")],
            code: SERVER_ERRORS.INVALID_ID,
          })
        );
      next(error);
    }
  },
};
/*updateProfileMe: async (req, res, next) => {
    try {
      const id = req.payload.userId;

      const user = await User.findById(id);

      if (!user) {
        throw createError.NotFound({
          array_error: [
            new ErrorResponse("payload", "userId", "User not registered"),
          ],
          code: SERVER_ERRORS.USER_NOT_REGISTERED,
        });
      }

      //await userService.updateUser(req.body, user);
      await user.save();

      res.send(new SuccessResponse(true, {}));
    } catch (error) {
      if (error instanceof mongoose.CastError)
        return next(
          createError.BadRequest({
            array_error: [new ErrorResponse("payload", "id", "Invalid id")],
            code: SERVER_ERRORS.INVALID_ID,
          })
        );
      next(error);
    }
  },*/
