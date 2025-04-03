const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
require("./dbconfig/dbConfig");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  cors({
    origin: "*", // replace with the frontend's URL
    methods: ["GET", "POST", "PUT", "DELETE"], // specify allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // specify allowed headers
  })
);

app.use(bodyParser.json());

// Import User routes
const userRoutes = require("./routes/Routes");
const CustomerRoutes = require("./routes/Routes");
app.use("/api/user", userRoutes);
app.use("/api/customer", CustomerRoutes);

app.listen(5000, '0.0.0.0', () => {
  console.log("This server is running on port 5000");
});
