class ApplicationError extends Error {
  constructor(status, message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = status;
    this.message = message;
  }
}

function handleError(error, next) {
  if (error instanceof ApplicationError) {
    next(error);
  } else {
    console.log(error);
    next(new ApplicationError(500, "Internal error"));
  }
}

module.exports = {
  ApplicationError,
  handleError
};
