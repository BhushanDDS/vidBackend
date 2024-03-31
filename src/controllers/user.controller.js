import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/Apiresponse.js";


const generateAccessAndRefereshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)

        console.log("we are inside tokens");


        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;


        await user.save({ validateBeforeSave: false })

        console.log("we are inside tokens");

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

export {
    registerUser,
    loginUser,
    logoutUser
}