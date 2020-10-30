const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Room = require('../models/Room');
const Facility = require('../models/Facility');

// @desc      Get all rooms
// @route     GET /api/v1/rooms
// @route     GET /api/v1/facilities/:facilityId/rooms
// @access    Public
exports.getRooms = asyncHandler(async (req, res, next) => {
  if (req.params.facilityId) {
    const rooms = await Room.find({ facility: req.params.facilityId });
    return res.status(200).json({
      success: true,
      count: rooms.length,
      data: rooms,
    });
  } else {
    res.json(res.advancedResults);
  }
});

// @desc      Get a single room
// @route     GET /api/v1/rooms/:id
// @access    Public
exports.getRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findById(req.params.id).populate({
    path: 'facility',
    select: 'name description',
  });

  if (!room) {
    return next(
      new ErrorResponse(`No room with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: room,
  });
});

// @desc      Add room
// @route     POST /api/v1/facility/:facilityId/rooms
// @access    Private
exports.addRoom = asyncHandler(async (req, res, next) => {
  // Add facility field to body
  req.body.facility = req.params.facilityId;
  req.body.user = req.user.id;

  // Check if facility exists
  const facility = await Facility.findById(req.params.facilityId);
  if (!facility) {
    return next(
      new ErrorResponse(
        `No facility with the id of ${req.params.facilityId}`,
        404
      )
    );
  }

  if (req.user.role !== 'publisher' && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to add room to facility ${facility._id}`,
        401
      )
    );
  }

  // Add room
  const room = await Room.create(req.body);

  res.status(200).json({
    success: true,
    data: room,
    msg: 'Room Created',
  });
});

// @desc      Update room
// @route     PUT /api/v1/rooms/:id
// @access    Private
exports.updateRoom = asyncHandler(async (req, res, next) => {
  let room = await Room.findById(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(`No room found with id ${req.params.id}`, 404)
    );
  }

  room = await Room.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: room });
});

// @desc      Delete room
// @route     DELETE /api/v1/rooms/:id
// @access    Private
exports.deleteRoom = asyncHandler(async (req, res, next) => {
  let room = await Room.findById(req.params.id);

  if (!room) {
    return next(
      new ErrorResponse(`No room found with id ${req.params.id}`, 404)
    );
  }

  // Make sure user is publisher or admin
  if (req.user.role !== 'publisher' && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete course ${room._id}`,
        401
      )
    );
  }

  await room.remove();

  res.status(200).json({ success: true, data: {} });
});
