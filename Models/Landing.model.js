const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LandingSchema = new Schema({
    json: Object,
    Background: String
});

//const Landing = mongoose.model('landing_page', LandingSchema);
//module.exports = Landing;
module.exports = LandingSchema;