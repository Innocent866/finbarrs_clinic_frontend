const express = require('express');
const router = express.Router();
const { createVisit, getVisits, getVisitById, markAllAsViewed, getUnreadCount, reviewVisit } = require('../controllers/clinicVisitController');
const { protect, admin, doctor } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getVisits)
    .post(protect, createVisit);

// Order matters! Specific routes before :id
router.route('/unread').get(protect, admin, getUnreadCount);
router.route('/viewed').put(protect, admin, markAllAsViewed);
router.route('/:id').get(protect, getVisitById);
router.route('/:id/review').put(protect, doctor, reviewVisit);

module.exports = router;
