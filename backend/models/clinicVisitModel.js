const mongoose = require('mongoose');

const clinicVisitSchema = mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Student'
    },
    symptoms: { type: String, required: true },
    diagnosis: { type: String, required: true },
    treatment: { type: String, required: true },
    drugs: { type: String },
    temperature: { type: Number },
    spo2: { type: Number },
    pulse: { type: Number },
    weight: { type: Number },
    outcome: {
        type: String,
        required: true,
        enum: ['Returned to Class', 'Sent to Hostel', 'Sent Home', 'Referred to Hospital', 'Under Observation']
    },
    attendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isViewed: {
        type: Boolean,
        default: false
    },
    doctorComment: {
        type: String
    },
    isReviewed: {
        type: Boolean,
        default: false
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date
    },
    followUpNote: {
        type: String
    },
    followUpReports: [{
        note: { type: String, required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }],
    isFollowUpCompleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

const ClinicVisit = mongoose.model('ClinicVisit', clinicVisitSchema);
module.exports = ClinicVisit;
