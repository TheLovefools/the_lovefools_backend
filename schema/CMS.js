const mongoose = require("mongoose");

const CMSSchema = new mongoose.Schema({
  section_Name: { type: String },
  description: { type: String, required: true },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("CMS", CMSSchema);
