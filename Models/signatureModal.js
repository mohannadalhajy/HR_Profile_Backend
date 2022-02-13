
const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema({
  nodeId: {
    type: mongoose.Schema.Types.ObjectId
    },
  requestBy: {
    type: String,
  },
  requestTime: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  labId: {
    type: String,
  },
  comment: String,
});

module.exports = signatureSchema;