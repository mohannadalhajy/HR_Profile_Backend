const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RelationshipSchema = new Schema({
    info: {
        type:String,
    },
    type: {
        type:String,
    }
});

//const Relationship = mongoose.model('relationship', RelationshipSchema);
//module.exports = Relationship;
module.exports = RelationshipSchema;