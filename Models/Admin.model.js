const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  gender: {
    type: String,
  },
  birthday: {
    type: Date,
  },
  photo: {
    type: String,
  },
  username: {
    type: String,
  },
  phone: {
    type: String,
  },
  isActive: {
    type: Boolean,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  expiryDate: {
    type: Date,
  },
  role: {
    type: String,
  },
  tenantId: {
    type: String
  },
});

userSchema.methods.hashedPassword = async function (password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hPassword = await bcrypt.hash(password, salt);
    return hPassword;
  } catch (error) {
    console.log("hashedPassword User Model catch");
    throw createError.Forbidden({
      array_error: [
        new ErrorResponse("User.Model", "body", "Error in hashed password"),
      ],
      code: ERROR_IN_HASH_PASSWORD,
    });
  }
};


userSchema.methods.isValidPassword = async function (password) {
  try {
    return await bcrypt.compare(password, this.password);
  } catch (error) {
    throw error;
  }
};

//const Admin = mongoose.model("admins", userSchema);
//module.exports = Admin;
module.exports = userSchema//mongoose.model('admins', userSchema);
