const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample user data with proper formats
const users = [
  // Students
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@student.veritas.edu',
    password: 'password123',
    role: 'student',
    department: 'CSC',
    matricNumber: 'VUG/CSC/22/001',
    gender: 'male',
    parentEmail: 'parent.doe@gmail.com',
    phoneNumber: '+2347012345678',
    year: '22'
  },
  {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@student.veritas.edu',
    password: 'password123',
    role: 'student',
    department: 'ENG',
    matricNumber: 'VUG/ENG/23/001',
    gender: 'female',
    parentEmail: 'parent.smith@gmail.com',
    phoneNumber: '+2347087654321',
    year: '23'
  },

  // Staff
  {
    firstName: 'Father',
    lastName: 'Michael',
    email: 'father.michael@veritas.edu',
    password: 'password123',
    role: 'staff',
    staffType: 'father',
    office: 'Boys Hostel Administration',
    staffId: 'VUG/STAFF/24/001',
    phoneNumber: '+2348012345678',
    year: '24'
  },
  {
    firstName: 'Sister',
    lastName: 'Mary',
    email: 'sister.mary@veritas.edu',
    password: 'password123',
    role: 'staff',
    staffType: 'sister',
    office: 'Girls Hostel Administration',
    staffId: 'VUG/STAFF/24/002',
    phoneNumber: '+2348087654321',
    year: '24'
  },
  {
    firstName: 'Admin',
    lastName: 'Hostel',
    email: 'hostel.admin@veritas.edu',
    password: 'password123',
    role: 'staff',
    staffType: 'hostel_admin',
    office: 'Hostel Administration Office',
    staffId: 'VUG/STAFF/24/003',
    phoneNumber: '+2348011223344',
    year: '24'
  },

  // Security
  {
    firstName: 'John',
    lastName: 'Guard',
    email: 'security@veritas.edu',
    password: 'password123',
    role: 'security',
    staffId: 'VUG/SEC/24/001',
    phoneNumber: '+2348055667788',
    year: '24'
  },

  // Dean
  {
    firstName: 'Dr. James',
    lastName: 'Wilson',
    email: 'dean@veritas.edu',
    password: 'password123',
    role: 'dean',
    staffId: 'VUG/DEAN/24/001',
    office: 'Dean of Student Affairs',
    phoneNumber: '+2348099887766',
    year: '24'
  },

  // Parent (with children references)
  {
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'parent.johnson@gmail.com',
    password: 'password123',
    role: 'parent',
    phoneNumber: '+2348033445566',
    // Children will be added after students are created
    children: []
  }
];

async function resetUsers() {
  try {
    // Delete all existing users
    console.log('Deleting all existing users...');
    await User.deleteMany({});
    console.log('All users deleted');

    // Create new users with proper formats
    console.log('Creating new users...');

    // First create all non-parent users
    const createdUsers = [];
    for (const userData of users.filter(u => u.role !== 'parent')) {
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const newUser = new User({
        ...userData,
        password: hashedPassword
      });
      
      const savedUser = await newUser.save();
      console.log(`Created ${savedUser.role}: ${savedUser.firstName} ${savedUser.lastName}`);
      createdUsers.push(savedUser);
    }

    // Create parent with children references
    const parentData = users.find(u => u.role === 'parent');
    const students = createdUsers.filter(u => u.role === 'student');
    
    // Add children to parent
    parentData.children = students.map(student => ({
      studentId: student._id,
      matricNumber: student.matricNumber,
      firstName: student.firstName,
      lastName: student.lastName
    }));

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parentData.password, salt);
    
    const newParent = new User({
      ...parentData,
      password: hashedPassword
    });
    
    const savedParent = await newParent.save();
    console.log(`Created parent: ${savedParent.firstName} ${savedParent.lastName} with ${savedParent.children.length} children`);

    console.log('All users created successfully');
    console.log('\nHere are the login credentials:');
    
    const allUsers = [...createdUsers, savedParent];
    allUsers.forEach(user => {
      console.log(`${user.role.toUpperCase()}: ${user.email} / password123`);
    });

  } catch (error) {
    console.error('Error resetting users:', error);
  } finally {
    mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
}

// Run the reset function
resetUsers(); 