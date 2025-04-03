const TestimonialSchema = require("../schema/Testimonial");

const AddTestimonialData = async (req, res) => {
  try {
    // Create a new instance of the Testimonial model with the request body
    const newTestimonial = new TestimonialSchema(req.body);

    // Save the event to the database
    const savedTestimonial = await newTestimonial.save();

    // Respond with the ID of the newly created event
    res.status(201).json({ StatusCode: 201, data: savedTestimonial._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding event", error });
  }
};

const UpdateTestimonialData = async (req, res) => {
  try {
    const testimonialId = req.params.testimonialId;

    // Check if testimonialId is provided
    if (!testimonialId) {
      return res.status(400).json({ message: "Testimonial ID is required" });
    }

    // Update the event with the new data from the request body
    const updatedTestimonial = await TestimonialSchema.findOneAndUpdate(
      { _id: testimonialId }, // Query to find the event by ID
      req.body
    );

    // If the event is not found, return a 404 response
    if (!updatedTestimonial) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Testimonial not found" });
    }

    // Respond with the updated event data
    res.status(200).json({ StatusCode: 200, data: updatedTestimonial });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating event", error });
  }
};

const GetTestimonialList = async (req, res) => {
  try {
    const sortBy = req.body.sortBy || "createdAt";
    const sortOrder = parseInt(req.body.sortOrder, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const page = parseInt(req.body.page, 10) || 1;
    const searchKey = req.body.search || "";

    const query = searchKey
      ? { testimonial_Name: { $regex: searchKey, $options: "i" } }
      : {};
    const totalTestimonial = await TestimonialSchema.countDocuments(query);

    const events = await TestimonialSchema.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      StatusCode: 200,
      data: events,
      pageData: {
        total: totalTestimonial,
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

const DeleteTestimonial = async (req, res) => {
  try {
    const testimonialId = req.params.testimonialId; // Accessing the query parameter from the URL

    if (!testimonialId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Testimonial ID is required" });
    }

    // Attempt to delete the event by its ID
    const deletedTestimonial = await TestimonialSchema.findByIdAndDelete(
      testimonialId
    );

    if (!deletedTestimonial) {
      // If no event was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Testimonial not found" });
    }

    // Respond with success if the event was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Testimonial deleted successfully",
      data: deletedTestimonial,
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
  AddTestimonialData,
  UpdateTestimonialData,
  GetTestimonialList,
  DeleteTestimonial,
};
