const mongoose = require("mongoose");

const TestComponentSchema = new mongoose.Schema({
  //for now, name, description, color.
  //each must be an object.
  name: {
    type: String,
    required: true,
    //no need for unique.
  },
  description: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("TestComponent", TestComponentSchema);
