import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";

export const varifyJWT = asyncHandler(async(req, _, next) => {
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
        const decodedTOken = jwt.varify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedTOken._id).select("-password -refreshToken")

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