const mongoose = require("mongoose")

const TeamSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    owner: {type: String, required: true},
    contributors: [{type: String}],
    projects: [{type: mongoose.Schema.Types.ObjectId, ref: "Project"}],
  },
  {timestamps: true},
)

module.exports = mongoose.model("Team", TeamSchema)
