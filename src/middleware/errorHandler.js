function notFoundHandler(req, res) {
  res.status(404).render('./response/response', {
    message: 'Page not found.'
  });
}


function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).render('./response/response', {
    message: err.message || 'An unexpected error occurred.'
  });
}


module.exports = {
  notFoundHandler,
  errorHandler
};