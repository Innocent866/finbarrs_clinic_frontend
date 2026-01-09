const Student = require('../models/studentModel');
const ClinicVisit = require('../models/clinicVisitModel');
const User = require('../models/userModel');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    const [totalStudents, totalVisits, totalNurses, boarders, dayStudents] = await Promise.all([
        Student.countDocuments(),
        ClinicVisit.countDocuments(),
        User.countDocuments({ role: 'NURSE' }),
        Student.countDocuments({ studentType: 'Boarder' }),
        Student.countDocuments({ studentType: 'Day' })
    ]);

    res.json({
        totalStudents,
        totalVisits,
        totalNurses,
        studentDistribution: {
            boarders,
            dayStudents
        }
    });
};

module.exports = { getDashboardStats };
