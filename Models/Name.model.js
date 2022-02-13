const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NameSchema = new Schema({
    prefix: {
        type:String,
    },
    first: {
        type:String,
        required: true
    },
    middle: {
        type: String,
    },
    last: {
        type:String,
        required: true,
    },
    suffix: {
        type: String,
    }
});

//const Name = mongoose.model('name', NameSchema);
//module.exports = Name;
module.exports = NameSchema;