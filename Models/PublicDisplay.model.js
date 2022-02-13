const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PublicDisplaySchema = new Schema({
    name: {
        type:String,
        required: true
    },
    display: {
        type: Boolean,
        default: false
    },
    
});

//const publicDisplay = mongoose.model('publicdisplay', PublicDisplaySchema);
//module.exports = publicDisplay;
module.exports = PublicDisplaySchema;