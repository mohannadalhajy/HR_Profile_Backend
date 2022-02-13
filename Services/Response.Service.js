const createError = require("http-errors");
const { ErrorResponse } = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
//const Response = require("../Models/Response.model");

module.exports = {
  createResponse: async (requestBody, response, Response) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const tempCode = await Response.find({ code: requestBody.code });
          if (tempCode.length!==0) {
            reject(
              createError.NotFound({
                array_error: [
                  new ErrorResponse("body", "code", "code is exist already"),
                ],
                code: SERVER_ERRORS.RESPONSE_EXIST,
              })
            );
          }

          response.code = requestBody.code;
          response.message = requestBody.message;
          response.address = requestBody.address;

          
          resolve(response);
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  updateResponse: async (requestBody, response) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          response.code = requestBody.code;
          response.message = requestBody.message;
          response.address = requestBody.address;
          resolve(response);
        } catch (error) {
          reject(error);
        }
      })();
    });
  },

  getAllResponses: async (Response) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const responses = await Response.find().lean();

          
          resolve(responses);
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
};
