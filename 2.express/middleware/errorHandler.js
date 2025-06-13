// custom error class
export class apiError extends Error {
  constructor(msg, statusCode) {
    super(msg);
    this.statusCode = statusCode;
    this.name = "API-Error"; // set the type to API Error
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const globalErrorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof apiError) {
    return res.status(err.statusCode).json({
      status: "Error",
      message: err.message,
    });
  } else if (err.name === 'validationError') {
    return res.status(400).json({
      status : 'Error',
      message : "validationError",
    });
  } else {
    return res.status(500).json({
      status : 'Error',
      message : "An unexpected error occured",
    });
  }
};