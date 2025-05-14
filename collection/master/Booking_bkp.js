const ReceiptSchema = require("../../schema/Receipt");
const TableSchema = require("../../schema/Table");

const GetRoomsList = async (req, res) => {
  try {
    const { date: searchDate, time: searchTime, room: roomID } = req.body;

    // Check if date and time are provided
    if (!searchDate || !searchTime) {
      return res.status(400).json({
        message: "Both date and time are required.",
      });
    }

    // Step 1: Find all receipts matching the provided date and time
    const bookedReceipts = await ReceiptSchema.find({
      date: searchDate,
      time: searchTime,
      paymentSuccess:true,
      room: req.body.roomID,
    });    
    // Step 2: Extract booked table numbers
    const bookedTableNumbers = bookedReceipts.map(
      (receipt) => receipt.table_number
    );

    // Step 3: Retrieve all tables
    const allTables = await TableSchema.find({
      room_id: req.body.roomID,
    });
    // Step 4: If no bookings exist, return all tables as available
    if (bookedTableNumbers.length === 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "No bookings found for the specified date and time.",
        available: allTables,
      });
    }

    // Step 5: Filter out booked tables
    const availableTables = allTables.filter(
      (table) =>
        !bookedTableNumbers.some(
          (bookedId) => bookedId.toString() === table._id.toString()
        )
    );

    // Step 6: Respond with the available tables
    return res.status(200).json({
      statusCode: 200,
      message: "Available tables retrieved successfully.",
      available: availableTables,
    });
  } catch (error) {
    // Log and respond with an error
    console.error("Error retrieving available rooms:", error);

    res.status(500).json({
      message: "Error retrieving available rooms",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  GetRoomsList,
};
