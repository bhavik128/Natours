const express = require('express');
const path = require('path');
// eslint-disable-next-line node/no-unpublished-require,import/no-extraneous-dependencies
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const RateLimit = require('express-rate-limit');
const hpp = require('hpp');

const globalErrorHandler = require('./controllers/errorController');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');

const app = express();

// setting view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Helmet middleware for headers
app.use(helmet());

// morgan middleware for request information in development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// rate limiter middleware
const limiter = new RateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this ip, please try again after some time'
});
app.use('/api', limiter);

// JSON middleware for getting json date
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mongo sanitize middleware
app.use(mongoSanitize());

// XSS middleware
app.use(xss());

// HPP middleware to prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'RatingsQuantity',
      'RatingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Middleware for serving static files
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError('Page not found', 404));
});

// Global error handler middleware
app.use(globalErrorHandler);

module.exports = app;
