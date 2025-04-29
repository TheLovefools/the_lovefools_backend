const mongoose = require("mongoose");

const EnquiryOptionSchema = new mongoose.Schema({
  label: {type: String, required: true},
  value: {type: String, required: true}
}, { _id: false }); 
// optional: disables its own _id since it's embedded

const EventEnquirySchema = new mongoose.Schema({
  event_Name: { type: String},
  event_Description: { type: String, required: true },
  event_Date: { type: Date, required: true }, // Consider changing to Number if appropriate
  event_Time: { type: String, required: true },
  event_Type: { type: String, required: true },
  event_Created_Date: { type: Date, default: Date.now }, // Correct type and set default value
  event_Mobile: {type: String, required: false, match: [/^\d{10}$/, 'Mobile number must be 10 digits']},
  event_Email: {type: String, required: false, match: [/.+\@.+\..+/, 'Please fill a valid email address']},
  // event_Enquiry_Option: {type: EnquiryOptionSchema, required: false},
  event_Enquiry_Option: { type: String, required: true },
}, {
  timestamps: true // optional: adds createdAt and updatedAt
});

// Export the model correctly
module.exports = mongoose.model("EventEnquiry", EventEnquirySchema);
