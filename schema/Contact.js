const mongoose = require("mongoose");

const ContactSchema = new mongoose.Schema({
  mobile_number: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Contact", ContactSchema);
