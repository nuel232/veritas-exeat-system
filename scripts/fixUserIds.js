const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function fixUserIds() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Track used XXXX for each type
  const usedStudentXXXX = new Set();
  const usedStaffSecurityXXXX = new Set();

  // Helper to generate next available XXXX
  const getNextXXXX = (usedSet) => {
    let num = 1;
    while (usedSet.has(num.toString().padStart(4, '0'))) {
      num++;
    }
    return num.toString().padStart(4, '0');
  };

  // Update students
  const students = await User.find({ role: 'student' });
  for (const student of students) {
    // Extract or assign new XXXX
    let match = student.matricNumber && student.matricNumber.match(/\/(\d{4})$/);
    let xxxx = match ? match[1] : null;
    if (!xxxx || usedStudentXXXX.has(xxxx)) {
      xxxx = getNextXXXX(usedStudentXXXX);
    }
    usedStudentXXXX.add(xxxx);
    // Build new matricNumber
    const dept = student.department || 'CSC';
    const year = student.year || '24';
    student.matricNumber = `VUG/${dept}/${year}/${xxxx}`;
    student.studentXXXX = xxxx;
    await student.save();
    console.log(`Updated student: ${student.firstName} ${student.lastName} -> ${student.matricNumber}`);
  }

  // Update staff and security
  const staffSec = await User.find({ role: { $in: ['staff', 'security'] } });
  for (const user of staffSec) {
    // Extract or assign new XXXX
    let match = user.staffId && user.staffId.match(/\/(\d{4})$/);
    let xxxx = match ? match[1] : null;
    if (!xxxx || usedStaffSecurityXXXX.has(xxxx)) {
      xxxx = getNextXXXX(usedStaffSecurityXXXX);
    }
    usedStaffSecurityXXXX.add(xxxx);
    // Build new staffId
    let prefix = user.role === 'staff' ? 'STAFF' : 'SEC';
    user.staffId = `${prefix}/${xxxx}`;
    user.staffSecurityXXXX = xxxx;
    await user.save();
    console.log(`Updated ${user.role}: ${user.firstName} ${user.lastName} -> ${user.staffId}`);
  }

  // Update dean
  const dean = await User.findOne({ role: 'dean' });
  if (dean) {
    dean.staffId = 'DEAN/0001';
    await dean.save();
    console.log(`Updated dean: ${dean.firstName} ${dean.lastName} -> ${dean.staffId}`);
  }

  await mongoose.disconnect();
  console.log('All users updated and MongoDB disconnected');
}

fixUserIds(); 