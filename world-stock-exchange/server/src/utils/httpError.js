// An expected error with a status code and a message that is safe to show the user.
class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = HttpError;
