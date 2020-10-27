const express = require('express');
const advanceResults = require('../middleware/advanceResults');
const Facility = require('../models/Facility');
const {
  getFacility,
  getFacilities,
  addFacility,
  updateFacility,
  deleteFacility,
} = require('../controllers/facilities');

const router = express.Router();

router
  .route('/')
  .get(advanceResults(Facility), getFacilities)
  .post(addFacility);

router
  .route('/:id')
  .get(getFacility)
  .put(updateFacility)
  .delete(deleteFacility);

module.exports = router;
