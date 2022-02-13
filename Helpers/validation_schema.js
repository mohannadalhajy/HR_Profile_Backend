const Joi = require("@hapi/joi");

const authSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string(),
  last_name: Joi.string(),
  gender: Joi.string(),
  birthdate: Joi.date(),
  photo: Joi.string(),
  username: Joi.string(),
  phone: Joi.string(),
  isActive: Joi.string(),
  created_at: Joi.date(),
  expiryDate: Joi.date(),
  role: Joi.string(),
  tenant: Joi.string()
});



const EmployeeSchema = Joi.object({
  fname: Joi.string().min(2).max(20).required(),
  lname: Joi.string().min(2).max(20).required(),
  position: Joi.string().min(2).max(20).required(),
  status: Joi.string().required().valid('Active', 'Inactive'),
  image: Joi.string().required(),
  qrcode: Joi.string().allow('') 
});

module.exports = {
  EmployeeSchema,authSchema
};

