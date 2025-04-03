const mongoose = require("mongoose");

const ReceiptSchema = new mongoose.Schema({
  orderId:{ type: String, required: true },
  receiptName: { type: String, required: true },
  emailId: { type: String, required: true },
  mobileNo: { type: String, required: true },
  // floor: { type: String, required: true },
  paymentSuccess: { type: Boolean, required: true },
  room: { type: String, required: true },
  table_number: { type: String, required: true },
  date: { type: Date, required: true }, // Consider changing to Number if appropriate
  time: { type: String, required: true },
  price: { type: Number, required: true }, // Consider changing to Number if appropriate
  type: { type: String, required: true },
  sub_type: { type: String, required: true },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Receipt", ReceiptSchema);
