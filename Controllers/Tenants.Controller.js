const createError = require("http-errors");
const mongoose = require("mongoose");
const TenantService = require("../Services/Tenant.Service");
const {
  SuccessResponse,
  ErrorResponse,
} = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const modelName = "Tenant"
const schema = require("../Models/Tenant.model");
const { getNamespace } = require("continuation-local-storage");
const namespace = getNamespace("unique context")
const getConnection = () => {
    return namespace.get("connection").model(modelName, schema)
}
module.exports = {
  create: async (req, res, next) => {
    try {
      const tenant = getConnection()();
      const result = await TenantService.create(
        req.body,
        tenant,
        getConnection()
      );

      await result.save();

      res.send(new SuccessResponse(true, result));
    } catch (error) {
      if (error instanceof mongoose.CastError)
        return next(
          createError.BadRequest({
            array_error: [
              new ErrorResponse("payload/body", "id", "Invalid id"),
            ],
            code: SERVER_ERRORS.INVALID_ID,
          })
        );
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = req.params.id;
      const tenantModel = getConnection()
      const tenant = await tenantModel.findById(id);
      const result = await TenantService.update(
        req.body,
        tenant,
        tenantModel
      );

      await result.save();

      res.send(new SuccessResponse(true, result));
    } catch (error) {
      if (error instanceof mongoose.CastError)
        return next(
          createError.BadRequest({
            array_error: [
              new ErrorResponse("payload/body", "id", "Invalid id"),
            ],
            code: SERVER_ERRORS.INVALID_ID,
          })
        );
      next(error);
    }
  },
  findById: async (req, res, next) => {
    try {
      const id = req.params.id;
      const tenant = await getConnection().findById(id);
      // const product = await Product.findOne({ _id: id });
      if (!tenant) throw createError(404, "tenant does not exist.");
      res.send(new SuccessResponse(true, tenant));
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid tenant id"));
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const id = req.params.id;
      const result = await getConnection().findByIdAndDelete(id);
      if (!result) throw createError(404, "Tenant does not exist.");
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid Tenant id"));
      next(error);
    }
  },
  getAll: async (req, res, next) => {
    try {
      const tenants = await TenantService.getAll(getConnection());
      res.send(new SuccessResponse(true, tenants));
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
};
