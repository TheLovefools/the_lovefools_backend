const mongoose = require("mongoose");

const FloorSchema = new mongoose.Schema({
  floor_name: { type: String, required: true },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Floor", FloorSchema);
