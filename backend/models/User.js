const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // no two users can have the same name
  },
  password: {
    type: String,
    required: true,
  },
  fName: {
    type: String,
    required: false,
  },
  lName: {
    type: String,
    required: false,
  },
})

module.exports = mongoose.model("User", UserSchema)
