const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PhoneSchema = new Schema({
    info: {
        type:String,
        required: true
    },
    type: {
        type:String,
        required: true
    },
    code: {
        type:String,
        required: true
    }
});

//const Phone = mongoose.model('phone', PhoneSchema);
//module.exports = Phone;
module.exports = PhoneSchema;