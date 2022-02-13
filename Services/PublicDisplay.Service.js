const createError = require("http-errors");
const { ErrorResponse, SuccessResponse } = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
//const PublicDisplay = require("../Models/PublicDisplay.model");

module.exports = {
  create: async (requestBody, PublicDisplay) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const tempName = await PublicDisplay.find({ name: requestBody.name });
          if (tempName.length !== 0) {
            throw createError.NotFound({
              array_error: [
                new ErrorResponse("PublicDisplay", "name", "name is exist already"),
              ],
              code: SERVER_ERRORS.PUBLIC_DISPLAY_EXIST,
            })
            ;
          }
          let publicDisplay = new PublicDisplay()
          publicDisplay.name = requestBody.name;
          if (requestBody.display !== undefined)
            publicDisplay.display = requestBody.display;
          await publicDisplay.save();

          resolve(new SuccessResponse(true, {}));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  init: async (PublicDisplay) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          await PublicDisplay.remove({})
          await module.exports.create({ name: "email" },PublicDisplay)
          await module.exports.create({ name: "image" },PublicDisplay)
          await module.exports.create({ name: "organization" },PublicDisplay)
          await module.exports.create({ name: "phone" },PublicDisplay)
          await module.exports.create({ name: "address" },PublicDisplay)
          await module.exports.create({ name: "IMAccount" },PublicDisplay)
          await module.exports.create({ name: "website" },PublicDisplay)
          await module.exports.create({ name: "event" },PublicDisplay)
          await module.exports.create({ name: "relationship" },PublicDisplay)
          await module.exports.create({ name: "SIP" },PublicDisplay)
          await module.exports.create({ name: "notes" },PublicDisplay)
          resolve(new SuccessResponse(true, {}));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  update: async (requestBody, id, PublicDisplay) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const tempName = await PublicDisplay.find({ name: requestBody.name });
          if (tempName.length !== 0) {
            throw createError.NotFound({
              array_error: [
                new ErrorResponse("PublicDisplay", "name", "name is exist already"),
              ],
              code: SERVER_ERRORS.PUBLIC_DISPLAY_EXIST,
            })
            ;
          }
          result = await PublicDisplay.findByIdAndUpdate(id, { name: requestBody.name, display: requestBody.display }, { new: true })

          resolve(new SuccessResponse(true, { result }));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },

  getDisplayByName: async (name, PublicDisplay) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const publicDisplay = await PublicDisplay.find({ name: name });
          resolve(publicDisplay[0].display);
        } catch (error) {
          reject(error);
        }
      })();
    });
  },

  updateDisplay: async (display, id, PublicDisplay) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          await PublicDisplay.findByIdAndUpdate(id, { display: display }, { new: true })
          resolve(new SuccessResponse(true, {}));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },

  updateAll: async (displays, PublicDisplay) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const promise = Promise.all(
            displays.map(display => {
              module.exports.updateDisplay(display.display, display._id, PublicDisplay)
            }))
          promise.then(res => resolve(new SuccessResponse(true, {})))
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  getAll: async (PublicDisplay) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          let result = await PublicDisplay.find({});
          if(result.length===0){
            await module.exports.init(PublicDisplay);
            result = await PublicDisplay.find({});
          }
          resolve(new SuccessResponse(true, result));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },

  delete: async (id, PublicDisplay) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const result = await PublicDisplay.findByIdAndDelete(id);
          if (!result) throw createError.NotFound(404, "Public Display does not exist.");
          resolve(new SuccessResponse(true, {}));
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
};
