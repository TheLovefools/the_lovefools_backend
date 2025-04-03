const CMSSchema = require("../schema/CMS");

const AddCMSData = async (req, res) => {
  try {
    // Create a new instance of the CMS model with the request body
    const newCMS = new CMSSchema(req.body);

    // Save the event to the database
    const savedCMS = await newCMS.save();

    // Respond with the ID of the newly created event
    res.status(201).json({ StatusCode: 201, data: savedCMS._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding event", error });
  }
};

const UpdateCMSData = async (req, res) => {
  try {
    const CMDId = req.params.CMDId;


    // Check if CMDId is provided
    if (!CMDId) {
      return res.status(400).json({ message: "CMS ID is required" });
    }

    // Update the event with the new data from the request body
    const updatedCMS = await CMSSchema.findOneAndUpdate(
      { _id: CMDId }, // Query to find the event by ID
      req.body
    );

    // If the event is not found, return a 404 response
    if (!updatedCMS) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "CMS not found" });
    }

    // Respond with the updated event data
    res.status(200).json({ StatusCode: 200, data: updatedCMS });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating event", error });
  }
};

const GetCMSList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { section_Name: { $regex: searchKey, $options: "i" } }
      : {};
    const totalCMS = await CMSSchema.countDocuments(query);

    const events = await CMSSchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: events,
      pageData: {
        total: totalCMS,
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

module.exports = {
  AddCMSData,
  UpdateCMSData,
  GetCMSList,
};
