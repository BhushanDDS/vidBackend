import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.models.js"
import { User } from "../models/user.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async(req, res) => {

    //get content _>req.body
    //validate
    //get user 
    //validate
    //Tweet.create
    //return resonse

    //TODO: create tweet

    const { tweetContent } = req.body
    if (!tweetContent) {
        throw new ApiError(400, "Data Required")
    }
    const ownerIs = req.user._id
    console.log(ownerIs);

    if (!ownerIs) {
        throw new ApiError(400, "user Required")

    }
    const tweet = await Tweet.create({
        content: tweetContent,
        owner: ownerIs
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "Tweet Added")
        )
})

const getUserTweets = asyncHandler(async(req, res) => {
    //Getting userId from params

    const { userId } = req.params
    if (!userId) {
        throw new ApiError(400, "userId required")
    }
    const allTweets = await Tweet.aggregate([{
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "Alltweets"
            }
        },
        { $unwind: '$Alltweets' }, {
            $project: {
                owner: 2,
                content: 2,

            }
        }


    ])

    if (!allTweets.length) {
        throw new ApiError(400, "No tweets availible to display")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, allTweets[0], "tweets fetched succesfully")
        )

    // TODO: get user tweets

})

const updateTweet = asyncHandler(async(req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "Data required tweetId")
    }
    const { newTweet } = req.body
    if (!newTweet) {
        throw new ApiError(400, "Data required content")
    }

    const updateTweet = await Tweet.findByIdAndUpdate(
        tweetId, {
            $set: {

            }
        }, { new: true }
    )

    if (!updateTweet) {
        throw new ApiError(400, "problem while adding the tweet")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updateTweet, "Tweet updated")
        )

})

const deleteTweet = asyncHandler(async(req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "tweetId required")
    }

    const deleteTweet = await Tweet.findByIdAndDelete(tweetId)

    if (!deleteTweet) {
        throw new ApiError(400, "problem while deleting the tweet")

    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "tweet deleted")
        )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}