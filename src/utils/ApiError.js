// Define a class called ApiError that extends the built-in Error class
class ApiError extends Error {
    // Constructor function that initializes the instance properties
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        // Call the constructor of the Error class and pass the provided message
        super(message);
        // Initialize custom properties specific to ApiError
        this.statusCode = statusCode; // HTTP status code associated with the error
        this.message = message; // Error message
        this.success = false; // Indicates whether the operation was successful (false for errors)
        this.errors = errors; // Additional errors or error details
        this.data = null; // Additional data associated with the error (set to null by default)

        // If a stack trace is provided, assign it to the stack property; otherwise, capture the stack trace
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor); // Capture the stack trace
        }
    }
}

// Export the ApiError class for use in other modules
export { ApiError };