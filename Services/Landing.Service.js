const createError = require("http-errors");
const { ErrorResponse, SuccessResponse } = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
//const Landing = require("../Models/Landing.model");
const createFirst = async (json, Landing) => {
    const landing = new Landing({ json });
    await landing.save()
}
module.exports = {
    create: async (json, Landing) => {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    await createFirst(json, Landing)
                    resolve(new SuccessResponse(true, {}));
                } catch (error) {
                    reject(error);
                }
            })();
        });
    },
    get: async (Landing) => {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    let firstLanding = {"blocks": [
                        {
                          "_template": "Button"
                        }]}
                    const landing = await Landing.find({})
                    if (landing.length === 0) await createFirst(firstLanding, Landing)
                    else firstLanding = landing[0]
                    resolve(firstLanding);
                } catch (error) {
                    reject(error);
                }
            })();
        });
    }
}