const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
    info: {
        type:String,
        required: true
    },
    type: {
        type:String,
        required: true
    }
});

//const Contact = mongoose.model('contact', ContactSchema);
//module.exports = Contact;
module.exports = ContactSchema;