import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define the schema for the video
const videoSchema = new mongoose.Schema({
    // Video file field: stores the URL or path of the video file
    videoFile: {
        type: String,
        required: true
    },
    // Thumbnail field: stores the URL or path of the video thumbnail image
    thumbNail: {
        type: String,
        required: true
    },
    // Title field: stores the title of the video
    title: {
        type: String,
        required: true
    },
    // Description field: stores the description of the video
    description: {
        type: String,
        required: true
    },
    // Duration field: stores the duration of the video (assumed to be retrieved from cloudinary)
    duration: {
        type: Number,
        required: true
    },
    // Views field: stores the number of views of the video, defaults to 0
    views: {
        type: Number,
        required: true,
        default: 0
    },
    // isPublished field: indicates whether the video is published or not, defaults to true
    isPublished: {
        type: Boolean,
        default: true
    },
    // Owner field: stores the ObjectId of the user who owns the video
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User" // Reference to the User model
    }
}, { timestamps: true }); // Timestamps for createdAt and updatedAt fields

// Plugin for pagination using mongoose-aggregate-paginate-v2
videoSchema.plugin(mongooseAggregatePaginate);

// Create a Mongoose model based on the schema
export const Video = mongoose.model("Video", videoSchema);