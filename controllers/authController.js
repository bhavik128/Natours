const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_TOKEN_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });

const createSendToken = (user, statusCode, req, res, message) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers('x-forwarded-proto') === 'https'
  };

  res.cookie('natoursJWTToken', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    message,
    data: user
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm
  });

  const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res, 'Signed up successfully');
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, req, res, 'Logged in successfully');
});

exports.logout = (req, res) => {
  res.cookie('natoursJWTToken', '', {
    maxAge: 1,
    httpOnly: true
  });

  res.status(200).json({
    status: 'success'
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  const { authorization } = req.headers;
  let token;
  if (authorization && authorization.split(' ')[0] === 'Bearer') {
    token = authorization.split(' ')[1];
  } else if (req.cookies.natoursJWTToken) {
    token = req.cookies.natoursJWTToken;
  }

  if (!token) {
    return next(new AppError('Access denied! Please log in', 401));
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_TOKEN_SECRET
  );

  const user = await User.findById(decoded.id);

  if (!user) return next(new AppError('User not found!', 401));

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User changed password, please log in again', 401)
    );
  }

  req.user = user;
  res.locals.user = user;
  next();
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  const token = req.cookies.natoursJWTToken;

  if (!token) return next();

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_TOKEN_SECRET
  );

  const user = await User.findById(decoded.id);

  if (!user) return next();
  if (user.changedPasswordAfter(decoded.iat)) return next();

  res.locals.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied!', 403));
    }

    next();
  };

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('User not found!', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();
    // await Email({
    //   email: user.email,
    //   subject: 'Natours: Password reset (only valid for 10 minutes)',
    //   message
    // });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending and email! try again later', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Reset email sent successfully'
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.token;

  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  createSendToken(user, 200, req, res, 'Password changed successfully');
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    return next(new AppError('Enter required fields', 400));
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return next(new AppError('Current password is wrong', 401));
  }

  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();

  createSendToken(user, 200, req, res, 'password changed successfully');
});
