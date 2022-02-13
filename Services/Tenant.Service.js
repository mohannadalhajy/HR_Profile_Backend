const createError = require("http-errors");
const { ErrorResponse } = require("../Helpers/Response.Helper");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");
const makeRandomDBName = () => {
  var result = '';
  var characters = '0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
module.exports = {
  create: async (requestBody, tenant, model) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const tempTenant = await model.find({ name: requestBody.name });
          if (tempTenant.length !== 0) {
            reject(
              createError.NotFound({
                array_error: [
                  new ErrorResponse("body", "tenant", "tenant is exist already"),
                ],
                code: SERVER_ERRORS.TENANT_EXIST,
              })
            );
          }
          let dbName = ""
          while (true) {
            dbName = makeRandomDBName()
            const temp = await model.find({ dbName:dbName });
            if (temp.length === 0) break;
          }
          tenant.name = requestBody.name;
          tenant.dbName = dbName;
          resolve(tenant);
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
  update: async (requestBody, tenant, model) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const tempTenant = await model.find({ name: requestBody.name });
          if (!(tempTenant.length === 0||(requestBody.name===tempTenant[0].name))) {
            reject(
              createError.Conflict({
                array_error: [
                  new ErrorResponse("body", "tenant", "tenant name is exist already"),
                ],
                code: SERVER_ERRORS.TENANT_EXIST,
              })
            );
          }
          const tempTenant1 = await model.find({ dbName: requestBody.dbName });
          if (!(tempTenant1.length === 0||(requestBody.dbName===tempTenant1[0].dbName))) {
            reject(
              createError.Conflict({
                array_error: [
                  new ErrorResponse("body", "tenant", "tenant Database is exist already"),
                ],
                code: SERVER_ERRORS.TENANT_EXIST,
              })
            );
          }
          tenant.name = requestBody.name;
          tenant.dbName = requestBody.dbName;
          resolve(tenant);
        } catch (error) {
          reject(error);
        }
      })();
    });
  },

  getAll: async (model) => {
    return new Promise((resolve, reject) => {
      (async () => {
        try {
          const tenants = await model.find().lean();
          resolve(tenants);
        } catch (error) {
          reject(error);
        }
      })();
    });
  },
};
