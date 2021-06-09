const router = require('express').Router();
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

router.get(
  '/',
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get(
  '/tour/:tourSlug',
  authController.isLoggedIn,
  viewController.getTour
);
router.get('/forgetPassword', viewController.forgetPassword);
router.get('/resetPassword/:resetToken', viewController.resetPassword);
router.get('/login', authController.isLoggedIn, viewController.getLogin);
router.get('/signup', authController.isLoggedIn, viewController.getSignup);
router.get('/me', authController.protect, viewController.getMe);
router.get(
  '/my-bookings',
  authController.protect,
  viewController.getMyBookings
);

module.exports = router;
