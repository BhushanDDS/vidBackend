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


const generateAccessAndRefereshTokens = async(UserId) => {

    try {
        const user = await User.findById(UserId)
        const accesToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ ValidateBeforeSave: false })

        return { accesToken, refreshToken }




    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }

}





const loginuser = asyncHandler(async(req, res) => {
    //check if aleraesy loged in
    //if not then get the data
    //validate the data
    //comapre 
    //if okay then proceed

    //req body -> data
    //username or email
    //find the user 
    //password check
    //access and refresh token ->generate and send
    //send cookies
    //send response 


    const { username, email, passord } = req.body
    if (!username && !email) {
        throw new ApiError(400, "username or email is reqirid ")
    }

    /*

  if (!(username || !email)) {
        throw new ApiError(400, "username or email is reqirid ")
    }
    */

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const ispasswordValid = await user.isPasswordCorrect(passord)
    if (!ispasswordValid) {
        throw new ApiError(401, "Incorrect Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedinUser = await User.findById(user._id).select("-passeord -refreshToken")

    const options = {
        httpOnle: true,
        source: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                    user: loginuser,
                    accessToken,
                    refreshToken
                },
                "User Loggeg in Succesfully ")
        )



})

const logOutUser = asyncHandler(async(req, res) => {

    await User.findByIdAndUpdate(
        req.user._id, {

            $set: {
                refreshToken: undefined
            }
        }, {
            new: true
        }
    )


    const options = {
        httpOnle: true,
        source: true
    }
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logged Out "))





})
export {
    registerUser,
    loginuser,
    logOutUser
}