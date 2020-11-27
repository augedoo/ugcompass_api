const express = require('express');
const Facility = require('../models/Facility');
const {
  getFacility,
  getFacilities,
  addFacility,
  updateFacility,
  deleteFacility,
  facilityPhotosUpload,
  deleteFacilityPhoto,
} = require('../controllers/facilities');
const roomsRouter = require('../routes/rooms');
const reviewsRouter = require('../routes/reviews');

const router = express.Router();

// Re-route into other routes
router.use('/:facilityId/rooms', roomsRouter);
router.use('/:facilityId/reviews', reviewsRouter);

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/is-auth');

router
  .route('/')
  .get(advancedResults(Facility, 'numberOfReviews numberOfRooms'), getFacilities)
  .post(protect, authorize('admin', 'publisher'), addFacility);

router
  .route('/:id')
  .get(getFacility)
  .put(protect, authorize('admin', 'publisher'), updateFacility)
  .delete(protect, authorize('admin', 'publisher'), deleteFacility);

router
  .route('/:id/photos')
  .put(protect, authorize('admin', 'publisher'), facilityPhotosUpload);

router
  .route('/:id/photos/:photoname')
  .put(protect, authorize('admin', 'publisher'), deleteFacilityPhoto);

module.exports = router;
