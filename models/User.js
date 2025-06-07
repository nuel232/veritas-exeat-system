const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['student', 'parent', 'dean', 'security', 'staff'],
    default: 'student'
  },
  department: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  matricNumber: {
    type: String,
    required: function() {
      return this.role === 'student';
    },
    unique: true,
    sparse: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: function() {
      return this.role === 'student';
    }
  },
  phoneNumber: {
    type: String,
    required: true
  },
  parentEmail: {
    type: String,
    required: function() {
      return this.role === 'student';
    }
  },
  office: {
    type: String,
    required: function() {
      return this.role === 'staff';
    }
  },
  staffId: {
    type: String,
    required: function() {
      return ['staff', 'dean', 'security'].includes(this.role);
    },
    unique: true,
    sparse: true
  },
  staffType: {
    type: String,
    enum: ['father', 'sister', 'hostel_admin'],
    required: function() {
      return this.role === 'staff';
    }
  },
  year: {
    type: String,
    required: function() {
      return ['student', 'staff', 'dean', 'security'].includes(this.role);
    }
  },
  children: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    matricNumber: String,
    firstName: String,
    lastName: String
  }],
  approvalToken: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
UserSchema.index({ matricNumber: 1 });
UserSchema.index({ staffId: 1 });
UserSchema.index({ parentEmail: 1 });
UserSchema.index({ role: 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user can approve exeat for a specific student
UserSchema.methods.canApproveFor = function(studentGender) {
  if (this.role === 'dean') return true;
  if (this.role === 'staff') {
    if (this.staffType === 'father' && studentGender === 'male') return true;
    if (this.staffType === 'sister' && studentGender === 'female') return true;
    if (this.staffType === 'hostel_admin') return true;
  }
  return false;
};

module.exports = mongoose.model('User', UserSchema); 