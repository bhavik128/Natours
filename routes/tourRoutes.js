const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

// router.param('id', tourController.checkId);
router.get(
  '/top-:top-tours',
  tourController.aliasTopTours,
  tourController.getAllTours
);

router.get('/distances/:latlng/unit/:unit', tourController.calculateDistances);

router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  tourController.getToursWithin
);

router.get('/tour-stats', tourController.getTourStats);

router.get(
  '/monthly-plan/:year',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  tourController.getMonthlyPlan
);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createNewTour
  );

router
  .route('/:id')
  .get(tourController.getSpecificTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateSpecificTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteSpecificTour
  );

module.exports = router;
