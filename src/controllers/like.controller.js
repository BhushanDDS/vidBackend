 import { mongoose } from "mongoose"
 import { Like } from "../models/like.models.js"
 import { ApiError } from "../utils/ApiError.js"
 import { ApiResponse } from "../utils/ApiResponse.js"
 import { asyncHandler } from "../utils/asyncHandler.js"


 const toggleVideoLike = asyncHandler(async(req, res) => {

     const { videoId } = req.params
         //TODO: toggle like on video
     if (!videoId) {
         throw new ApiError(400, "VideoId needed")
     }

     const user = req.user._id;
     console.log(user);
     if (!user) {
         throw new ApiError(400, "user id requierd")
     }
     //new method unlocked -> findOne // does not require Id to search 
     const likedOrNot = await Like.findOne({
         video: videoId,
         likedBy: user
     })
     console.log(likedOrNot);
     if (likedOrNot) {
         await Like.deleteOne({ _id: likedOrNot._id })
         console.log("disliked");
     } else {
         let likeCreated = await Like.create({
             video: videoId,
             likedBy: user
         })

         if (!likeCreated) {
             throw new ApiError(400, "error occured while registering the like")
         } else {
             console.log("liked");
         }


     }
     return res
         .status(200)
         .json(
             new ApiResponse(200, {}, "operstion succesfull")
         )





 })

 const toggleCommentLike = asyncHandler(async(req, res) => {
     const { commentId } = req.params
         //TODO: toggle like on comment
     const { videoId } = req.params
         //TODO: toggle like on video
     if (!commentId) {
         throw new ApiError(400, "commentId needed")
     }

     const user = req.user._id;
     console.log(user);
     if (!user) {
         throw new ApiError(400, "user id requierd")
     }
     //new method unlocked -> findOne // does not require Id to search 
     const likedOrNot = await Like.findOne({
         comment: commentId,
         likedBy: user
     })
     console.log(likedOrNot);
     if (likedOrNot) {
         await Like.deleteOne({ _id: likedOrNot._id })
         console.log("disliked");
     } else {
         let likeCreated = await Like.create({
             comment: commentId,
             likedBy: user
         })

         if (!likeCreated) {
             throw new ApiError(400, "error occured while registering the like")
         } else {
             console.log("liked");
         }


     }
     return res
         .status(200)
         .json(
             new ApiResponse(200, {}, "operstion succesfull")
         )



 })

 const toggleTweetLike = asyncHandler(async(req, res) => {
     const { tweetId } = req.params
         //TODO: toggle like on tweet

     if (!tweetId) {
         throw new ApiError(400, "tweetId needed")
     }

     const user = req.user._id;
     console.log(user);
     if (!user) {
         throw new ApiError(400, "user id requierd")
     }
     //new method unlocked -> findOne // does not require Id to search 
     const likedOrNot = await Like.findOne({
         tweet: tweetId,
         likedBy: user
     })
     console.log(likedOrNot);
     if (likedOrNot) {
         await Like.deleteOne({ _id: likedOrNot._id })
         console.log("disliked");
     } else {
         let likeCreated = await Like.create({
             tweet: tweetId,
             likedBy: user
         })

         if (!likeCreated) {
             throw new ApiError(400, "error occured while registering the like")
         } else {
             console.log("liked");
         }


     }
     return res
         .status(200)
         .json(
             new ApiResponse(200, {}, "operstion succesfull")
         )
 })

 const getLikedVideos = asyncHandler(async(req, res) => {
     //TODO: get all liked videos
     if (!req.user || !req.user._id) {
         return res.status(401).json({ message: "User not authenticated" });
     }

     const { userId } = req.body

     console.log(userId);
     const liekedVdo = await Like.aggregate([{
         $match: {
             likedBy: new mongoose.Types.ObjectId(userId)
         }
     }])
     console.log(liekedVdo);

     if (!liekedVdo || liekedVdo.length === 0) {
         console.log("no likes");
     }

     return res.status(200)
         .json(liekedVdo)

 })


 export {
     toggleCommentLike,
     toggleTweetLike,
     toggleVideoLike,
     getLikedVideos
 }