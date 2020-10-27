const path = require('path');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Facility = require('../models/Facility');

// @desc      Get all facilities
// @route     GET /api/v1/facilities
// @access    Public
exports.getFacilities = asyncHandler((req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single facility
// @route     GET /api/v1/facilities/:id
// @access    Public
exports.getFacility = asyncHandler(async (req, res, next) => {
  const facility = await Facility.findById(req.params.id).populate('rooms');

  if (!facility) {
    return next(
      new ErrorResponse(`No facility found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: facility });
});

// @desc      Add new facility
// @route     POST /api/v1/facilities
// @access    Private
exports.addFacility = asyncHandler(async (req, res, next) => {
  const facility = await Facility.create(req.body);

  res.status(200).json({ success: true, data: facility });
});

// @desc      Update facility
// @route     PUT /api/v1/facilities/:id
// @access    Private
exports.updateFacility = asyncHandler(async (req, res, next) => {
  let facility = await Facility.findById(req.params.id);

  if (!facility) {
    return next(
      new ErrorResponse(`No facility found with id ${req.params.id}`, 404)
    );
  }

  facility = await Facility.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.status(200).json({ success: true, data: facility });
});

// @desc      Delete facility
// @route     DELETE /api/v1/facilities/:id
// @access    Private
exports.deleteFacility = asyncHandler(async (req, res, next) => {
  let facility = await Facility.findById(req.params.id);

  if (!facility) {
    return next(
      new ErrorResponse(`No facility found with id ${req.params.id}`, 404)
    );
  }

  facility = await Facility.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});
