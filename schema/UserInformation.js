const mongoose = require("mongoose");

const UserInformation = new mongoose.Schema({
  mobileNumber: { type: String },
  name: { type: String },
  emailId: { type: String },
  Address: { type: String },
  photo: { type: String },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("UserInformation", UserInformation);
