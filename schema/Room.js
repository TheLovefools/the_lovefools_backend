const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  room_name: { type: String, required: true },
  // floor_id: { type: String, required: true },
  created_date: { type: Date, default: Date.now }, // Correct type and set default value
});

// Export the model correctly
module.exports = mongoose.model("Room", RoomSchema);
