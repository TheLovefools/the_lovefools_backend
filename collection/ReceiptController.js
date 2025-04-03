const ReceiptSchema = require("../schema/Receipt");

const AddReceiptData = async (req, res) => {
  try {
    // Create a new instance of the Receipt model with the request body
    const newReceipt = new ReceiptSchema(req.body);

    // Save the receipt to the database
    const savedReceipt = await newReceipt.save();

    // Respond with the ID of the newly created receipt
    res.status(201).json({ StatusCode: 201, data: savedReceipt._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding receipt", error });
  }
};

const UpdateReceiptData = async (req, res) => {
  try {
    const receiptId = req.params.receiptId;

    // Check if receiptId is provided
    if (!receiptId) {
      return res.status(400).json({ message: "Receipt ID is required" });
    }

    // Update the receipt with the new data from the request body
    const updatedReceipt = await ReceiptSchema.findOneAndUpdate(
      { _id: receiptId }, // Query to find the receipt by ID
      req.body
    );

    // If the receipt is not found, return a 404 response
    if (!updatedReceipt) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Receipt not found" });
    }

    // Respond with the updated receipt data
    res.status(200).json({ StatusCode: 200, data: updatedReceipt });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating receipt", error });
  }
};

const GetReceiptsList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    // Fields allowed for searching
    const searchableFields = ["emailId", "receiptName", "menuName", "status"];

    // Create the query object for searching
    const query = {
      paymentSuccess: true, // Only get receipts where paymentSuccess is true
      ...(searchKey && {
        $or: searchableFields.map((field) => ({
          [field]: { $regex: searchKey, $options: "i" }, // Case-insensitive regex
        })),
      }),
    };

    const totalReceipts = await ReceiptSchema.countDocuments(query);

    const receipts = await ReceiptSchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: receipts,
      pageData: {
        total: totalReceipts,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error retrieving receipts:", error);
    res.status(500).json({
      message: "Error retrieving receipts",
      error: error.message || "Unknown error",
    });
  }
};


const DeleteReceipt = async (req, res) => {
  try {
    const receiptId = req.params.receiptId; // Accessing the query parameter from the URL

    if (!receiptId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Receipt ID is required" });
    }

    // Attempt to delete the receipt by its ID
    const deletedReceipt = await ReceiptSchema.findByIdAndDelete(receiptId);

    if (!deletedReceipt) {
      // If no receipt was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Receipt not found" });
    }

    // Respond with success if the receipt was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Receipt deleted successfully",
      data: deletedReceipt,
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
  AddReceiptData,
  UpdateReceiptData,
  GetReceiptsList,
  DeleteReceipt,
};
