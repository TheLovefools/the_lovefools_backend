const mongoose = require("mongoose");

const PartySchema = new mongoose.Schema({
  party_Name: { type: String, required: true },
  party_Date: { type: Date, required: true },
  party_Mobile: { type: String, required: true },
  party_Description: { type: String, required: true },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Partybookings", PartySchema);