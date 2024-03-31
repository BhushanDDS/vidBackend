// Importing mongoose for MongoDB connection
import mongoose from "mongoose";

// Importing the database name from constants
import { DB_NAME } from "../constants.js";

// Function to connect to the MongoDB database
const connectDB = async() => {
    try {
        // Connecting to the MongoDB database using the provided URI and database name
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}${DB_NAME}`);

        // Logging a success message if the connection is successful
        console.log(`Mongo DB Connected!! DB HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        // Logging an error message if the connection fails
        console.log("Mongo DB connection failed", error);

        // Exiting the process with a non-zero exit code to indicate failure
        process.exit(1);
    }
}

// Exporting the connectDB function to be used elsewhere
export default connectDB;