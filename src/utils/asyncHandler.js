// Defining a function named asyncHandler that takes another function (requestHandler) as its parameter
const asyncHandler = (requestHandler) => {
    // The function signature indicates that it takes three parameters: req (request), res (response), and next (next middleware function)
    // Note: this is a typo, it should be (req, res, next) => { ...
    return (req, res, next) => {
        // Inside this function, the requestHandler function is called with the provided req, res, and next parameters
        // The result of calling requestHandler is wrapped in a Promise.resolve() call to ensure it's a Promise
        // If the promise resolves successfully, the next middleware in the chain is called with the resolved value
        // If the promise is rejected (throws an error), the error is passed to the next middleware in the chain using the next() function
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
    }
};

// Exporting the asyncHandler function
export { asyncHandler };