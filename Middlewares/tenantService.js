const modelName = "Tenant"
const schema = require("../Models/Tenant.model")
const getAllTenants = async(DBConnection) => {
    //const tenantDb = getTenantDB("admin");
    const tenant = DBConnection.model(modelName,schema);
    const result = await tenant.find().lean();
    return result
}

module.exports = {
    getAllTenants
};