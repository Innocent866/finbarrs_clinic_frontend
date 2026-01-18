const ClinicVisit = require('../models/clinicVisitModel');

// @desc    Create a new clinic visit
// @route   POST /api/visits
// @access  Private/Nurse
const createVisit = async (req, res) => {
    const { studentId, symptoms, diagnosis, treatment, drugs, outcome, temperature, spo2, pulse, weight, followUpRequired, followUpDate, followUpNote } = req.body;

    // Could add validation to check if student exists here, but ref handles it.
    // If studentId is invalid, Mongoose will likely throw error or we check.

    const visit = await ClinicVisit.create({
        studentId,
        symptoms,
        diagnosis,
        treatment,
        drugs,
        outcome,
        temperature,
        spo2,
        pulse,
        weight,
        followUpRequired,
        followUpDate,
        followUpNote,
        attendedBy: req.user._id
    });

    if (visit) {
        res.status(201).json(visit);
    } else {
        res.status(400).json({ message: 'Invalid visit data' });
    }
};

// @desc    Get all visits or visits for a student
// @route   GET /api/visits?studentId=x
// @access  Private
const getVisits = async (req, res) => {
    const { studentId } = req.query;
    let query = {};
    
    if (studentId) {
        query = { studentId };
    }

    const visits = await ClinicVisit.find(query)
        .populate('studentId', 'fullName admissionNo class')
        .populate('attendedBy', 'fullName')
        .populate('reviewedBy', 'fullName')
        .sort({ createdAt: -1 });
        
    res.json(visits);
};

// @desc    Get single visit
// @route   GET /api/visits/:id
// @access  Private
const getVisitById = async (req, res) => {
    const visit = await ClinicVisit.findById(req.params.id)
        .populate('studentId')
        .populate('attendedBy', 'fullName')
        .populate('reviewedBy', 'fullName')
        .populate('followUpReports.addedBy', 'fullName');

    if (visit) {
        res.json(visit);
    } else {
        res.status(404).json({ message: 'Visit not found' });
    }
};

// @desc    Mark all visits as viewed
// @route   PUT /api/visits/viewed
// @access  Private/Admin
const markAllAsViewed = async (req, res) => {
    await ClinicVisit.updateMany({ isViewed: false }, { isViewed: true });
    res.json({ message: 'All visits marked as viewed' });
};

// @desc    Get count of unread visits
// @route   GET /api/visits/unread
// @access  Private/Admin
const getUnreadCount = async (req, res) => {
    const count = await ClinicVisit.countDocuments({ isViewed: false });
    res.json({ count });
};

// @desc    Review a visit
// @route   PUT /api/visits/:id/review
// @access  Private/Doctor
const reviewVisit = async (req, res) => {
    const { doctorComment } = req.body;
    const visit = await ClinicVisit.findById(req.params.id);

    if (visit) {
        visit.doctorComment = doctorComment;
        visit.isReviewed = true;
        visit.reviewedBy = req.user._id;
        visit.reviewedAt = Date.now();

        const updatedVisit = await visit.save();
        res.json(updatedVisit);
    } else {
        res.status(404).json({ message: 'Visit not found' });
    }
};

// @desc    Add follow-up report
// @route   PUT /api/visits/:id/follow-up-report
// @access  Private/Nurse/Doctor
const addFollowUpReport = async (req, res) => {
    const { report } = req.body;
    const visit = await ClinicVisit.findById(req.params.id);

    if (visit) {
        visit.followUpReports.push({
            note: report,
            addedBy: req.user._id
        });
        visit.isFollowUpCompleted = true;
        
        const updatedVisit = await visit.save();
        res.json(updatedVisit);
    } else {
        res.status(404).json({ message: 'Visit not found' });
    }
};


// @desc    Update clinical details (Doctor only)
// @route   PUT /api/visits/:id/clinical-details
// @access  Private/Doctor
const updateClinicalDetails = async (req, res) => {
    const { diagnosis, drugs } = req.body;
    const visit = await ClinicVisit.findById(req.params.id);

    if (visit) {
        visit.diagnosis = diagnosis || visit.diagnosis;
        visit.drugs = drugs || visit.drugs;
        
        const updatedVisit = await visit.save();
        res.json(updatedVisit);
    } else {
        res.status(404).json({ message: 'Visit not found' });
    }

};

// @desc    Update entire visit (Nurse only)
// @route   PUT /api/visits/:id
// @access  Private/Nurse
const updateVisit = async (req, res) => {
    const { 
        symptoms, diagnosis, treatment, drugs, outcome, 
        temperature, spo2, pulse, weight, 
        followUpRequired, followUpDate, followUpNote 
    } = req.body;

    const visit = await ClinicVisit.findById(req.params.id);

    if (visit) {
        visit.symptoms = symptoms || visit.symptoms;
        visit.diagnosis = diagnosis || visit.diagnosis;
        visit.treatment = treatment || visit.treatment;
        visit.drugs = drugs || visit.drugs;
        visit.outcome = outcome || visit.outcome;
        
        visit.temperature = temperature !== undefined ? temperature : visit.temperature;
        visit.spo2 = spo2 !== undefined ? spo2 : visit.spo2;
        visit.pulse = pulse !== undefined ? pulse : visit.pulse;
        visit.weight = weight !== undefined ? weight : visit.weight;

        visit.followUpRequired = followUpRequired !== undefined ? followUpRequired : visit.followUpRequired;
        if (followUpDate) visit.followUpDate = followUpDate;
        if (followUpNote) visit.followUpNote = followUpNote;

        const updatedVisit = await visit.save();
        res.json(updatedVisit);
    } else {
        res.status(404).json({ message: 'Visit not found' });
    }
};

module.exports = { createVisit, getVisits, getVisitById, markAllAsViewed, getUnreadCount, reviewVisit, addFollowUpReport, updateClinicalDetails, updateVisit };
