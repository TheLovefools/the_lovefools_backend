const MenuSchema = require("../schema/Menu");

const AddMenuData = async (req, res) => {
  try {
    // Create a new instance of the Event model with the request body
    const newMenu = new MenuSchema(req.body);

    // Save the event to the database
    const savedEvent = await newMenu.save();

    // Respond with the ID of the newly created event
    res.status(201).json({ StatusCode: 201, data: savedEvent._id });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error adding menu", error });
  }
};

const UpdateMenuData = async (req, res) => {
  try {
    const menuId = req.params.menuId;

    // Check if eventId is provided
    if (!menuId) {
      return res.status(400).json({ message: "Menu ID is required" });
    }

    // Update the event with the new data from the request body
    const updatedMenu = await MenuSchema.findOneAndUpdate(
      { _id: menuId }, // Query to find the event by ID
      req.body
    );

    // If the event is not found, return a 404 response
    if (!updatedMenu) {
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Menu not found" });
    }

    // Respond with the updated event data
    res.status(200).json({ StatusCode: 200, data: updatedMenu });
  } catch (error) {
    // Handle any errors during the process
    res.status(500).json({ message: "Error updating menu", error });
  }
};

const GetMenuList = async (req, res) => {
  try {
    // Extract request parameters with defaults
    const {
      sortBy = "createdAt",
      sortOrder = 1,
      limit = 10,
      page = 1,
      search = "",
      Sub_Menu_Type = "",
      Menu_Type = "",
    } = req.body;

    // Construct the query
    const query = {
      ...(search && {
        $or: [
          { subMenuType: { $regex: search, $options: "i" } },
          { menuType: { $regex: search, $options: "i" } },
          { menu_Name: { $regex: search, $options: "i" } },
        ],
      }),
      ...(Sub_Menu_Type && {
        subMenuType: { $regex: Sub_Menu_Type, $options: "i" },
      }),
      ...(Menu_Type && { menuType: { $regex: Menu_Type, $options: "i" } }),
    };

    // Count total documents matching the query
    const totalEvents = await MenuSchema.countDocuments(query);

    // Fetch paginated, sorted menu items
    const menu = await MenuSchema.find(query)
      .collation({ locale: "en", strength: 2 }) // Case-insensitive collation for sorting
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    // Respond with data and pagination details
    res.status(200).json({
      StatusCode: 200,
      data: menu,
      pageData: {
        total: totalEvents,
        page: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error("Error retrieving menu:", error);

    // Respond with error details
    res.status(500).json({
      message: "Error retrieving menu",
      error: error.message || "Unknown error",
    });
  }
};

const DeleteMenu = async (req, res) => {
  try {
    const menuId = req.params.menuId; // Accessing the query parameter from the URL

    if (!menuId) {
      return res
        .status(400)
        .json({ StatusCode: 400, message: "Menu ID is required" });
    }

    // Attempt to delete the event by its ID
    const deletedMenu = await MenuSchema.findByIdAndDelete(menuId);

    if (!deletedMenu) {
      // If no event was found, respond with a 404 status code
      return res
        .status(404)
        .json({ StatusCode: 404, message: "Menu not found" });
    }

    // Respond with success if the event was deleted
    res.status(200).json({
      StatusCode: 200,
      message: "Menu deleted successfully",
      data: deletedMenu,
    });
  } catch (error) {
    // Log and respond with any errors
    console.error("Error deleting menu:", error);
    res.status(500).json({
      StatusCode: 500,
      message: "Error deleting menu",
      error: error.message || "Unknown error",
    });
  }
};

module.exports = {
  AddMenuData,
  UpdateMenuData,
  GetMenuList,
  DeleteMenu,
};
