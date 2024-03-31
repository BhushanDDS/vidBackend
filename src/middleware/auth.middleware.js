import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const verifyJWT = asyncHandler(async(req, _, next) => {
    try {
        let token;
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.header("Authorization")) {
            token = req.header("Authorization").replace("Bearer ", "");
        } else {
            throw new ApiError(401, "Unauthorized token")
        }

        if (!token) {
            throw new ApiError(401, "Unauthorized token")

        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select("-password -refreshToken")

        if (!user) {
            throw new ApiError(401, "Unauthorized access token")

        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error.message ||
            "invalid access token")

    }


})