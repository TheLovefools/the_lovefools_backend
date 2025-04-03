const mongoose = require("mongoose");

const TestimonialSchema = new mongoose.Schema({
  testimonial_Name: { type: String, required: true },
  description: { type: String, required: true },
  photo: { type: String },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Testimonial", TestimonialSchema);
