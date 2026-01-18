const express = require('express');
const router = express.Router();
const { createVisit, getVisits, getVisitById, markAllAsViewed, getUnreadCount, reviewVisit, addFollowUpReport, updateClinicalDetails, updateVisit } = require('../controllers/clinicVisitController');
const { protect, admin, doctor, nurse } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getVisits)
    .post(protect, nurse, createVisit);

// Order matters! Specific routes before :id
router.route('/unread').get(protect, admin, getUnreadCount);
router.route('/viewed').put(protect, admin, markAllAsViewed);
router.route('/:id').get(protect, getVisitById).put(protect, nurse, updateVisit);
router.route('/:id/review')
    .put(protect, doctor, reviewVisit);

router.route('/:id/clinical-details')
    .put(protect, doctor, updateClinicalDetails);

router.route('/:id/follow-up-report')
    .put(protect, nurse, addFollowUpReport);

module.exports = router;
