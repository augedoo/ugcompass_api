const path = require('path');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Facility = require('../models/Facility');
const fileHelper = require('../utils/file');

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
  req.body.user = req.user.id;

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

  console.log(facility);
  // Make sure user created facility
  if (req.user.id !== facility.user.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update facility ${facility._id}`,
        401
      )
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

  // Make sure user created facility
  if (req.user.id !== facility.user.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to delete facility ${facility._id}`,
        401
      )
    );
  }

  facility = await Facility.findByIdAndDelete(req.params.id);

  res.status(200).json({ success: true, data: {} });
});

// @desc      Upload photos for facility
// @route     PUT /api/v1/facilities/:id/photos
// @access    Private
exports.facilityPhotosUpload = asyncHandler(async (req, res, next) => {
  let facility = await Facility.findById(req.params.id);
  if (!facility) {
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user created facility
  if (req.user.id !== facility.user.toString() && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to upload photo for ${facility._id}`,
        401
      )
    );
  }

  // Make sure a file is uploaded
  if (req.files === null || req.files.length === 0) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  // Check number of file uploaded
  if (facility.photos.length >= process.env.MAX_FACILITY_PHOTOS_UPLOAD) {
    return next(
      new ErrorResponse(
        `Facility can not have more than ${process.env.MAX_FACILITY_PHOTOS_UPLOAD} photos`,
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
    facility.photos.length + filesArray.length >
    process.env.MAX_FACILITY_PHOTOS_UPLOAD
  ) {
    return next(
      new ErrorResponse(
        `Too many file uploads. Maximum upload for a facility is ${process.env.MAX_FACILITY_PHOTOS_UPLOAD} photos`,
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
    file.name = `facility_${facility._id}_${file.name}`;

    // Make sure file is not already uploaded
    if (facility.photos.includes(file.name)) {
      return next(
        new ErrorResponse(
          `Duplicate file name. Try uploading with a different file name`,
          400
        )
      );
    }

    facility.photos.push(file.name);

    // Move file to specific directory on the server
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }
    });
  });

  facility = await facility.save({ runValidators: true });

  res.status(200).json({
    success: true,
    data: facility,
  });
});

// @desc      Delete facility's photo
// @route     PUT /api/v1/facilities/:id/photos/:photoname
// @access    Private
exports.deleteFacilityPhoto = asyncHandler(async (req, res, next) => {
  let facility = await Facility.findById(req.params.id);
  if (!facility) {
    return next(
      new ErrorResponse(`Resource not found with id of ${req.params.id}`, 404)
    );
  }

  facility.photos.forEach((photoname, index) => {
    if (photoname === req.params.photoname) {
      facility.photos.splice(index, 1);
      // > delete image from server
      fileHelper.delete(
        path.join(__dirname, '..', 'public', 'uploads', req.params.photoname)
      );
    }
  });

  facility = await facility.save({ runValidators: true });

  res.status(200).json({
    success: true,
    data: facility,
    msg: 'File deleted successfully',
  });
});
