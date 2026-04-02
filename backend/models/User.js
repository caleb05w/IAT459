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
  figmaToken: {
    type: String,
    required: false,
  },
  fName: {
    type: String,
    required: false,
  },
  lName: {
    type: String,
    required: false,
  },
  bookmarked: [{type: mongoose.Schema.Types.ObjectId, ref: "Component"}],
})

module.exports = mongoose.model("User", UserSchema)
