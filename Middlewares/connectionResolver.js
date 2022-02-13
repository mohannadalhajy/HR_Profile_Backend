const { createNamespace } = require("continuation-local-storage");
const { ErrorResponse } = require("../Helpers/Response.Helper");
const createError = require("http-errors");

const {
  getConnectionByTenant,
  getAdminConnection,
  getTenantId
} = require("./connectionManager");
const SERVER_ERRORS = require("../Helpers/ServerErrors.Helper");

// Create a namespace for the application.
let nameSpace = createNamespace("unique context");
const superAdminRole = "superAdmin"

/**
 * Get the connection instance for the given tenant's name and set it to the current context.
 */
const resolveTenant = (req, res, next) => {
  let tenant
  if(req.params.tenant) tenant = req.params.tenant
  else if(req.payload && req.payload.admin.role === superAdminRole) return setAdminDb(req, res, next)
  else tenant = req.headers.tenant;
  if (!tenant) {
    throw createError.NotFound(
      {
        array_error: [
          new ErrorResponse(
            "resolve tenant",
            "tenant",
            `Please provide tenant's name to connect`
          ),
        ],
        code: SERVER_ERRORS.USER_IS_ALREADY_EXIST,
      }
    );
  }
  // Run the application in the defined namespace. It will contextualize every underlying function calls.
  nameSpace.run(() => {
    const tenantDbConnection = getConnectionByTenant(tenant);
    console.log(
      "resolveTenant tenantDbConnection",
      tenantDbConnection && tenantDbConnection.name
    );
    nameSpace.set("connection", tenantDbConnection);
    next();
  });
};

/**
 * Get the admin db connection instance and set it to the current context.
 */
const setAdminDb = (req, res, next) => {
      // Run the application in the defined namespace. It will contextualize every underlying function calls.
  nameSpace.run(() => {
      const adminDbConnection = getAdminConnection();
    console.log("setAdminDb adminDbConnection", adminDbConnection.name);
    nameSpace.set("connection", adminDbConnection);
    next();
  });
};
const resolveTenantFromLink = (req, res, next) => {
  const tenant = req.params.tenant;
  if (!tenant) {
    return res
      .status(500)
      .json({ error: `Please provide tenant's name to connect` });
  }
  // Run the application in the defined namespace. It will contextualize every underlying function calls.
  nameSpace.run(() => {
    const tenantDbConnection = getConnectionByTenant(tenant);
    console.log(
      "resolveTenant tenantDbConnection",
      tenantDbConnection && tenantDbConnection.name
    );
    nameSpace.set("connection", tenantDbConnection);
    next();
  });
};
const resolveLoginTenant = (tenantName) => {
  if (!tenantName) {
    return //{ error: `Please provide tenant's name to connect` };
  }
  // Run the application in the defined namespace. It will contextualize every underlying function calls.
  if(tenantName==="admin")
    return getAdminConnection()
  const tenantId = getTenantId(tenantName)
  const tenantDbConnection = getConnectionByTenant(tenantId);
  console.log(
    "resolveTenant tenantDbConnection",
    tenantDbConnection && tenantDbConnection.name
  );
  return tenantDbConnection
}


module.exports = { resolveTenant, setAdminDb, resolveLoginTenant, resolveTenantFromLink };