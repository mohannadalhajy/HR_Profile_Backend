const createError = require("http-errors");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const { ErrorResponse, SuccessResponse } = require("../Helpers/Response.Helper");
const UserService = require("../Services/User.Service");
const { getNamespace } = require("continuation-local-storage");
const namespace = getNamespace("unique context")
const modelName = "User"
const schema = require("../Models/User.model")
const getConnection = () => {
    return namespace.get("connection")
}
const getUserModel = (connection) => {
  return connection.model(modelName, schema)
}

module.exports = {
    create: async (req, res, next) => {
        try {
            const UserModel = getUserModel(getConnection())
            const tenantId = req.headers["tenant"]
            let result = await UserService.create({...req.body, tenant:tenantId}, UserModel)
            res.send(result);
        } catch (error) {
            console.log(error.message);
            if (error.name === "ValidationError")
                return next(createError(422, error.message));
            next(error);
        }
    },
    getAll: async (req, res, next) => {
        try {
            const UserModel = getUserModel(getConnection())
            const result = await UserService.getAll(UserModel);
            res.send(result);
        } catch (error) {
            console.log(error.message);
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            const UserModel = getUserModel(getConnection())
            const id = req.params.id;
            const result = await UserService.delete(id, UserModel)
            res.send(result);
        } catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            if (!req.body) throw createError(400, "user can not be empty.");
            const UserModel = getUserModel(getConnection())
            const tenantId = req.headers["tenant"]
            const id = req.params.id;
            const result = await UserService.update({...req.body, tenant:tenantId}, id, UserModel)
            res.send(result);
        } catch (error) {
            next(error);
        }
    },
    findById: async (req, res, next) => {
        try {
            const User = getUserModel(getConnection())
            const id = req.params.id;
            const user = await User.findById(id);
            // const product = await Product.findOne({ _id: id });
            if (!user)
                throw createError.NotFound({
                    array_error: [
                        new ErrorResponse(
                            "findById",
                            "id",
                            `Public display ${id} isn't Exist`
                        ),
                    ],
                    code: "PUBLIC_DISPLAY_NOT_FOUND",
                });
            res.send(
                new SuccessResponse(true, { email: user.email }));
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError)
                return next(createError(400, "Invalid public display id"));
            next(error);
        }
    }
};
