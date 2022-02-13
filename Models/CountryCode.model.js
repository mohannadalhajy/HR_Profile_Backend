const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CountryCodeSchema = new Schema({
    code: {
        type:String,
        required:true
    }
});

//const CountryCode = mongoose.model('country_code', CountryCodeSchema);
//module.exports = CountryCode;
module.exports = CountryCodeSchema;