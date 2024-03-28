// Define a class called ApiResponse
class ApiResponse {
    // Constructor function that initializes the instance properties
    constructor(statusCode, data, message = "Success") {
        // Set statusCode, data, and message properties based on constructor arguments
        this.statusCode = statusCode; // HTTP status code of the response
        this.data = data; // Data to be included in the response body
        this.message = message; // Optional message to describe the response
        // Calculate the success property based on statusCode (statusCode < 400 indicates success)
        this.success = statusCode < 400;
    }
}



export { ApiResponse }