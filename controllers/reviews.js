const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Review = require('../models/Review');
const Facility = require('../models/Facility');

// @desc      Get all reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/facilities/:facilityId/reviews
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.facilityId) {
    const reviews = await Review.find({
      facility: req.params.facilityId,
    })
      .populate({
        path: 'user',
        select: 'name',
      })
      .sort('-createdAt');

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    // ! If we want all the reviews - This is where advanced queries is useful
    res.json(res.advancedResults);
  }
});

// @desc      Get single review
// @route     GET /api/v1/reviews/id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: 'facility user',
    select: 'name description',
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc      Add review
// @route     GET /api/v1/facilities/:facilityId/reviews
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
  req.body.facility = req.params.facilityId;
  req.body.user = req.user.id;

  const facility = await Facility.findById(req.params.facilityId);

  if (!facility) {
    return next(
      new ErrorResponse(
        `No facility with the id of ${req.params.facilityId}`,
        404
      )
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc      Update review
// @route     GET /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update review', 401));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: review,
  });
});

// @desc      Delete review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete review', 401));
  }

  await Review.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});
