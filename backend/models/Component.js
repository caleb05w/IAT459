const mongoose = require("mongoose")

const componentSchema = new mongoose.Schema({
  team: {type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true},
  node_id: {type: String, required: true},
  file_id: {type: String, required: true},
  link: {type: String},
  public: {type: Boolean},
  last_user: {type: String, default: "Unknown"},
  inc_last_user: {type: String, default: "Unknown"},
  name: {type: String, required: true},
  hasUpdate: {type: Boolean, default: false},

  curr_description: {type: String, default: ""},
  inc_description: {type: String, default: ""},
  curr_last_updated: {type: String},
  inc_last_updated: {type: String},
  inc_thumbnail: {type: String, default: null},
  curr_thumbnail: {type: String, default: null},
})

module.exports = mongoose.model("Component", componentSchema)
