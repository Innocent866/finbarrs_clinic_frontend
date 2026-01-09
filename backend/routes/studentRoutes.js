const express = require('express');
const router = express.Router();
const { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } = require('../controllers/studentController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin can do full CRUD. Nurses can probably view.
// Requirement: "Student list & student health profile" for both.
// Requirement: "CRUD for students" listed under Backend Features generally, "Admin Dashboard" specifically mentions "Can view all...". 
// Let's allow Nurse to View, Admin to CRUD.

router.route('/')
    .get(protect, getStudents)
    .post(protect, admin, createStudent);

router.route('/:id')
    .get(protect, getStudentById)
    .put(protect, admin, updateStudent)
    .delete(protect, admin, deleteStudent);

module.exports = router;
