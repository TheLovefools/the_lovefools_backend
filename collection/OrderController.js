const OrderSchema = require("../schema/OrderSchema");

const AddOrderData = async (req, res) => {
  try {
    // Create a new instance of the Table model with the request body
    const newTable = new OrderSchema({
      seatCount: req.body.seatCount,
      date: req.body.date,
      payment: req.body.payment,
      type: req.body.type,
      time: req.body.time,
      status: "Pending",
    });

    // Save the receipt to the database
    const savedTable = await newTable.save();

    // Respond with the ID of the newly created receipt
    res.status(201).json({ StatusCode: 201, data: savedTable._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding receipt", esrror });
  }
};

const changeStatusOrder = async (req, res) => {
  try {
    const OrderId = req.params.OrderId;

    // Check if OrderId is provided
    if (!OrderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    // Update only the status field of the document
    const updatedOrder = await OrderSchema.findOneAndUpdate(
      { _id: OrderId }, // Query to find the document by ID
      { status: req.body.status }, // Update only the status field
      { new: true } // Return the updated document
    );

    // If the document is not found, return a 404 response
    if (!updatedOrder) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Order not found" });
    }

    // Respond with the updated document data
    res.status(200).json({ StatusCode: 200, data: updatedOrder });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating status", error });
  }
};
const GetOrderList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { customer_name: { $regex: searchKey, $options: "i" } }
      : {};
    const totalOrder = await OrderSchema.countDocuments(query);

    const events = await OrderSchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: events,
      pageData: {
        total: totalOrder,
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
module.exports = { AddOrderData, changeStatusOrder, GetOrderList };
