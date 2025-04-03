const GallerySchema = require("../schema/Gallary");

const AddGalleryData = async (req, res) => {
  try {
    // Create a new instance of the Gallery model with the request body
    const newGallery = new GallerySchema(req.body);

    // Save the event to the database
    const savedGallery = await newGallery.save();

    // Respond with the ID of the newly created event
    res.status(201).json({ StatusCode: 201, data: savedGallery._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding event", error });
  }
};

const UpdateGalleryData = async (req, res) => {
  try {
    const galleryId = req.params.galleryId;

    // Check if galleryId is provided
    if (!galleryId) {
      return res.status(400).json({ message: "Gallery ID is required" });
    }

    // Update the event with the new data from the request body
    const updatedGallery = await GallerySchema.findOneAndUpdate(
      { _id: galleryId }, // Query to find the event by ID
      req.body
    );

    // If the event is not found, return a 404 response
    if (!updatedGallery) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Gallery not found" });
    }

    // Respond with the updated event data
    res.status(200).json({ StatusCode: 200, data: updatedGallery });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating event", error });
  }
};

const GetGalleryListByUser = async (req, res) => {
  try {
  

    const events = await GallerySchema.find({})

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


const GetGalleryList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { gallery_Name: { $regex: searchKey, $options: "i" } }
      : {};
    const totalGallery = await GallerySchema.countDocuments(query);

    const events = await GallerySchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: events,
      pageData: {
        total: totalGallery,
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

const DeleteGallery = async (req, res) => {
  try {
    const galleryId = req.params.galleryId; // Accessing the query parameter from the URL

    if (!galleryId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Gallery ID is required" });
    }

    // Attempt to delete the event by its ID
    const deletedGallery = await GallerySchema.findByIdAndDelete(galleryId);

    if (!deletedGallery) {
      // If no event was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Gallery not found" });
    }

    // Respond with success if the event was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Gallery deleted successfully",
      data: deletedGallery,
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
  AddGalleryData,
  UpdateGalleryData,
  GetGalleryList,
  DeleteGallery,
  GetGalleryListByUser
};
