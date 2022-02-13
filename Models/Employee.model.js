const mongoose = require("mongoose");
const Field = require("./Field.model");
const Contact =require("./Contact.model")
const Phone =require("./Phone.model")
const Name =require("./Name.model")
const Organization =require("./Organization.model")
const Address =require("./Address.model");
const Website = require("./Website.model");
const SIP = require("./SIP.model");
const IMAccount = require("./IMAccount.model");
const Event = require("./Event.model");
const Relationship = require("./Relationship.model");
const Schema = mongoose.Schema;
const EmployeeSchema = new Schema({
  id: {
    type: Number
  },
  civilId: {
    type: Number
  },
  image: {
    type: String
  },
  qrcode: {
    type: String      
  },
  status: {
    type: String,
    required: true,
    default:"Active"
  },
  name: {
    type: Name,
    required: true,
  },
  phone: [{
    type:Phone,
  }],
  email: [{
    type:Contact,
  }],
  organization: {
    type: Organization, 
  },
  address: [{
    type:Address,
  }],
  IMAccount: [{
    type:Phone,
  }],
  website: [{
    type:Website,
  }],
  event: [{
    type:Event,
  }],
  relationship: [{
    type:Relationship,
  }],
  SIP: [{
    type:SIP,
  }],
  notes: {
    type:String,
  },
  fields: [
  {
    type: Field
  }],
  emailDisplay: {
    type: Boolean,
    required: true,
    default: false 
  },
  imageDisplay: {
    type: Boolean,
    required: true,
    default: false 
  },
  organizationDisplay: {
    type: Boolean,
    required: true,
    default: true 
  },
  phoneDisplay: {
    type: Boolean,
    required: true,
    default: false 
  },
  addressDisplay: {
    type: Boolean,
    required: true,
    default: false 
  },
  IMAccountDisplay: {
    type: Boolean,
    required: true,
    default: false 
  },
  websiteDisplay: {
    type: Boolean,
    required: true,
    default: false 
  },
  eventDisplay: {
    type: Boolean,
    required: true,
    default: false 
  },
  relationshipDisplay: {
    type: Boolean,
    required: true,
    default: false 
  },
  SIPDisplay: {
    type: Boolean,
    required: true,
    default: false 
  },
  notesDisplay: {
    type: Boolean,
    required: true,
    default: false 
  }
});

//const Employee = mongoose.model("employee", EmployeeSchema);
//module.exports = Employee;
module.exports = EmployeeSchema;
