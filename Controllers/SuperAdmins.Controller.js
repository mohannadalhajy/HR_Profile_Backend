const createError = require("http-errors");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const { ErrorResponse, SuccessResponse } = require("../Helpers/Response.Helper");
const AdminService = require("../Services/SuperAdmin.Service");
const modelName = "Admin"
const schema = require("../Models/Admin.model");
const { getNamespace } = require("continuation-local-storage");
const namespace = getNamespace("unique context")
const getConnection = () => {
    return namespace.get("connection").model(modelName, schema)
}
module.exports = {
    create: async (req, res, next) => {
        try {
            const conn = getConnection();
            let result = await AdminService.create(req.body, conn)
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
            const conn = getConnection();
            const result = await AdminService.getAll(conn);
            res.send(result);
        } catch (error) {
            console.log(error.message);
            next(error);
        }
    },
    delete: async (req, res, next) => {
        try {
            const conn = getConnection();
            const id = req.params.id;
            const result = await AdminService.delete(id, conn)
            res.send(result);
        } catch (error) {
            next(error);
        }
    },
    update: async (req, res, next) => {
        try {
            const conn = getConnection();
            if (!req.body) throw createError(400, "admin can not be empty.");
            const id = req.params.id;
            const result = await AdminService.update(req.body, id, conn)
            res.send(result);
        } catch (error) {
            next(error);
        }
    },
    findById: async (req, res, next) => {
        try {
            const id = req.params.id;
            const conn = getConnection();
            const admin = await conn.findById(id);
            // const product = await Product.findOne({ _id: id });
            if (!admin)
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
                new SuccessResponse(true, { email: admin.email }));
        } catch (error) {
            console.log(error.message);
            if (error instanceof mongoose.CastError)
                return next(createError(400, "Invalid public display id"));
            next(error);
        }
    }
};
