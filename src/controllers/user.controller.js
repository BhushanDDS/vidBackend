import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/Apiresponse.js";


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


export { registerUser }