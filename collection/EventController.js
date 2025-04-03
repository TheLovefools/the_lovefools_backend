const EventSchema = require("../schema/Event");

const AddEventData = async (req, res) => {
  try {
    // Create a new instance of the Event model with the request body
    const newEvent = new EventSchema(req.body);

    // Save the event to the database
    const savedEvent = await newEvent.save();

    // Respond with the ID of the newly created event
    res.status(201).json({ StatusCode: 201, data: savedEvent._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding event", error });
  }
};

const UpdateEventData = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Check if eventId is provided
    if (!eventId) {
      return res.status(400).json({ message: "Event ID is required" });
    }

    // Update the event with the new data from the request body
    const updatedEvent = await EventSchema.findOneAndUpdate(
      { _id: eventId }, // Query to find the event by ID
      req.body
    );

    // If the event is not found, return a 404 response
    if (!updatedEvent) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Event not found" });
    }

    // Respond with the updated event data
    res.status(200).json({ StatusCode: 200, data: updatedEvent });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating event", error });
  }
};

const GetEventsList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { event_Name: { $regex: searchKey, $options: "i" } }
      : {};
    const totalEvents = await EventSchema.countDocuments(query);

    const events = await EventSchema.find(query)
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

const DeleteEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId; // Accessing the query parameter from the URL

    if (!eventId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Event ID is required" });
    }

    // Attempt to delete the event by its ID
    const deletedEvent = await EventSchema.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      // If no event was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Event not found" });
    }

    // Respond with success if the event was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Event deleted successfully",
      data: deletedEvent,
    });
  } catch (error) {
    // Log and respond with any errors
    console.error("Error deleting event:", error);
    res.status(500).json({
      StatusCode: 500,
      message: "Error deleting event",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  AddEventData,
  UpdateEventData,
  GetEventsList,
  DeleteEvent,
};
