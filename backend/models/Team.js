const mongoose = require("mongoose")

const TeamSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},
    figmaID: {type: String, required: true, unique: true},
    owner: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    admins: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    contributors: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    components: [{type: mongoose.Schema.Types.ObjectId, ref: "Component"}],
  },
  {timestamps: true},
)

module.exports = mongoose.model("Team", TeamSchema)
