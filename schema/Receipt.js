const mongoose = require("mongoose");

const ReceiptSchema = new mongoose.Schema({
  orderId:{ type: String, required: true },
  receiptName: { type: String, required: true },
  emailId: { type: String, required: true },
  mobileNo: { type: String, required: true },
  room: { type: String, required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  table_number: { type: String, required: true },
  table_id: { type: mongoose.Schema.Types.ObjectId, ref: "Table", required: true },
  date: { type: Date, required: true },
  bookingDate: { type: Date, required: true },
  time: { type: String, required: true },
  bookingSlot: { type: String, required: true },
  price: { type: Number, required: true },
  type: { type: String, required: true },
  sub_type: { type: String, required: true },
  orderStatus: { type: String, required: true }, // Get order status code
  paymentSuccess: { type: Boolean, required: true },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Receipt", ReceiptSchema);
