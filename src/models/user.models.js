import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
// Loading environment variables from the .env file
dotenv.config({
    path: './env' // Assuming the .env file is located in the 'env' directory
});

// Define the schema for the user
const userSchema = new mongoose.Schema({
    // Username field: unique, lowercase, trimmed, and indexed for efficient querying
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    // Email field: unique, lowercase, and trimmed
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    // Full name field: required and trimmed
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    // Avatar field: stores the URL of the user's avatar image (assumed to be from a cloud service)
    avatar: {
        type: String,
        required: true
    },
    // Cover image field: stores the URL of the user's cover image
    coverImage: {
        type: String
    },
    // Watch history field: stores an array of ObjectIds referencing video documents
    watchHistory: [{
        type: Schema.Types.ObjectId,
        ref: "Video"
    }],
    // Password field: required with custom error message and will be hashed before saving
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    // Refresh token field: stores the refresh token used for token refreshment
    refreshToken: {
        type: String
    }
}, { timestamps: true }); // Timestamps for createdAt and updatedAt fields

// Pre-save hook to hash the password before saving
userSchema.pre("save", async function(next) {
    if (!this.isModified("password")) {
        return next();
    }
    // Hashing the password with bcrypt
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to check if the provided password is correct
userSchema.methods.isPasswordCorrect = async function(password) {
    // Comparing the provided password with the hashed password
    return await bcrypt.compare(password, this.password);
};



// Method to generate an access token for the user
userSchema.methods.generateAccessToken = function() {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'default_access_secret';
    const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1h';

    // Generating JWT access token with user data and expiration
    return jwt.sign({ _id: this._id, email: this.email, username: this.username, fullname: this.fullname },
        ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
};

// const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'default_secret_key';
// const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '1h';

// // Method to generate an access token for the user
// userSchema.methods.generateAccessToken = function() {
//     // Generating JWT access token with user data and expiration
//     return jwt.sign({
//         _id: this._id,
//         email: this.email,
//         username: this.username,
//         fullname: this.fullname
//     }, process.env.ACCESS_TOKEN_SECRET, {
//         expiresIn: process.env.ACCESS_TOKEN_EXPIRY
//     });
// };

// Method to generate a refresh token for the user
// userSchema.methods.generateRefreshToken = function() {
//     // Generating JWT refresh token with user ID and expiration
//     return jwt.sign({
//         _id: this._id
//     }, process.env.REFRESH_TOKEN_SECRET, {
//         expiresIn: process.env.REFRESH_TOKEN_EXPIRY
//     });
// };


// Method to generate a refresh token for the user
userSchema.methods.generateRefreshToken = function() {
    const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'default_refresh_secret';
    const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

    // Generating JWT refresh token with user ID and expiration
    return jwt.sign({ _id: this._id }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRY
    });
};
// Create a Mongoose model based on the schema
export const User = mongoose.model("User", userSchema);