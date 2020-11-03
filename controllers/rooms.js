const path = require('path');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const fileHelper = require('../utils/file');
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

  // Make sure user created facility
  if (req.user.id !== facility.user.toString() && req.user.role !== 'admin') {
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

  // Make sure user created room
  if (req.user.id !== room.user.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update room ${room._id}`,
        401
      )
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

  // Make sure user created room
  if (req.user.id !== room.user.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete room ${room._id}`,
        401
      )
    );
  }

  await room.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Upload photos for room
// @route     PUT /api/v1/facilities/:id/photos
// @access    Private
exports.roomPhotosUpload = asyncHandler(async (req, res, next) => {
  let room = await Room.findById(req.params.id);
  if (!room) {
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user created room
  if (req.user.id !== room.user.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to upload photos for room ${room._id}`,
        401
      )
    );
  }

  // Make sure a file is uploaded
  if (req.files === null || req.files.length === 0) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  // Check number of file uploaded
  if (room.photos.length >= process.env.MAX_ROOM_PHOTOS_UPLOAD) {
    return next(
      new ErrorResponse(
        `Room can not have more than ${process.env.MAX_ROOM_PHOTOS_UPLOAD} photos`,
        400
      )
    );
  }

  // Build filesArray
  let filesArray;
  if (req.files.images.name) {
    filesArray = [req.files.images];
  } else {
    filesArray = [...req.files.images];
  }

  // Add upload + uploaded to avoid over upload
  if (
    room.photos.length + filesArray.length >
    process.env.MAX_ROOM_PHOTOS_UPLOAD
  ) {
    return next(
      new ErrorResponse(
        `Too many file uploads. Maximum upload for a room is ${process.env.MAX_ROOM_PHOTOS_UPLOAD} photos`,
        400
      )
    );
  }

  filesArray.forEach(async (file) => {
    // Check file type
    if (!file.mimetype.startsWith('image')) {
      return next(new ErrorResponse(`Please upload only image file`, 400));
    }

    // Check file size
    if (file.size > process.env.MAX_FILE_UPLOAD * 1024 * 1024) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}megabytes`,
          400
        )
      );
    }

    // Create custom filename
    file.name = `room_${room._id}_${file.name}`;

    // Make sure file is not already uploaded
    if (room.photos.includes(file.name)) {
      return next(
        new ErrorResponse(
          `Duplicate file name. Try uploading file with a different name`,
          400
        )
      );
    }

    room.photos.push(file.name);

    // Move file to specific directory on the server
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }
    });
  });

  room = await room.save({ runValidators: true });

  res.status(200).json({
    success: true,
    data: room,
  });
});

// @desc      Delete room's photo
// @route     PUT /api/v1/rooms/:id/photos/:photoname
// @access    Private
exports.deleteRoomPhoto = asyncHandler(async (req, res, next) => {
  let room = await Room.findById(req.params.id);
  if (!room) {
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user created room
  if (req.user.id !== room.user.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete photos for room ${room._id}`,
        401
      )
    );
  }

  room.photos.forEach((photoname, index) => {
    if (photoname === req.params.photoname) {
      room.photos.splice(index, 1);
      // > delete image from server
      fileHelper.delete(
        path.join(__dirname, '..', 'public', 'uploads', req.params.photoname)
      );
    }
  });

  room = await room.save({ runValidators: true });

  res.status(200).json({
    success: true,
    data: room,
    msg: 'File deleted successfully',
  });
});
