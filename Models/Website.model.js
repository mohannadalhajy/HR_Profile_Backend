const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WebsiteSchema = new Schema({
    info: {
        type:String
    }
});

//const Website = mongoose.model('website', WebsiteSchema);
//module.exports = Website;
module.exports = WebsiteSchema;