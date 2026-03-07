const mongoose = require("mongoose")

const TeamSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    figmaID: {type: String, required: true, unique: true},
    contributors: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    components: [{type: mongoose.Schema.Types.ObjectId, ref: "Component"}],
  },
  {timestamps: true},
)

module.exports = mongoose.model("Team", TeamSchema)
