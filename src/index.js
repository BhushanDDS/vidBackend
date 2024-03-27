// Importing the 'dotenv' module to load environment variables from a .env file
import dotenv from "dotenv";

// Importing the 'connectDB' function from the 'db/index.js' file
import connectDB from "./db/index.js";

// Loading environment variables from the .env file
dotenv.config({
    path: './env' // Assuming the .env file is located in the 'env' directory
});

// Calling the 'connectDB' function to connect to the MongoDB database
connectDB()
    .then(() => {
        // Starting the server and listening on the specified port or default port 8000
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running`);
        });
    })
    .catch((err) => {
        // Logging an error message if MongoDB connection fails
        console.log("MDB Connection failed", err);
    });