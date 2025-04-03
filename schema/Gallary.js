const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({
  gallery_Name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String },
  photo: { type: String },
  video: { type: String },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Gallery", GallerySchema);
