const {
  ErrorResponse,
} = require("../Helpers/Response.Helper");
const createError = require("http-errors");
//const Landing = require("../Models/Landing.model");
const mongoose = require("mongoose");
const path = require('path');
const LandingService = require("../Services/Landing.Service");
const modelName = "Landing"
const schema = require("../Models/Landing.model")
const { getNamespace } = require("continuation-local-storage");1

module.exports = {
  changeBackground: async (req, res, next) => {
    try {
      const nameSpace = getNamespace("unique context");
      const Landing = nameSpace.get("connection").model(modelName, schema);
      if (!req.file) throw createError(400, "Bad Image");
      let landing = await LandingService.get(Landing)
      landing.Background = req.file.filename;
      const result = await landing.save()//findByIdAndUpdate(id, landing, options);
      if (!result) throw createError(404, "Landing does not exist");
      res.send({name:req.file.filename});
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(createError(422, error.message));
      next(error);
    }
  },
  getBackground: async (req, res, next) => {
    try {
      const nameSpace = getNamespace("unique context");
      const Landing = nameSpace.get("connection").model(modelName, schema);
      const results = await LandingService.get(Landing);
      res.sendFile(path.join(__dirname, '../Background', results.Background));
    } catch (error) {
      console.log(error.message);
      if (error.name === "ValidationError")
        return next(createError(422, error.message));
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      if (!req.body) throw createError(400, "Landing can not be empty.");
      const nameSpace = getNamespace("unique context");
      const Landing = nameSpace.get("connection").model(modelName, schema);
      let landing = await LandingService.get(Landing);
      let check = false;
      req.body.blocks.forEach(element => {
        if(element._template === 'Button') check = true;
      });
      if(!check){
        throw createError.Forbidden({
          array_error: [
            new ErrorResponse(
              "Landing.Controller update",
              "body",
              "Landing don't not contain employee button"
            ),
          ],
          code: 1000,
        });
      }
      landing.json = req.body;
      const result = await landing.save()//.findByIdAndUpdate(id, landing, options);
      if (!result) throw createError(404, "Landing does not exist");

      res.send(result);
    } catch (error) {
      console.log(error.message);
      if (error instanceof mongoose.CastError)
        return next(createError(400, "Invalid Product Id"));
      next(error);
    }
  },
  get: async (req, res, next) => {
    try {
      const nameSpace = getNamespace("unique context");
      const Landing = nameSpace.get("connection").model(modelName, schema);
      const results = await LandingService.get(Landing)
      res.send(results);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  }
};

