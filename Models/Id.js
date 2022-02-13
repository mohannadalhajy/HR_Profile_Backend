const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const IdSchema = new Schema({
  content: {
    type: String,
    required: true,
  }
});

//const Id = mongoose.model("id", IdSchema);
//module.exports = Id;
module.exports = IdSchema;
