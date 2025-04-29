const mongoose = require("mongoose");

const AlaCarteMenuSchema = new mongoose.Schema({
  ala_menu_Name: { type: String, required: true },
  ala_menu_Description: { type: String, required: true },
  photo: { type: String},
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("AlaCarte", AlaCarteMenuSchema);