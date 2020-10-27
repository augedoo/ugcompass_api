const express = require('express');
const Facility = require('../models/Facility');
const {
  getFacility,
  getFacilities,
  addFacility,
  updateFacility,
  deleteFacility,
} = require('../controllers/facilities');
const roomRouter = require('../routes/rooms');

const router = express.Router();

// Re-route into other routes
router.use('/:facilityId/rooms', roomRouter);

const advancedResults = require('../middleware/advancedResults');

router
  .route('/')
  .get(advancedResults(Facility), getFacilities)
  .post(addFacility);

router
  .route('/:id')
  .get(getFacility)
  .put(updateFacility)
  .delete(deleteFacility);

module.exports = router;
