
const { getNamespace } = require("continuation-local-storage");

const { initAdminDbConnection } = require("./initAdminDbConnection");

const { initTenantDbConnection } = require("./initTenantDbConnection");

const tenantService = require("./tenantService");

let connectionMap;
let adminDbConnection;
let tenants;

/**
 * Create knex instance for all the tenants defined in common database and store in a map.
 **/
const connectAllDb = async () => {
  const ADMIN_DB_URI = `${process.env.MONGODB_URL}/${process.env.ADMIN_DB_NAME}`;
  adminDbConnection = initAdminDbConnection(ADMIN_DB_URI);
  console.log("connectAllDb adminDbConnection", adminDbConnection.name);
  try {
    tenants = await tenantService.getAllTenants(adminDbConnection);
    console.log("connectAllDb tenants", tenants);
  } catch (e) {
    console.log("connectAllDb error", e);
    return;
  }

  connectionMap = tenants
    .map(tenant => {
      return {
        [tenant._id]: initTenantDbConnection(`${process.env.MONGODB_URL}/${"qr_"+tenant.dbName}`)
      };
    })
    .reduce((prev, next) => {
      return Object.assign({}, prev, next);
    }, {});
};

/**
 * Get the connection information (knex instance) for the given tenant's slug.
 */
const getConnectionByTenant = tenantName => {
  console.log(`Getting connection for ${tenantName}`);
  console.log("connectionMap",connectionMap[tenantName])
  if (connectionMap) {
    return connectionMap[tenantName];
  }
};
const getTenantId = (name) => {
  for(var i=0;i<tenants.length;i++){
    if(tenants[i].name==name)return tenants[i]._id
  }
  return
}

/**
 * Get the admin db connection.
 */
const getAdminConnection = () => {
  if (adminDbConnection) {
    console.log("Getting adminDbConnection");
    return adminDbConnection;
  }
};

/**
 * Get the connection information (knex instance) for current context. Here we have used a
 * getNamespace from 'continuation-local-storage'. This will let us get / set any
 * information and binds the information to current request context.
 */
const getConnection = () => {
  const nameSpace = getNamespace("unique context");
  const conn = nameSpace.get("connection");

  if (!conn) {
    throw new Error("Connection is not set for any tenant database");
  }

  return conn;
};

module.exports = {
  connectAllDb,
  getAdminConnection,
  getConnection,
  getConnectionByTenant,
  getTenantId
};