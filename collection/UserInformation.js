const UserInformationSchema = require("../schema/UserInformation");

const AddUserInformationData = async (req, res) => {
  try {
    // Create a new instance of the UserInformation model with the request body
    const newUserInformation = new UserInformationSchema(req.body);

    // Save the receipt to the database
    const savedUserInformation = await newUserInformation.save();

    // Respond with the ID of the newly created receipt
    res.status(201).json({ StatusCode: 201, data: savedUserInformation._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding receipt", error });
  }
};

const UpdateUserInformationData = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Check if userId is provided
    if (!userId) {
      return res
        .status(400)
        .json({ message: "UserInformation ID is required" });
    }

    // Update the receipt with the new data from the request body
    const updatedUserInformation = await UserInformationSchema.findOneAndUpdate(
      { _id: userId }, // Query to find the receipt by ID
      req.body
    );

    // If the receipt is not found, return a 404 response
    if (!updatedUserInformation) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "UserInformation not found" });
    }

    // Respond with the updated receipt data
    res.status(200).json({ StatusCode: 200, data: updatedUserInformation });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating receipt", error });
  }
};

const GetUserInformationList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { name: { $regex: searchKey, $options: "i" } }
      : {};
    const totalUserInformation = await UserInformationSchema.countDocuments(
      query
    );

    const receipts = await UserInformationSchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: receipts,
      pageData: {
        total: totalUserInformation,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error retrieving receipts:", error);

    // Respond with a detailed error message
    res.status(500).json({
      message: "Error retrieving receipts",
      error: error.message || "Unknown error",
    });
  }
};

const DeleteUserInformation = async (req, res) => {
  try {
    const userId = req.params.userId; // Accessing the query parameter from the URL

    if (!userId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "UserInformation ID is required" });
    }

    // Attempt to delete the receipt by its ID
    const deletedUserInformation =
      await UserInformationSchema.findByIdAndDelete(userId);

    if (!deletedUserInformation) {
      // If no receipt was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "UserInformation not found" });
    }

    // Respond with success if the receipt was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "UserInformation deleted successfully",
      data: deletedUserInformation,
    });
  } catch (error) {
    // Log and respond with any errors
    console.error("Error deleting receipt:", error);
    res.status(500).json({
      StatusCode: 500,
      message: "Error deleting receipt",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  AddUserInformationData,
  UpdateUserInformationData,
  GetUserInformationList,
  DeleteUserInformation,
};
