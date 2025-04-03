const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  customer_name: { type: String, required: true },
  seatCount: { type: String, required: true },
  date: { type: String, required: true },
  payment: { type: Number, required: true }, // Consider changing to Number if appropriate
  type: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("order", OrderSchema);
