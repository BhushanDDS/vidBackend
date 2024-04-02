import mongoose, { Schema } from "mongoose";
import { User } from "./user.models.js";


const subcriptionSchema = new mongoose.Schema({

    subscriber: {
        type: Schema.Types.ObjectId, //one who is subing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, //one whom is suscriber subing
        ref: "User"
    }

}, { timestamps: true })


export const Subscription = mongoose.model("Subscription", subcriptionSchema)