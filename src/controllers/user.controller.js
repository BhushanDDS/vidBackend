import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import { upload } from "../middleware/multer.middleware.js"
import router from "../routes/user.routes.js";
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

    const { fullname, email, username, password } = req.body

    //console.log(email);
    // if (fullname === "") {
    //     throw new ApiError(400,"Full Name Is Required")
    // }
    if (
        [fullname, email, username, password].some((field) => field.trim() === "")
    ) {
        throw new ApiError(400, "All Fields Are Coumpulsory")

    }

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "You are aleready there")
    }

    //     const avatarLocalPath = req.files?.avatar?.[0]?.path;
    //     const coverImageLocal = req.files?.coverImage?.[0]?.path;


    const avatarLocalPath = req.files && req.files.avatar && req.files.avatar[0] && req.files.avatar[0].path;
    const coverImageLocal = req.files && req.files.coverImage && req.files.coverImage[0] && req.files.coverImage[0].path;

    if (!avatarLocalPath) throw new ApiError(400, "We need avatar");


    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocal)

    if (!avatar) throw new ApiError(400, "We need avtar")

    const user = await User.create({
        fullname,
        avatar: avatar.url, // Assuming 'avatar' is the correct property name
        coverImage: coverImage ? coverImage.url : "",
        password,
        username: username.toLowerCase()
    })

    const createduser = await user.findById(user._id).select(
        "-password -refreshToken"
    )
    if (createduser) throw new ApiError(500, "something went wrong while registring the user");


    return res.status(201).json(
        new ApiResponse(200, createduser, "done!!!!")
    )

})


export { registerUser }