const createError = require("http-errors");
const { SuccessResponse } = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
//const CountryCode = require("../Models/CountryCode.model");
const createFirst = async (code, CountryCode) => {
    const countryCode = new CountryCode({ code });
    await countryCode.save()
}
module.exports = {
    create: async (code, CountryCode) => {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    await createFirst(code, CountryCode)
                    resolve(new SuccessResponse(true, {}));
                } catch (error) {
                    reject(error);
                }
            })();
        });
    },
    get: async (CountryCode) => {
        return new Promise((resolve, reject) => {
            (async () => {
                try {
                    let code = "+963"
                    const countryCode = await CountryCode.find({})
                    if (countryCode.length === 0) await createFirst(code, CountryCode)
                    else code = countryCode[0].code

                    resolve(code);
                } catch (error) {
                    reject(error);
                }
            })();
        });
    }
}