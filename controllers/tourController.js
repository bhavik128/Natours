const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const handlerFactory = require('./handlerFactory');
const AppError = require('../utils/appError');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = `${req.params.top}`;
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numRatings: { $sum: '$ratingsQuantity' },
        numTours: { $sum: 1 },
        averageRating: { $avg: '$ratingsAverage' },
        averagePrice: { $avg: '$price' },
        minimumPrice: { $min: '$price' },
        maximumPrice: { $max: '$price' }
      }
    },
    {
      $sort: { averagePrice: 1 }
    }
    // { $match: { _id: { $ne: 'EASY' } } }
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: { _id: 0 }
    },
    {
      $sort: { numTourStarts: -1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: { plan }
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude & longitude in form of lat,lng',
        400
      )
    );
  }

  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: tours
  });
});

exports.calculateDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const unitMultiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
    return next(
      new AppError(
        'Please provide latitude & longitude in form of lat,lng',
        400
      )
    );
  }

  const tourDistances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: unitMultiplier
      }
    },
    {
      $project: { distance: 1, name: 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: tourDistances
  });
});

exports.getAllTours = handlerFactory.getAll(Tour);
exports.getSpecificTour = handlerFactory.getOne(Tour, { path: 'reviews' });
exports.createNewTour = handlerFactory.createOne(Tour);
exports.updateSpecificTour = handlerFactory.updateOne(Tour);
exports.deleteSpecificTour = handlerFactory.deleteOne(Tour);
