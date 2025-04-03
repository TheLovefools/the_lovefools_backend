const mongoose = require("mongoose");
console.log(process.env.DATABASE_URL);
const dbConnection = () => {
  try {
    mongoose
      .connect(process.env.DATABASE_URL)
      .then(() => {
        console.log("connection successfully run");
      })
      .catch((error) => console.log("connection error", error));
  } catch (error) {
    console.log(error);
  }
};

dbConnection();
