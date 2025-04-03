const mongoose = require("mongoose");

const MenuSchema = new mongoose.Schema({
  menu_Name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: String, required: true },
  menuType: { type: String, required: true },
  subMenuType: { type: String, required: true },
  photo: { type: String },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Menu", MenuSchema);
