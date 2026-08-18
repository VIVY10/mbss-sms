// Helper function to create an error object
function createError(status, message) {
    const error = new Error(message);
    error.status = status;
    return error;
  }

  module.exports = createError;