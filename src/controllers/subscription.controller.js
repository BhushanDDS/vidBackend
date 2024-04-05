import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async(req, res) => {
    const { channelId } = req.params
    const { subcriberId_MyId } = req.User._id
        // TODO: toggle subscription
    if (!channelId) {
        throw new ApiError(400, "channel not found")
    }
    const isSub = await Subscription.find({

        subscriber: subcriberId_MyId
    })
    if (isSub) {
        console.log("You are aleready subcsribed to this channel");
    } else {
        var subToChannel = await Subscription.create({
            subscriber: subcriberId_MyId,
            channel: channelId
        })
        if (!subToChannel) {
            console.log("error occured while subing");
        }
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, subToChannel, "channel subscriber")
        )

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async(req, res) => {
    const { channelId } = req.params
    const { subscriberId } = req.params
    if (!subscriberId) {
        throw new ApiError(400, "subscribersId required")
    }

    const list = Subscription.aggregate([

        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        }, {
            $lookup: {
                from: users,
                localField: "subscriber",
                foreignField: "_id",
                as: "subs"
            }
        }, {
            $project: {
                username: 1
            }
        }, { $unwind: '$subs' }


    ])

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async(req, res) => {


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}