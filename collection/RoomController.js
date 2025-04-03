const RoomSchema = require("../schema/Room");

const AddRoomData = async (req, res) => {
  try {
    // Create a new instance of the Room model with the request body
    const newRoom = new RoomSchema(req.body);

    // Save the room to the database
    const savedRoom = await newRoom.save();

    // Respond with the ID of the newly created room
    res.status(201).json({ StatusCode: 201, data: savedRoom._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding room", error });
  }
};

const UpdateRoomData = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    // Check if roomId is provided
    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    // Update the room with the new data from the request body
    const updatedRoom = await RoomSchema.findOneAndUpdate(
      { _id: roomId }, // Query to find the room by ID
      req.body
    );

    // If the room is not found, return a 404 response
    if (!updatedRoom) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Room not found" });
    }

    // Respond with the updated room data
    res.status(200).json({ StatusCode: 200, data: updatedRoom });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating room", error });
  }
};

const GetRoomList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";
    // const floor_id = req.body.floor_id; // Assume `floor_id` is passed in the request body

    const query = {
      // ...(floor_id ? { floor_id: floor_id } : {}), // Filter by `floor_id` if provided
      ...(searchKey
        ? { room_name: { $regex: searchKey, $options: "i" } }
        : {}),
    };
    const totalRoom = await RoomSchema.countDocuments(query);

    const rooms = await RoomSchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: rooms,
      pageData: {
        total: totalRoom,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving rooms:", error);

    // Respond with a detailed error message
    res.status(500).json({
      message: "Error retrieving rooms",
      error: error.message || "Unknown error",
    });
  }
};

const DeleteRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId; // Accessing the query parameter from the URL

    if (!roomId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Room ID is required" });
    }

    // Attempt to delete the room by its ID
    const deletedRoom = await RoomSchema.findByIdAndDelete(roomId);

    if (!deletedRoom) {
      // If no room was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Room not found" });
    }

    // Respond with success if the room was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Room deleted successfully",
      data: deletedRoom,
    });
  } catch (error) {
    // Log and respond with any errors
    console.error("Error deleting room:", error);
    res.status(500).json({
      StatusCode: 500,
      message: "Error deleting room",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  AddRoomData,
  UpdateRoomData,
  GetRoomList,
  DeleteRoom,
};
