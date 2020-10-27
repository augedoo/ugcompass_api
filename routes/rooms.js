const express = require('express');
const {
  getRooms,
  getRoom,
  addRoom,
  updateRoom,
  deleteRoom,
} = require('../controllers/rooms');
const Room = require('../models/Room');

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
  .post(addRoom);

router.route('/:id').get(getRoom).put(updateRoom).delete(deleteRoom);

module.exports = router;
