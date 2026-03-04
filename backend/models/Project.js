const mongoose = require("mongoose")

const ProjectSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    team: {type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true},
    files: [{type: mongoose.Schema.Types.ObjectId, ref: "File"}],
  },
  {timestamps: true},
)

module.exports = mongoose.model("Project", ProjectSchema)
