const mongoose = require("mongoose");
const ReceiptSchema = require("../../schema/Receipt");
const TableSchema = require("../../schema/Table");

const GetRoomsList = async (req, res) => {
  try {
    const { bookingDate: searchDate, bookingSlot: searchSlot, roomID } = req.body;

    // Check if bookingDate and bookingSlot are provided
    if (!searchDate || !searchSlot || !roomID) {
      return res.status(400).json({
        message: "bookingDate, bookingSlot, and roomID are required.",
        bookingDate: searchDate,
        bookingSlot: searchSlot,
        roomID,
      });
    }

    // Step 1: Find all receipts matching date, slot, room, and payment status
    const bookedReceipts = await ReceiptSchema.find({
      bookingDate: new Date(searchDate),
      bookingSlot: searchSlot,
      paymentSuccess: true,
      room_id: new mongoose.Types.ObjectId(roomID),
    });

    // // Step 2: Extract booked table numbers
    // const bookedTableNumbers = bookedReceipts.map(
    //   (receipt) => receipt.table_number
    // );

    // Step 2: Extract booked table ObjectIds
    const bookedTableIds = bookedReceipts.map((receipt) => receipt.table_id?.toString());

    // Step 3: Retrieve all tables in the selected room
    const allTables = await TableSchema.find({ room_id: roomID });

    // // Step 4: If no bookings exist, return all tables as available
    // if (bookedTableNumbers.length === 0) {
    //   return res.status(200).json({
    //     statusCode: 200,
    //     searchDate: searchDate,
    //     searchSlot: searchSlot,
    //     roomId: req.body.roomID,
    //     room: req.body.room,
    //     bookedReceipts: bookedReceipts,
    //     message: "No bookings found for the specified date and time.",
    //     available: allTables,
    //   });
    // }

    // Step 4: If no bookings exist, return all tables
    if (bookedTableIds.length === 0) {
      return res.status(200).json({
        statusCode: 200,
        message: "No bookings found for the specified date and time.",
        searchDate,
        searchSlot,
        roomId: roomID,
        available: allTables,
      });
    }

    // Step 5: Filter out booked tables
    // const availableTables = allTables.filter(
    //   (table) =>
    //     !bookedTableNumbers.some(
    //       (bookedId) => bookedId.toString() === table._id.toString()
    //     )
    // );
    
    // Step 5: Filter out booked tables
    const availableTables = allTables.filter(
      (table) => !bookedTableIds.includes(table._id.toString())
    );

    // Step 6: Respond with the available tables
    return res.status(200).json({
      statusCode: 200,
      bookedTableIds: bookedTableIds,
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
