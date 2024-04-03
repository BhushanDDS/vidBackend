import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/viedo.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
        //TODO: get all videos based on query, sort, pagination


})

const publishAVideo = asyncHandler(async(req, res) => {

    //get title and description-->req.body 
    //validate it
    //check for vdo , thumbnail
    //upload files
    //check for them again
    //get and store duration
    //set the owner 
    //validate the owner 
    //create enter .create
    //validate created object 
    //return response


    const { title, description } = req.body
        // TODO: get video, upload to cloudinary, create video

    if (!title && !description) {
        throw new ApiError(400, "Title and Description are Required")
    }

    //    const vdoLocalPath = req.files ? .videoFile ? .[0].path;

    //const vdoLocalPath = req.files.videoFile[0].path

    const vdoLocalPath = req.files && req.files.videoFile && req.files.videoFile.length > 0 ? req.files.videoFile[0].path : undefined;
    const thumbnailLocalPath = req.files && req.files.thumbnail && req.files.thumbnail.length > 0 ? req.files.thumbnail[0].path : undefined;


    if (!vdoLocalPath) {
        throw new ApiError(400, "Vdo is required")
    }
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")

    }

    const videoFile = await uploadOnCloudinary(vdoLocalPath)
    const thumbNail = await uploadOnCloudinary(thumbnailLocalPath)


    if (!videoFile) {
        throw new ApiError(400, "Vdo is required")
    }
    if (!thumbNail) {
        throw new ApiError(400, "Thumbnail is required")

    }

    const duration = videoFile.width
    const views = 0;
    const ownerd = await User.findById(req.user._id)
    const owner = ownerd[0]

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbNail: thumbNail.url,
        title,
        description,
        duration,
        views,
        isPublished: true,
        owner

    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "done!!")
        )







})

const getVideoById = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    console.log(videoId);

    //TODO: get video by id
    const vdo = await Video.findById(videoId)

    console.log(vdo);
    return res
        .status(200)
        .json(
            new ApiResponse(200, vdo, "Information fetched succesfully")
        )

})

const updateVideo = asyncHandler(async(req, res) => {
    //get values to be updated ->thumbnail
    //validate
    //use $set
    //return response 

    //TODO: update video details like title, description, thumbnail

    const { videoId } = req.params
    const vdo = await Video.findById(videoId)
    if (!vdo) {

        throw new ApiError(400, "Video not availible")
    }
    //const localPath = await vdo.thumbNail

    const newThumbnail = req.file.path
    console.log("here");

    if (!newThumbnail) {
        throw new ApiError(400, "No file has been updated , postman problem")
    }

    console.log(newThumbnail);

    const thumbnail = await uploadOnCloudinary(newThumbnail)
    if (!newThumbnail) {
        throw new ApiError(400, "File not uploaded, cloudinar issue")
    }

    const newFile = await Video.findByIdAndUpdate(
        videoId, {
            $set: { thumbNail: thumbnail.url }
        }, {
            new: true
        }
    )

    return res
        .status(200)
        .json(
            new ApiResponse(200, newFile, "File Updated Succesfully")
        )
})

const deleteVideo = asyncHandler(async(req, res) => {
    const { videoId } = req.params
        //TODO: delete video
})

const togglePublishStatus = asyncHandler(async(req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}