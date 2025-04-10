const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Import models
const User = require('../models/User');
const ExeatRequest = require('../models/ExeatRequest');

const seedData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await ExeatRequest.deleteMany({});

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@veritas.edu.ng',
      password: adminPassword,
      role: 'admin',
      department: 'Administration'
    });

    // Create student users
    const studentPassword = await bcrypt.hash('student123', 10);
    const student1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@veritas.edu.ng',
      password: studentPassword,
      role: 'student',
      department: 'Computer Science',
      matricNumber: 'VUG/CSC/19/0001',
      phoneNumber: '08012345678'
    });

    const student2 = await User.create({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@veritas.edu.ng',
      password: studentPassword,
      role: 'student',
      department: 'Computer Science',
      matricNumber: 'VUG/CSC/19/0002',
      phoneNumber: '08087654321'
    });

    // Create sample exeat requests
    await ExeatRequest.create({
      student: student1._id,
      reason: 'Medical appointment',
      destination: 'General Hospital, Abuja',
      departureDate: new Date('2024-03-15'),
      returnDate: new Date('2024-03-17'),
      status: 'pending',
      emergencyContact: {
        name: 'Robert Doe',
        phone: '08023456789',
        relationship: 'Father'
      }
    });

    await ExeatRequest.create({
      student: student2._id,
      reason: 'Family emergency',
      destination: 'Lagos',
      departureDate: new Date('2024-03-20'),
      returnDate: new Date('2024-03-25'),
      status: 'approved',
      emergencyContact: {
        name: 'Mary Smith',
        phone: '08034567890',
        relationship: 'Mother'
      }
    });

    console.log('Sample data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 