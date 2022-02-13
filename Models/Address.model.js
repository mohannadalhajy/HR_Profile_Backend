const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AddressSchema = new Schema({
    street: {
        type:String,
    },
    POBox: {
        type:String,
    },
    neighborhood: {
        type:String,
    },
    city: {
        type:String,
    },
    state: {
        type:String,
    },
    zipCode: {
        type:String,
    },
    country: {
        type:String,
    },
    type: {
        type:String,
        required: true
    }
});

//const Address = mongoose.model('address', AddressSchema);
//module.exports = Address;
module.exports = AddressSchema;