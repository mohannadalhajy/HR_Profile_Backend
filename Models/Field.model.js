const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FieldSchema = new Schema({
    name: {
        type:String
    },
    info: {
        type:String
    },
    display: {
        type: Boolean,
        required: true,
        default: true 
    },
    type: {
        type:String,
        required: true,
        default:"text"
    },
    isRequired: {
        type: Boolean,
        required: true,
        default:true
    }
});

//const Field = mongoose.model('field', FieldSchema);
//module.exports = Field;
module.exports = FieldSchema;