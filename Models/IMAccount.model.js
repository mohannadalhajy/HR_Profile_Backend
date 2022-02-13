const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IMAccountSchema = new Schema({
    info: {
        type:String,
    },
    type: {
        type:String,
    }
});

//const IMAccount = mongoose.model('IMAccount', IMAccountSchema);
//module.exports = IMAccount;
module.exports = IMAccountSchema;