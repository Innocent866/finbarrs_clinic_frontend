const Student = require('../models/studentModel');

// @desc    Get all students
// @route   GET /api/students
// @access  Private
const getStudents = async (req, res) => {
    const students = await Student.find({});
    res.json(students);
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private
const getStudentById = async (req, res) => {
    const student = await Student.findById(req.params.id);
    if (student) {
        res.json(student);
    } else {
        res.status(404).json({ message: 'Student not found' });
    }
};

// @desc    Create a student
// @route   POST /api/students
// @access  Private/Admin (or Nurse too depending on requirements, let's allow both for now or restrict later)
//          Prompt says CRUD for Students, usually Admin but Nurses might need to add students if they aren't in system.
//          Let's allow Admin only for creation to keep it strict, or allow both. Docs say "User Roles: Admin... CRUD for students".
const createStudent = async (req, res) => {
    const { fullName, admissionNo, class: studentClass, studentType, bloodGroup, genotype, allergies, chronicCondition, parentPhone } = req.body;

    const studentExists = await Student.findOne({ admissionNo });
    if (studentExists) {
        res.status(400).json({ message: 'Student with this Admission No already exists' });
        return;
    }

    const student = await Student.create({
        fullName, admissionNo, class: studentClass, studentType, bloodGroup, genotype, allergies, chronicCondition, parentPhone
    });

    if (student) {
        res.status(201).json(student);
    } else {
        res.status(400).json({ message: 'Invalid student data' });
    }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private/Admin
const updateStudent = async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (student) {
        student.fullName = req.body.fullName || student.fullName;
        student.admissionNo = req.body.admissionNo || student.admissionNo;
        student.class = req.body.class || student.class;
        student.studentType = req.body.studentType || student.studentType;
        student.bloodGroup = req.body.bloodGroup || student.bloodGroup;
        student.genotype = req.body.genotype || student.genotype;
        student.allergies = req.body.allergies || student.allergies;
        student.chronicCondition = req.body.chronicCondition || student.chronicCondition;
        student.parentPhone = req.body.parentPhone || student.parentPhone;

        const updatedStudent = await student.save();
        res.json(updatedStudent);
    } else {
        res.status(404).json({ message: 'Student not found' });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
const deleteStudent = async (req, res) => {
    const student = await Student.findById(req.params.id);

    if (student) {
        await student.deleteOne();
        res.json({ message: 'Student removed' });
    } else {
        res.status(404).json({ message: 'Student not found' });
    }
};

module.exports = { getStudents, getStudentById, createStudent, updateStudent, deleteStudent };
