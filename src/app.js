// Importing necessary modules for creating an Express app
import express from "express";
import cors from "cors"; // Middleware for enabling Cross-Origin Resource Sharing (CORS)
import cookieParser from "cookie-parser"; // Middleware for parsing cookies


// Creating an instance of the Express application
const app = express();

// Middleware for enabling CORS with specified options
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Allowing requests from specified origin (taken from environment variable)
    credentials: true // Allowing credentials (e.g., cookies, authorization headers) to be sent with requests
}));

// Middleware for parsing JSON request bodies with a size limit of 16kb
app.use(express.json({ limit: "16kb" }));

// Middleware for parsing URL-encoded request bodies with extended mode and a size limit of 16kb
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Middleware for serving static files from the "public" directory
app.use(express.static("public"));

// Middleware for parsing cookies from incoming requests
app.use(cookieParser());





//routes import 
import userRouter from './routes/user.routes.js'




//routes declaration 
app.use("/api/v1/users", userRouter)







// Exporting the Express application instance
export { app };