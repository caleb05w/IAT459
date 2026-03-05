const mongoose = require("mongoose");

const componentSchema = new mongoose.Schema({
    node_id: { type: String, required: true, },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    last_updated: { type: String },
    user: { type: String, default: "Unknown" },
    thumbnail: { type: String, default: null },
    link: { type: String },
    public: { type: Boolean },
});

module.exports = mongoose.model("Component", componentSchema);