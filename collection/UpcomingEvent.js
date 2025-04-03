const UpcomingEventSchema = require("../schema/UpcommingEvent");

const AddUpcomingEventData = async (req, res) => {
  try {
    // Create a new instance of the UpcomingEvent model with the request body
    const newEvent = new UpcomingEventSchema(req.body);

    // Save the upcomingEvent to the database
    const savedEvent = await newEvent.save();

    // Respond with the ID of the newly created upcomingEvent
    res.status(201).json({ StatusCode: 201, data: savedEvent._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding upcomingEvent", error });
  }
};

const UpdateUpcomingEventData = async (req, res) => {
  try {
    const upcomingEventID = req.params.upcomingEventID;

    // Check if upcomingEventID is provided
    if (!upcomingEventID) {
      return res.status(400).json({ message: "UpcomingEvent ID is required" });
    }

    // Update the upcomingEvent with the new data from the request body
    const updatedEvent = await UpcomingEventSchema.findOneAndUpdate(
      { _id: upcomingEventID }, // Query to find the upcomingEvent by ID
      req.body
    );

    // If the upcomingEvent is not found, return a 404 response
    if (!updatedEvent) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "UpcomingEvent not found" });
    }

    // Respond with the updated upcomingEvent data
    res.status(200).json({ StatusCode: 200, data: updatedEvent });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating upcomingEvent", error });
  }
};

const GetUpcomingEventsList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { event_Name: { $regex: searchKey, $options: "i" } }
      : {};
    const totalEvents = await UpcomingEventSchema.countDocuments(query);

    const events = await UpcomingEventSchema.find(query)
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

const DeleteUpcomingEvent = async (req, res) => {
  try {
    const upcomingEventID = req.params.upcomingEventID; // Accessing the query parameter from the URL

    if (!upcomingEventID) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "UpcomingEvent ID is required" });
    }

    // Attempt to delete the upcomingEvent by its ID
    const deletedEvent = await UpcomingEventSchema.findByIdAndDelete(
      upcomingEventID
    );

    if (!deletedEvent) {
      // If no upcomingEvent was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "UpcomingEvent not found" });
    }

    // Respond with success if the upcomingEvent was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "UpcomingEvent deleted successfully",
      data: deletedEvent,
    });
  } catch (error) {
    // Log and respond with any errors
    console.error("Error deleting upcomingEvent:", error);
    res.status(500).json({
      StatusCode: 500,
      message: "Error deleting upcomingEvent",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  AddUpcomingEventData,
  UpdateUpcomingEventData,
  GetUpcomingEventsList,
  DeleteUpcomingEvent,
};
