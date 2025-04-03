const mongoose = require("mongoose");

const EventEnquirySchema = new mongoose.Schema({
  event_Name: { type: String},
  description: { type: String, required: true },
  date: { type: Date, required: true }, // Consider changing to Number if appropriate
  time: { type: String, required: true },
  event_type: { type: String, required: true },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("EventEnquiry", EventEnquirySchema);
