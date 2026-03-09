const mongoose = require("mongoose")

const componentSchema = new mongoose.Schema({
  team: {type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true},
  node_id: {type: String, required: true},
  file_id: {type: String, required: true},
  name: {type: String, required: true},
  description: {type: String, default: ""},
  last_updated: {type: String},
  last_user: {type: String, default: "Unknown"},
  thumbnail: {type: String, default: null},
  link: {type: String},
  public: {type: Boolean},
})

module.exports = mongoose.model("Component", componentSchema)
