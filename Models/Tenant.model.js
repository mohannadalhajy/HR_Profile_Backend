const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tenantSchema = new Schema({ 
  name: {
    type: String,
    required: true,
    unique: true
  },
  dbName: {
    type: String,
    required: true,
    unique: true
  },
  dbHost: {
    type: String,
    required: true,
    default:process.env.DB_HOST
  },
  dbPort: {
    type: Number,
    required: true,
    default:process.env.DB_PORT
  },
  createdAt: {
    type: String
  }
});
//const Tenant = mongoose.model("tenants", tenantSchema);
//module.exports = Tenant;
module.exports = tenantSchema//mongoose.model('admins', userSchema);