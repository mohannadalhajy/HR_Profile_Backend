const createError = require("http-errors");
const mongoose = require("mongoose");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
//const CountryCode = require("../Models/CountryCode.model");
const { ErrorResponse, SuccessResponse } = require("../Helpers/Response.Helper");
const CountryCodeService = require("../Services/CountryCode.Service");
const modelName = "CountryCode"
const schema = require("../Models/CountryCode.model")
const { getNamespace } = require("continuation-local-storage");

module.exports = {
  /*create: async (req, res, next) => {
    try {
      const result = await CountryCodeService.create(req.body.code)
      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(
          createError.BadRequest({
            array_error: [
              new ErrorResponse("country Code", "code", "is not valid"),
            ],
            code: 422,
          }));
      next(error);
    }
  },*/
  update: async (req, res, next) => {
    try {
      const nameSpace = getNamespace("unique context");
      const CountryCode = nameSpace.get("connection").model(modelName, schema);
      let countryCode = await CountryCode.find({})
      if (countryCode.length === 0) {
        await CountryCodeService.create(req.body.code, CountryCode)
      }
      else {
        countryCode = countryCode[0]
        countryCode.code = req.body.code
        await countryCode.save();
      }
      res.send(new SuccessResponse(true, {}));
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(
          createError.BadRequest({
            array_error: [
              new ErrorResponse("country Code", "code", "is not valid"),
            ],
            code: 422,
          }));
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const nameSpace = getNamespace("unique context");
      const CountryCode = nameSpace.get("connection").model(modelName, schema);
      const result = await CountryCodeService.get(CountryCode);
      res.send(new SuccessResponse(true, { code:result }));
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(
          createError.BadRequest({
            array_error: [
              new ErrorResponse("country Code", "code", "is not valid"),
            ],
            code: 422,
          }));
      next(error);
    }
  }
}