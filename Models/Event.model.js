const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    info: {
        type:String,
    },
    type: {
        type:String,
    }
});

//const Event = mongoose.model('event', EventSchema);
//module.exports = Event;
module.exports = EventSchema;