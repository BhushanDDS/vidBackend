import mongoose from "mongoose"
import { Comment } from "../models/comment.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

//done
const getVideoComments = asyncHandler(async(req, res) => {
        //TODO: get all comments for a video
        const { videoId } = req.params
        const { page = 1, limit = 10 } = req.query

        if (!videoId) {
            throw new ApiError(400, "Videoid is required")
        }
        console.log("here");
        //set up aggrigate pipeline
        const pipeline = [{
                $match: {
                    video: new mongoose.Types.ObjectId(videoId)
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $project: {
                    owner: 1,
                    content: 1,
                    createdAt: 1
                }
            },
            {
                $lookup: {
                    from: 'users',
                    lovalfield: 'owner',
                    foreignField: '_id',
                    as: 'owner'
                }
            },
            {
                $unwind: '$owner'
            }
        ]

        const options = {
            page: parseInt(page),
            limit: parseInt(limit)
        }

        const { docs, totalDocs, totalPages } = await Comment.aggregatePaginate(pipeline, options);
        console.log("here");

        return res
            .status(200)
            .json(
                new ApiResponse(200, { comments: docs, totalDocs, totalPages }, "All Comments Fetched")
            )




    })
    //done
const addComment = asyncHandler(async(req, res) => {
        // TODO: add a comment to a video
        //gettig videoId from param
        //getting comment from form-data ->req.body
        //getting user from req.user ->assuming he is logged in 
        console.log("here");

        const { videoId } = req.params
        const { content } = req.body
        if (!videoId) {
            throw new ApiError(400, "Video Required too  add a comment ")
        }
        if (!content) {
            throw new ApiError(400, "Content Required ")

        }

        const comment = await Comment.create({
            content,
            video: videoId,
            owner: req.user._id

        })

        if (!comment) {
            throw new ApiError(401, "Comment not passed")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, {}, "comment added")
            )

    })
    //done
const updateComment = asyncHandler(async(req, res) => {
    // TODO: update a comment
    const { commentId } = req.params
    const { newData } = req.body
    console.log(newData);
    if (!newData) {
        throw new ApiError(400, "Data Required")
    }
    const newComment = await Comment.findByIdAndUpdate(
        commentId, {
            $set: {
                content: newData

            }
        }, { new: true }
    )


    return res
        .status(200)
        .json(
            new ApiResponse(200, newComment, "Comment Updated")
        )

})

//done
const deleteComment = asyncHandler(async(req, res) => {
    // TODO: delete a comment

    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "Comment Required")
    }
    const findComment = await Comment.findById(commentId)
    if (!findComment) {
        throw new ApiError(401, "Comment does not exists ")
    }

    const status = Comment.findByIdAndDelete(commentId);

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Comment Deleted")
        )
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}