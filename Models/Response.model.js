const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ResponseSchema = new Schema({
  code: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true
  }
});

//const Response = mongoose.model("response", ResponseSchema);
//module.exports = Response;
module.exports = ResponseSchema;
