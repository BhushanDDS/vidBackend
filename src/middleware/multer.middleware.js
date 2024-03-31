import multer from "multer";
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({ storage, })



/*
We import Express.js and the upload instance from the multerConfig.js file.
We create an Express app.
We define a POST route at "/upload" where we use upload.single("file") middleware to handle file uploads. This middleware is configured to expect a single file upload with the field name "file".
Inside the route handler, if the file is uploaded successfully, we send a success message back to the client.
We start the Express server and listen on a port (3000 by default).
*/