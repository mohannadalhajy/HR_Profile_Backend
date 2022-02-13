const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SIPSchema = new Schema({
    info: {
        type:String
    }
});

//const SIP = mongoose.model('SIP', SIPSchema);
//module.exports = SIP;
module.exports = SIPSchema;