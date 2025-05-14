const PartySchema = require("../schema/Party");

const AddPartyBooking = async (req, res) => {
  try {
    // Create a new instance of the Event model with the request body
    const newPartyBooking = new PartySchema(req.body);
    // Save the event to the database
    const savedPartyBooking = await newPartyBooking.save();
    // Respond with the ID of the newly created event
    res.status(201).json({ StatusCode: 201, data: savedPartyBooking._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding Party Booking", error });
  }
};

const UpdatePartyBooking = async (req, res) => {
  try {
    const partyId = req.params.partyId;
    // Check if partyId is provided
    if (!partyId) {
      return res.status(400).json({ message: "partyId is required" });
    }
    // Prepare the data for updating
    const updatePartyBooking = { ...req.body };
    // Update the event with the new data from the request body
    const updatedPartyBooking = await PartySchema.findOneAndUpdate(
      { _id: partyId }, // Query to find the event by ID
      updatePartyBooking
    );
    // If the event is not found, return a 404 response
    if (!updatedPartyBooking) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Party Booking not found" });
    }
    // Respond with the updated event data
    res.status(200).json({ StatusCode: 200, data: updatedPartyBooking });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating Party Booking", error });
  }
};

const GetPartyBookingList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || -1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { party_Name: { $regex: searchKey, $options: "i" } }
      : {};
    const totalPartyBookings = await PartySchema.countDocuments(query);

    const partyBookings = await PartySchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: partyBookings,
      pageData: {
        total: totalPartyBookings,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving partyBookings:", error);

    // Respond with a detailed error message
    res.status(500).json({
      message: "Error retrieving partyBookings",
      error: error.message || "Unknown error",
    });
  }
};

const DeletePartyBooking = async (req, res) => {
  try {
    const partyId = req.params.partyId; // Accessing the query parameter from the URL
    if (!partyId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "partyId is required" });
    }

    // Attempt to delete the event by its ID
    const deletedPartyBooking = await PartySchema.findByIdAndDelete(partyId);

    if (!deletedPartyBooking) {
      // If no event was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Party Booking not found" });
    }

    // Respond with success if the Party Booking was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Party Booking deleted successfully",
      data: deletedPartyBooking,
    });
  } catch (error) {
    // Log and respond with any errors
    console.error("Error deleting Party Booking:", error);
    res.status(500).json({
      StatusCode: 500,
      message: "Error deleting Party Booking",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  AddPartyBooking,
  UpdatePartyBooking,
  GetPartyBookingList,
  DeletePartyBooking,
};