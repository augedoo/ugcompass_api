const express = require('express');
const {
  getRooms,
  getRoom,
  addRoom,
  updateRoom,
  deleteRoom,
  roomPhotosUpload,
  deleteRoomPhoto,
} = require('../controllers/rooms');
const Room = require('../models/Room');

const { protect, authorize } = require('../middleware/is-auth');
const advancedResults = require('../middleware/advancedResults');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(
    advancedResults(Room, {
      path: 'facility',
      select: 'name description',
    }),
    getRooms
  )
  .post(protect, authorize('admin', 'publisher'), addRoom);

router
  .route('/:id')
  .get(getRoom)
  .put(protect, authorize('admin', 'publisher'), updateRoom)
  .delete(protect, authorize('admin', 'publisher'), deleteRoom);

router
  .route('/:id/photos')
  .put(protect, authorize('admin', 'publisher'), roomPhotosUpload);

router
  .route('/:id/photos/:photoname')
  .put(protect, authorize('admin', 'publisher'), deleteRoomPhoto);

module.exports = router;
