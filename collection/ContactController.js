const ContactSchema = require("../schema/Contact");

const AddContactData = async (req, res) => {
  try {
    // Create a new instance of the Contact model with the request body
    const newContact = new ContactSchema(req.body);

    // Save the event to the database
    const savedContact = await newContact.save();

    // Respond with the ID of the newly created event
    res.status(201).json({ StatusCode: 201, data: savedContact._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding event", error });
  }
};

const UpdateContactData = async (req, res) => {
  try {
    const contact_number = req.params.contact_number;

    // Check if contact_number is provided
    if (!contact_number) {
      return res.status(400).json({ message: "Contact ID is required" });
    }

    // Update the event with the new data from the request body
    const updatedContact = await ContactSchema.findOneAndUpdate(
      { _id: contact_number }, // Query to find the event by ID
      req.body
    );

    // If the event is not found, return a 404 response
    if (!updatedContact) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Contact not found" });
    }

    // Respond with the updated event data
    res.status(200).json({ StatusCode: 200, data: updatedContact });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating event", error });
  }
};

const GetContactList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { mobile_number: { $regex: searchKey, $options: "i" } }
      : {};
    const totalContact = await ContactSchema.countDocuments(query);

    const events = await ContactSchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: events,
      pageData: {
        total: totalContact,
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

const DeleteContact = async (req, res) => {
  try {
    const contact_number = req.params.contact_number; // Accessing the query parameter from the URL

    if (!contact_number) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Contact ID is required" });
    }

    // Attempt to delete the event by its ID
    const deletedContact = await ContactSchema.findByIdAndDelete(
      contact_number
    );

    if (!deletedContact) {
      // If no event was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Contact not found" });
    }

    // Respond with success if the event was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Contact deleted successfully",
      data: deletedContact,
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
  AddContactData,
  UpdateContactData,
  GetContactList,
  DeleteContact,
};
