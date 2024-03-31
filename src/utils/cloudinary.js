import { v2 as cloudinary } from "cloudinary";
import fs from "fs";



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SRCREAT
});


const uploadOnCloudinary = async(lclfilepath) => {
    try {
        if (!lclfilepath) return null

        //upload the file on cloudinary

        const response = await cloudinary.uploader.upload(lclfilepath, {
            resource_type: "auto"
        })

        //file has been uploaded
        //console.log("file uploaded succesfully", response.url);
        fs.unlinkSync(lclfilepath)
        return response

    } catch (error) {
        fs.unlinkSync(lclfilepath)
        return null;
    }
}


export { uploadOnCloudinary }

// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg", { public_id: "olympic_flag" },
//     function(error, result) { console.log(result); });