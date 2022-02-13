const createError = require("http-errors");
//const Response = require("../Models/Response.model");
const mongoose = require("mongoose");
const ResponseService = require("../Services/Response.Service");
const {
  SuccessResponse,
  ErrorResponse,
} = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const modelName = "Response"
const schema = require("../Models/Response.model")
const { getNamespace } = require("continuation-local-storage");

module.exports = {
  create: async (req, res, next) => {
    try {
      const nameSpace = getNamespace("unique context");
      const Response = nameSpace.get("connection").model(modelName, schema);
      const response = new Response();
      const resultResponse = await ResponseService.createResponse(
        req.body,
        response,
        Response
      );

      await resultResponse.save();

      res.send(new SuccessResponse(true, {}));
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
      const responseId = req.params.id;
      const nameSpace = getNamespace("unique context");
      const Response = nameSpace.get("connection").model(modelName, schema);
      const response = await Response.findById(responseId);
      const resultResponse = await ResponseService.updateResponse(
        req.body,
        response
      );

      await resultResponse.save();

      res.send(new SuccessResponse(true, resultResponse));
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
      const nameSpace = getNamespace("unique context");
      const Response = nameSpace.get("connection").model(modelName, schema);
      const response = await Response.findById(id);
      // const product = await Product.findOne({ _id: id });
      if (!response) throw createError(404, "response does not exist.");
      res.send(response);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid response id"));
      next(error);
    }
  },
  findByCode: async (req, res, next) => {
    try {
      const code = req.params.code;
      const nameSpace = getNamespace("unique context");
      const Response = nameSpace.get("connection").model(modelName, schema);
      const response = await Response.find({code:code});
      // const product = await Product.findOne({ _id: id });
      if (response.length === 0) throw createError(404, "response does not exist.");
      res.send(response[0]);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid response id"));
      next(error);
    }
  },

  
  delete: async (req, res, next) => {
    try {
      const id = req.params.id;
      const nameSpace = getNamespace("unique context");
      const Response = nameSpace.get("connection").model(modelName, schema);
      const result = await Response.findByIdAndDelete(id);
      if (!result) throw createError(404, "Response does not exist.");
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid Response id"));
      next(error);
    }
  },


  getAll: async (req, res, next) => {
    try {
      const nameSpace = getNamespace("unique context");
      const Response = nameSpace.get("connection").model(modelName, schema);
      const responses = await ResponseService.getAllResponses(Response);

      res.send(new SuccessResponse(true, responses));
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
};
