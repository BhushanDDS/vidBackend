import mongoose, { isValidObjectId, plugin } from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async(req, res) => {
    const { name, description } = req.body
    if (!name || !description) {
        throw new ApiError(400, "data requied")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    if (!playlist) {
        throw new ApiError(400, "Error while creating playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist created succesfully")
        )
        //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async(req, res) => {
    const { userId } = req.params
        //TODO: get user playlists
    if (!userId) {
        throw new ApiError(400, "userId required")
    }
    const playlists = await Playlist.find({
        owner: userId
    })

    if (playlists.length === 0) {
        throw new ApiError(400, "no playlists found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "Playlists fetched succesflly")

        )
})

const getPlaylistById = asyncHandler(async(req, res) => {
    const { playlistId } = req.params
        //TODO: get playlist by id

    if (!playlistId) {
        throw new ApiError(400, "id required")
    }

    const responsePlaylist = await Playlist.findById(playlistId)

    if (!responsePlaylist) {
        throw new ApiError(400, "playlist not found")
    }
    return res
        .status(200)
        .json(
            new ApiResponse(200, responsePlaylist, "data fetched succesfilly")
        )
})

const addVideoToPlaylist = asyncHandler(async(req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "create a playlist first")
    }
    if (!videoId) {
        throw new ApiError(400, "videoId required")
    }

    //check for if the video is aleready added or not 
    const checkVdo = await Playlist.findOne({
        video: videoId,
        owner: req.user._id
    })

    if (checkVdo) {
        throw new ApiError(400, "its aleready there")
    } else {
        var addVdo = await Playlist.findByIdAndUpdate(
            playlistId, {
                $set: {
                    videos: videoId
                }
            }, { new: true }
        )
    }
    if (!addVdo) {
        throw new ApiError(400, "video was not added , problem occured")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, addVdo, "video added succesfully")
        )
})

const removeVideoFromPlaylist = asyncHandler(async(req, res) => {
    const { playlistId, videoId } = req.params
        // TODO: remove video from playlist
    if (!playlistId || !videoId) {
        throw new ApiError(400, "Data required")
    }

    const deleted = await Playlist.deleteOne({ _id: playlistId, videos: videoId })

    if (!deleted) {
        throw new ApiError(400, "mission failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deleted, "video deleted from playlist")
        )



})

const deletePlaylist = asyncHandler(async(req, res) => {
    const { playlistId } = req.params
        // TODO: delete playlist

    if (!playlistId) {
        throw new ApiError(400, "playlist does not exists")
    }

    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)

    if (!deletePlaylist) {
        throw new ApiError(400, "playlis deletion unsuccesfull")

    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "playlist deleted succesfully")
        )
})

const updatePlaylist = asyncHandler(async(req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body
        //TODO: update playlist
    if (!playlistId) {
        throw new ApiError(400, "Id required")
    }
    if (!name || !description) {
        throw new ApiError(400, "Date required")
    }

    const updateplaylist = await Playlist.findByIdAndUpdate(
        playlistId, {
            name,
            description
        }, { new: true }
    )
    if (!updateplaylist) {
        throw new ApiError(400, "Updation failed")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updateplaylist, "playlist updated")
        )


})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}