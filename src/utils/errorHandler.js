const logger = require('../config/loggerConfig.js');

function errorHandler(err, req, res, next) {
    console.log("Error Handler Invoked"); // Debugging message
    console.log("Error Object:", err);
    console.log("Response Object:", res);

    // Existing logic
    logger.error(err.stack);

    const customUrl = req.user
        ? req.user.usertype === "pupil"
            ? "/studentDashboard"
            : "/Dashboard"
        : "/";

    res.render("error", {
        message: err.message || "An unexpected error occurred.",
        customUrl,
    });
}

module.exports = errorHandler;