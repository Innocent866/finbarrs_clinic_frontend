// using native fetch (Node 18+)

// If node-fetch is not available, we can use built-in fetch if Node >= 18.
// We will assume modern Node.js environment.

const BASE_URL = 'http://localhost:5000/api';

async function verify() {
    try {
        console.log('--- Starting Backend Verification ---');

        // 1. Register Admin (Use direct DB seeding or simplified register flow if allowed, 
        // but our register endpoint is protected. So we might need to seed an admin first directly in DB or use a temporary public register.)
        // Actually, create-admin script is better. But I'll modify the loop to register if no users exist? 
        // Or I can just manually insert one user in this script using Mongoose before starting API calls.
        
        // BETTER APPROACH: Use Mongoose to seed an Admin, then test API.
        const mongoose = require('mongoose');
        const User = require('./models/userModel');
        require('dotenv').config();

        await mongoose.connect(process.env.MONGO_URI);
        console.log('DB Connected for Seeding');

        // Clear DB for fresh test
        await User.deleteMany({});
        const Student = require('./models/studentModel');
        await Student.deleteMany({});
        const ClinicVisit = require('./models/clinicVisitModel');
        await ClinicVisit.deleteMany({});

        const adminUser = await User.create({
            fullName: 'Super Admin',
            email: 'admin@school.com',
            password: 'password123',
            role: 'ADMIN'
        });
        console.log('Admin seeded');

        // 2. Login as Admin
        const loginRes = await fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@school.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        console.log('Login Admin:', loginRes.status === 200 ? 'SUCCESS' : 'FAILED', loginData.token ? '(Token received)' : '');
        const adminToken = loginData.token;

        // 3. Create Student as Admin
        const studentRes = await fetch(`${BASE_URL}/students`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                fullName: 'John Doe',
                admissionNo: 'ST001',
                class: 'JSS1',
                studentType: 'Boarder',
                bloodGroup: 'O+',
                genotype: 'AA',
                allergies: 'Peanuts',
                chronicCondition: 'None',
                parentPhone: '08012345678'
            })
        });
        const studentData = await studentRes.json();
        console.log('Create Student:', studentRes.status === 201 ? 'SUCCESS' : 'FAILED', studentData._id);

        // 4. Create Nurse as Admin
        const nurseRes = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            },
            body: JSON.stringify({
                fullName: 'Nurse Betty',
                email: 'nurse@school.com',
                password: 'password123',
                role: 'NURSE'
            })
        });
        const nurseData = await nurseRes.json();
        console.log('Create Nurse:', nurseRes.status === 201 ? 'SUCCESS' : 'FAILED', nurseData.email);

        // 5. Login as Nurse
        const nurseLoginRes = await fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'nurse@school.com', password: 'password123' })
        });
        const nurseLoginData = await nurseLoginRes.json();
        const nurseToken = nurseLoginData.token;
        console.log('Login Nurse:', nurseLoginRes.status === 200 ? 'SUCCESS' : 'FAILED');

        // 6. Create Clinic Visit as Nurse
        const visitRes = await fetch(`${BASE_URL}/visits`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${nurseToken}`
            },
            body: JSON.stringify({
                studentId: studentData._id,
                symptoms: 'Headache and fever',
                diagnosis: 'Malaria',
                treatment: 'Anti-malarial drugs',
                drugs: 'Lonart',
                outcome: 'Sent to Hostel'
            })
        });
        const visitData = await visitRes.json();
        console.log('Create Visit:', visitRes.status === 201 ? 'SUCCESS' : 'FAILED', visitData._id);

        // 7. Get Dashboard Stats as Admin
        const dashboardRes = await fetch(`${BASE_URL}/dashboard`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${adminToken}`
            }
        });
        const dashboardData = await dashboardRes.json();
        console.log('Dashboard Stats:', dashboardRes.status === 200 ? 'SUCCESS' : 'FAILED', dashboardData);

        // Cleanup connection
        // await mongoose.disconnect(); // Don't disconnect immediately if requests are flying, but here we await everything.
        // Actually, we are running this script separate from server so we need to close mongoose connection used for seeding.
        await mongoose.connection.close();
        
    } catch (error) {
        console.error('Verification Error:', error);
    }
}

verify();
