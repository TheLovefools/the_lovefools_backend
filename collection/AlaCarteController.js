const AlaCarteMenuSchema = require("../schema/AlaCarte");

const AddAlaCarteData = async (req, res) => {
  try {
    // Create a new instance of the AlaCarteMenu model with the request body
    const newAlaCarteMenu = new AlaCarteMenuSchema(req.body);

    // Save the event to the database
    const savedAlaCarteMenu = await newAlaCarteMenu.save();

    // Respond with the ID of the newly created event
    res.status(201).json({ StatusCode: 201, data: savedAlaCarteMenu._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding AlaCarte Menu", error });
  }
};


const UpdateAlaCarteData = async (req, res) => {
  try {
    const alaMenuId = req.params.alaMenuId;

    // Check if alaMenuId is provided
    if (!alaMenuId) {
      return res.status(400).json({ message: "AlaCarteMenu ID is required" });
    }

    // Update the event with the new data from the request body
    const updatedAlaCarteMenu = await AlaCarteMenuSchema.findOneAndUpdate(
      { _id: alaMenuId }, // Query to find the event by ID
      req.body
    );

    // If the event is not found, return a 404 response
    if (!updatedAlaCarteMenu) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "AlaCarteMenu not found" });
    }

    // Respond with the updated event data
    res.status(200).json({ StatusCode: 200, data: updatedAlaCarteMenu });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating event", error });
  }
};

const GetAlaCarteMenuByUser = async (req, res) => {
  try {
    const events = await AlaCarteMenuSchema.find({})
    res.status(200).json({
      StatusCode: 200,
      data: events,      
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

const GetAlaCarteMenu = async (req, res) => {
  try {
    // const sortBy = req.body.sortBy || "createdAt";
    // const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    // const limit = parseInt(req.body.limit, 10) || 10;
    // const page = parseInt(req.body.page, 10) || 1;
    // const searchKey = req.body.search || "";

    const {
      sortBy = "createdAt",
      sortOrder = 1,
      limit = 10,
      page = 1,
      search = "",
    } = req.body;

    // const query = searchKey
    const query = search
      ? { ala_menu_Name: { $regex: search, $options: "i" } }
      : {};
    const totalAlaCarteMenu = await AlaCarteMenuSchema.countDocuments(query);

    const events = await AlaCarteMenuSchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: events,
      pageData: {
        total: totalAlaCarteMenu,
        page: page,
        limit: limit,
      },
    });

    console.error("GetAlaCarteMenu__s:", events);
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

const DeleteAlaCarteMenu = async (req, res) => {
  try {
    const alaMenuId = req.params.alaMenuId; // Accessing the query parameter from the URL

    if (!alaMenuId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "AlaCarteMenu ID is required" });
    }

    // Attempt to delete the event by its ID
    const deletedAlaCarteMenu = await AlaCarteMenuSchema.findByIdAndDelete(alaMenuId);

    if (!deletedAlaCarteMenu) {
      // If no event was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "AlaCarteMenu not found" });
    }

    // Respond with success if the event was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "AlaCarteMenu deleted successfully",
      data: deletedAlaCarteMenu,
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
  AddAlaCarteData,
  UpdateAlaCarteData,
  GetAlaCarteMenu,
  DeleteAlaCarteMenu,
  GetAlaCarteMenuByUser
};
