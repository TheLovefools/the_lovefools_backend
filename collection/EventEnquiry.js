const EventEnquirySchema = require("../schema/EventEnquiry");

const AddEventEnquiryData = async (req, res) => {
  try {
    // Create a new instance of the Event enquiry model with the request body
    const newEvent = new EventEnquirySchema(req.body);

    // Save the event enquiry to the database
    const savedEvent = await newEvent.save();

    // Respond with the ID of the newly created event enquiry
    res.status(201).json({ StatusCode: 201, data: savedEvent._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding event enquiry", error });
  }
};

const UpdateEventEnquiryData = async (req, res) => {
  try {
    const EventEnquiryID = req.params.EventEnquiryID;

    // Check if EventEnquiryID is provided
    if (!EventEnquiryID) {
      return res.status(400).json({ message: "Event enquiry ID is required" });
    }

    // Update the event enquiry with the new data from the request body
    const updatedEvent = await EventEnquirySchema.findOneAndUpdate(
      { _id: EventEnquiryID }, // Query to find the event enquiry by ID
      req.body
    );

    // If the event enquiry is not found, return a 404 response
    if (!updatedEvent) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Event enquiry not found" });
    }

    // Respond with the updated event enquiry data
    res.status(200).json({ StatusCode: 200, data: updatedEvent });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating event enquiry", error });
  }
};

const GetEventEnquiryList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { event_Name: { $regex: searchKey, $options: "i" } }
      : {};
    const totalEvents = await EventEnquirySchema.countDocuments(query);

    const events = await EventEnquirySchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: events,
      pageData: {
        total: totalEvents,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving events:", error);

    // Respond with a detailed error message
    res.status(500).json({
      message: "Error retrieving events",
      error: error.message || "Unknown error",
    });
  }
};

const DeleteEventEnquiry = async (req, res) => {
  try {
    const EventEnquiryID = req.params.EventEnquiryID; // Accessing the query parameter from the URL

    if (!EventEnquiryID) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Event enquiry ID is required" });
    }

    // Attempt to delete the event enquiry by its ID
    const deletedEvent = await EventEnquirySchema.findByIdAndDelete(
      EventEnquiryID
    );

    if (!deletedEvent) {
      // If no event enquiry was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Event enquiry not found" });
    }

    // Respond with success if the event enquiry was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Event enquiry deleted successfully",
      data: deletedEvent,
    });
  } catch (error) {
    // Log and respond with any errors
    console.error("Error deleting event enquiry:", error);
    res.status(500).json({
      StatusCode: 500,
      message: "Error deleting event enquiry",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  AddEventEnquiryData,
  UpdateEventEnquiryData,
  GetEventEnquiryList,
  DeleteEventEnquiry,
};
