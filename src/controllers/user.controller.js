import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import Jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)




        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;


        await user.save({ validateBeforeSave: false })


        return { accessToken, refreshToken }


    } catch (error) {
        console.log(error);
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async(req, res) => {
    //get user details from frontend  --postman
    //validation - not empty
    //check if user alerady exists :username and email
    //check for images , check for avtar
    //upload them to cloudnary -check for avtar
    //create user object -create entry in db   (.create)
    //remove password and refresh token field from response
    //chk for user creation
    //if created then return response

    //get user details from frontend
    const { fullname, email, username, password } = req.body

    console.log(email);

    //validation -checking for empty values

    //console.log(email);
    // if (fullname === "") {
    //     throw new ApiError(400,"Full Name Is Required")
    // }
    if (
        [fullname, email, username, password].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "All Fields Are Coumpulsory")

    }

    //checking if user aleready existed or not
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    //cheking if user has uploaded the avtar(required) file or not 
    //     const avatarLocalPath = req.files?.avatar?.[0]?.path;
    //     const coverImageLocal = req.files?.coverImage?.[0]?.path;
    const avatarLocalPath = req.files && req.files.avatar && req.files.avatar[0] && req.files.avatar[0].path;
    const coverImageLocal = req.files && req.files.coverImage && req.files.coverImage[0] && req.files.coverImage[0].path;
    if (!avatarLocalPath) throw new ApiError(400, "We need avatar");

    /*
    let coverImageLocalPath;
    if(req.files && Array.isAArray(req.files.coverImage)
    && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }



    */

    //uploading image files in cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocal)
    if (!avatar) throw new ApiError(400, "We need avtar")

    //Pusing data in database
    const user = await User.create({
        fullname,
        email,
        avatar: avatar.url, // Assuming 'avatar' is the correct property name
        coverImage: coverImage ? coverImage.url : "",
        password,
        username: username.toLowerCase()
    })

    //Ignoring some filds like password , refreshToken from res for security purpose 
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    //Returning response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "done!!!!")
    )

})

const loginUser = asyncHandler(async(req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, username, password } = req.body
    console.log(email);

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")

    // }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    console.log(user);

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async(req, res) => {







    await User.findByIdAndUpdate(
        req.user._id, {
            $unset: {
                refreshToken: false // this removes the field from document
            }
        }, {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken = asyncHandler(async(req, res) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorize Request")
        }
        const decodedToken = Jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)
        if (!user) {
            throw new ApiError(401, "invalid refresh token")
        }

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, " refresh token is expired or used")
        }

        const { accessToken, newrefreshToken } = await generateAccessAndRefereshTokens(user._id)
        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200, { accessToken, refreshTolen: newrefreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh Token")

    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user._id)

    const ispasswordcorrect = user.isPasswordCorrect(oldPassword)
    if (!ispasswordcorrect) {
        throw new ApiError(401, "invalid passwod")
    }
    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changed succesfully"))

})

const getCurrentUser = asyncHandler(async(req, res) => {

    return res
        .status(200)
        .json(200, req.user, "current user fetched succesfully")
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const { fullname, email } = req.body
    if (!fullname || !email) {
        throw new ApiError(400, "all filds are requried")
    }

    const user = await User.findByIdAndUpdate(
        req.user._id, {
            $set: {
                fullname,
                email
            }

        }, { new: true }

    ).select("-password")


    return res.status(200)
        .json(new ApiResponse(200, user, "Account details updated succesfully"))

})


const updateUserAvatar = asyncHandler(async(req, res) => {

    const avatarLocalPath = req.file.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "FIle does not exist")
    }

    const avatar = uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(400, "avatar file is missing")
    }

    const userav = await User.findByIdAndUpdate(
        req.file.path, {
            $set: avatar = avatar.url
        }, { new: true }

    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, userav, "Avatar updated succesfully")
        )

})


const updateCoverImage = asyncHandler(async(req, res) => {

    const coverImageLocalPath = req.file.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "NO IMAGE FOUND")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!updateCoverImage) {
        throw new ApiError(400, "COver not uploaded")
    }

    const userIm = await User.findByIdAndUpdate(
        req.file.path, {
            $set: coverImage = coverImage.url
        }, {
            new: true
        }
    )

    return res.status(200)
        .json(
            new ApiResponse(200, userIm, "Cover image updated succesfully")
        )

})

const getUserChannelProfile = asyncHandler(async(req, res) => {
    const { username } = req.params

    if (!username.trim) {
        throw new ApiError(400, "Username is missing")
    }

    const channel = await User.aggregate([

        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false

                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubToCount: 1,
                isSubscribed: 1


            }
        }
    ])
    if (!channel.length) {
        throw new ApiError(400, "channel does not exists")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "user channel fetchesd succesfully")

        )
})


const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([


        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [{
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        as: "owner",
                        pipeline: [{
                            $project: {
                                fullname: 1,
                                username: 1,
                                avatar: 1
                            }
                        }]
                    }
                }, {
                    $addFields: {
                        owner: {
                            $first: "$owner"
                        }
                    }
                }]
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory, "Watch History Fetched Succesfully")
        )
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserAvatar,
    updateCoverImage,
    updateAccountDetails,
    getUserChannelProfile,
    getWatchHistory
}