const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ExeatRequest = require('../models/ExeatRequest');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Test data
const users = [
  {
    firstName: 'Student',
    lastName: 'User',
    email: 'student@example.com',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    matricNumber: 'CS123456',
    phoneNumber: '1234567890',
    parentEmail: 'parent@example.com',
    personalEmail: 'student.personal@example.com',
    year: '2023',
    gender: 'male'
  },
  {
    firstName: 'Test',
    lastName: 'Student',
    email: 'teststudent@example.com',
    password: 'password123',
    role: 'student',
    department: 'Computer Science',
    matricNumber: 'CS999999',
    phoneNumber: '1234567890',
    parentEmail: 'parent@example.com',
    personalEmail: 'teststudent.personal@example.com',
    year: '2023',
    gender: 'male'
  },
  {
    firstName: 'Dean',
    lastName: 'User',
    email: 'dean@example.com',
    password: 'password123',
    role: 'dean',
    phoneNumber: '0987654321',
    office: 'Dean Office',
    staffId: 'DEAN001',
    personalEmail: 'dean.personal@example.com',
    year: '2023',
    gender: 'male'
  },
  {
    firstName: 'Security',
    lastName: 'User',
    email: 'security@example.com',
    password: 'password123',
    role: 'security',
    phoneNumber: '5555555555',
    office: 'Main Gate',
    staffId: 'SEC001',
    personalEmail: 'security.personal@example.com',
    year: '2023',
    gender: 'male'
  }
];

// Connect to MongoDB
async function seedDatabase() {
  try {
    // Connect to MongoDB
    const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/exeat_system';
    console.log(`Connecting to MongoDB at: ${dbUri}`);
    
    await mongoose.connect(dbUri);
    console.log('Connected to MongoDB');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await ExeatRequest.deleteMany({});

    // Create users with hashed passwords
    console.log('Creating test users...');
    const createdUsers = [];
    
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = new User({
        ...user,
        password: hashedPassword
      });
      
      const savedUser = await newUser.save();
      createdUsers.push(savedUser);
      console.log(`Created ${savedUser.role}: ${savedUser.email}`);
    }

    // Find the student and dean for exeat requests
    const student = createdUsers.find(user => user.role === 'student');
    const dean = createdUsers.find(user => user.role === 'dean');

    // Create sample exeat requests
    console.log('Creating sample exeat requests...');
    
    // Pending parent approval
    const pendingParentExeat = new ExeatRequest({
      student: student._id,
      reason: 'Family emergency',
      destination: 'Home',
      departureDate: new Date(Date.now() + 86400000), // Tomorrow
      returnDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      status: 'pending_parent',
      emergencyContact: {
        name: 'Parent Name',
        phone: '1122334455',
        relationship: 'Parent'
      },
      parentApproval: {
        approvalToken: 'test-token-1'
      }
    });
    
    await pendingParentExeat.save();
    console.log('Created exeat request: pending parent approval');
    
    // Pending dean approval
    const pendingDeanExeat = new ExeatRequest({
      student: student._id,
      reason: 'Medical appointment',
      destination: 'Hospital',
      departureDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
      returnDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
      status: 'pending_dean',
      emergencyContact: {
        name: 'Parent Name',
        phone: '1122334455',
        relationship: 'Parent'
      },
      parentApproval: {
        approved: true,
        approvalDate: new Date(),
        comments: 'Approved by parent',
        approvalToken: 'test-token-2'
      }
    });
    
    await pendingDeanExeat.save();
    console.log('Created exeat request: pending dean approval');
    
    // Approved exeat
    const approvedExeat = new ExeatRequest({
      student: student._id,
      reason: 'Academic conference',
      destination: 'Conference Center',
      departureDate: new Date(Date.now() + 86400000 * 10), // 10 days from now
      returnDate: new Date(Date.now() + 86400000 * 14), // 14 days from now
      status: 'approved',
      emergencyContact: {
        name: 'Parent Name',
        phone: '1122334455',
        relationship: 'Parent'
      },
      parentApproval: {
        approved: true,
        approvalDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
        comments: 'Approved by parent',
        approvalToken: 'test-token-3'
      },
      deanApproval: {
        approved: true,
        approvedBy: dean._id,
        approvalDate: new Date(Date.now() - 86400000), // 1 day ago
        comments: 'Approved by dean'
      },
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=='
    });
    
    await approvedExeat.save();
    console.log('Created exeat request: approved');
    
    // Rejected exeat
    const rejectedExeat = new ExeatRequest({
      student: student._id,
      reason: 'Personal trip',
      destination: 'Beach resort',
      departureDate: new Date(Date.now() + 86400000 * 20), // 20 days from now
      returnDate: new Date(Date.now() + 86400000 * 25), // 25 days from now
      status: 'rejected',
      emergencyContact: {
        name: 'Parent Name',
        phone: '1122334455',
        relationship: 'Parent'
      },
      parentApproval: {
        approved: true,
        approvalDate: new Date(Date.now() - 86400000 * 5), // 5 days ago
        comments: 'Approved by parent',
        approvalToken: 'test-token-4'
      },
      deanApproval: {
        approved: false,
        approvedBy: dean._id,
        approvalDate: new Date(Date.now() - 86400000 * 3), // 3 days ago
        comments: 'Conflicts with academic schedule'
      }
    });
    
    await rejectedExeat.save();
    console.log('Created exeat request: rejected');

    console.log('Database seeded successfully!');
    mongoose.connection.close();
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase(); 