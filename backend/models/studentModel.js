const mongoose = require('mongoose');

const studentSchema = mongoose.Schema({
    fullName: { type: String, required: true },
    admissionNo: { type: String, required: true, unique: true },
    class: { type: String, required: true },
    studentType: { 
        type: String, 
        required: true, 
        enum: ['Boarder', 'Day'] 
    },
    bloodGroup: { type: String },
    genotype: { type: String },
    allergies: { type: String }, // Consider array if complex, but string is simple enough for now
    chronicCondition: { type: String },
    parentPhone: { type: String, required: true }
}, {
    timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;
