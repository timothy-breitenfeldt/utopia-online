class ApplicationError extends Error {
  constructor(status, message) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.status = status;
    this.message = message;
  }
}

module.exports = ApplicationError;
