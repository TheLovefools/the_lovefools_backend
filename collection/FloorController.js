const FloorSchema = require('../schema/Floor');

const AddFloorData = async (req, res) => {
  try {
    const newFloor = new FloorSchema(req.body);

    // Save the event to the database
    const savedFloor = await newFloor.save();

    // Respond with the ID of the newly created event
    res.status(201).json({ StatusCode: 201, data: savedFloor });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding event", error });
  }
};

const UpdateFloorData = async (req, res) => {
  try {
    const floorId = req.params.floorId;

    if (!floorId) {
      return res.status(400).json({ message: "Floor ID is required" });
    }

    // Update the event with the new data from the request body
    const updatedFloor = await FloorSchema.findOneAndUpdate(
      { _id: floorId }, // Query to find the event by ID
      req.body
    );

    // If the event is not found, return a 404 response
    if (!updatedFloor) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Floor not found" });
    }

    // Respond with the updated event data
    res.status(200).json({ StatusCode: 200,message: "Floor updated successfully" });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating event", error });
  }
};

const GetFloorList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { floor_name: { $regex: searchKey, $options: "i" } }
      : {};
    const totalFloor = await FloorSchema.countDocuments(query);

    const events = await FloorSchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: events,
      pageData: {
        total: totalFloor,
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

const DeleteFloor = async (req, res) => {
  try {
    const floorId = req.params.floorId; // Accessing the query parameter from the URL

    if (!floorId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Floor ID is required" });
    }

    // Attempt to delete the event by its ID
    const deletedFloor = await FloorSchema.findByIdAndDelete(
      {_id:floorId}
    );

    if (!deletedFloor) {
      // If no event was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Floor not found" });
    }

    // Respond with success if the event was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Floor deleted successfully",
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
  AddFloorData,
  UpdateFloorData,
  GetFloorList,
  DeleteFloor,
};
