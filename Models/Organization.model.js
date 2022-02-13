const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrganizationSchema = new Schema({
    jobTitle: {
        type:String
    },
    department: {
        type:String
    },
    company: {
        type:String
    }
});

//const Organization = mongoose.model('organization', OrganizationSchema);
//module.exports = Organization;
module.exports = OrganizationSchema;