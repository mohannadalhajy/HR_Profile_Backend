const createError = require("http-errors");
//const PublicDisplay = require("../Models/PublicDisplay.model");
//const mongoose = require("mongoose");
const { ErrorResponse, SuccessResponse } = require("../Helpers/Response.Helper");
const PublicDisplayService = require("../Services/PublicDisplay.Service");
const modelName = "PublicDisplay"
const schema = require("../Models/PublicDisplay.model")
const { getNamespace } = require("continuation-local-storage");

module.exports = {
  create: async (req, res, next) => {
    try {
      const nameSpace = getNamespace("unique context");
      const PublicDisplay = nameSpace.get("connection").model(modelName, schema);
      let result = await PublicDisplayService.create(req.body, PublicDisplay)
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(createError(422, error.message));
      next(error);
    }
  },
  init: async (req, res, next) => {
    try {
      const nameSpace = getNamespace("unique context");
      const PublicDisplay = nameSpace.get("connection").model(modelName, schema);
      let result = await PublicDisplayService.init(PublicDisplay)
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(createError(422, error.message));
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      if (!req.body) throw createError(400, "Display setting can not be empty.");
      const id = req.params.id;
      const nameSpace = getNamespace("unique context");
      const PublicDisplay = nameSpace.get("connection").model(modelName, schema);
      const result = await PublicDisplayService.update(req.body, id, PublicDisplay)
      res.send(result);
    } catch (error) {
      next(error);
    }
  },
  updateAll: async (req, res, next) => {
    try {
      if (!req.body) throw createError(400, "Display setting can not be empty.");
      const nameSpace = getNamespace("unique context");
      const PublicDisplay = nameSpace.get("connection").model(modelName, schema);
      const result = await PublicDisplayService.updateAll(req.body.displays, PublicDisplay)
      res.send(result);
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const id = req.params.id;
      const nameSpace = getNamespace("unique context");
      const PublicDisplay = nameSpace.get("connection").model(modelName, schema);
      await PublicDisplayService.delete(id, PublicDisplay)
      res.send(new SuccessResponse(true, {}));
    } catch (error) {
      next(error);
    }
  },
  getAll: async (req, res, next) => {
    try {
      const nameSpace = getNamespace("unique context");
      const PublicDisplay = nameSpace.get("connection").model(modelName, schema);
      const result = await PublicDisplayService.getAll(PublicDisplay);
      res.send(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
  findById: async (req, res, next) => {
    try {
      const id = req.params.id;
      const nameSpace = getNamespace("unique context");
      const PublicDisplay = nameSpace.get("connection").model(modelName, schema);
      const publicDisplay = await PublicDisplay.findById(id);
      // const product = await Product.findOne({ _id: id });
      if (!publicDisplay)
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
        new SuccessResponse(true, publicDisplay));
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid public display id"));
      next(error);
    }
  }

};

