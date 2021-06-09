const AppError = require('../utils/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;

  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Access denied! Please log in', 401);

const handleTokenExpired = () =>
  new AppError('Session expired! Please log in again', 401);

const handleDuplicateErrorDB = err => {
  const value = Object.keys(err.keyValue);

  const message = `Duplicate field value: ${value}`;

  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `${errors.join('. ')}`;

  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong', msg: err.message });
  }
};

const sendErrorProd = (err, req, res) => {
  //Operational error or known error
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    //Programming or unknown error
    // eslint-disable-next-line no-console
    console.error('ERROR:', err);

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
  if (err.isOperational) {
    return res
      .status(err.statusCode)
      .render('error', { title: 'Something went wrong', msg: err.message });
  }
  //Programming or unknown error
  // eslint-disable-next-line no-console
  console.error('ERROR:', err);

  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please try again later'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    let error = Object.assign(err);
    // console.log(err.name);

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleTokenExpired();

    sendErrorProd(error, req, res);
  }
};
