const mongoose = require('mongoose');

const ExeatRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  destination: {
    type: String,
    required: true
  },
  departureDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.departureDate;
      },
      message: 'Return date must be after departure date'
    }
  },
  status: {
    type: String,
    enum: ['pending_parent', 'pending_dean', 'pending_staff', 'approved', 'rejected'],
    default: 'pending_parent'
  },
  emergencyContact: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    relationship: {
      type: String,
      required: true
    }
  },
  // File attachments (PDFs, images, videos)
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String, // Cloudinary URL or file path
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Parent approval step
  parentApproval: {
    approved: {
      type: Boolean,
      default: false
    },
    approvalDate: {
      type: Date
    },
    comments: {
      type: String
    },
    approvalToken: {
      type: String
    },
    parentEmail: {
      type: String
    },
    emailSent: {
      type: Boolean,
      default: false
    }
  },
  // Dean/Staff approval step
  staffApproval: {
    approved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approverRole: {
      type: String,
      enum: ['dean', 'staff']
    },
    approverType: {
      type: String,
      enum: ['father', 'sister', 'hostel_admin', 'dean']
    },
    approvalDate: {
      type: Date
    },
    comments: {
      type: String
    }
  },
  // QR Code for security scanning
  qrCode: {
    code: String, // The QR code data
    imageUrl: String, // QR code image URL
    generatedAt: Date
  },
  // Check-out information
  checkOut: {
    status: {
      type: Boolean,
      default: false
    },
    time: {
      type: Date
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    securityNotes: String,
    location: String // Security gate/checkpoint
  },
  // Check-in information
  checkIn: {
    status: {
      type: Boolean,
      default: false
    },
    time: {
      type: Date
    },
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    securityNotes: String,
    location: String,
    lateReturn: {
      type: Boolean,
      default: false
    },
    lateReturnReason: String
  },
  // Email notifications tracking
  notifications: {
    parentEmailSent: {
      type: Boolean,
      default: false
    },
    staffNotificationSent: {
      type: Boolean,
      default: false
    },
    approvalNotificationSent: {
      type: Boolean,
      default: false
    },
    remindersSent: {
      type: Number,
      default: 0
    }
  },
  comments: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better query performance
ExeatRequestSchema.index({ student: 1, status: 1 });
ExeatRequestSchema.index({ departureDate: 1, returnDate: 1 });
ExeatRequestSchema.index({ status: 1, createdAt: -1 });
ExeatRequestSchema.index({ 'qrCode.code': 1 });
ExeatRequestSchema.index({ 'parentApproval.approvalToken': 1 });

// Update the updatedAt field on save
ExeatRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Validate dates
  if (this.returnDate <= this.departureDate) {
    next(new Error('Return date must be after departure date'));
  }
  next();
});

// Method to check if the request can be approved/rejected
ExeatRequestSchema.methods.canUpdateStatus = function() {
  return ['pending_parent', 'pending_dean', 'pending_staff'].includes(this.status);
};

// Method to determine next approver based on student gender and current status
ExeatRequestSchema.methods.getNextApprover = async function() {
  if (this.status === 'pending_parent') {
    return 'parent';
  }
  
  if (this.status === 'pending_dean' || this.status === 'pending_staff') {
    // Get student to determine gender
    await this.populate('student');
    const student = this.student;
    
    // Find appropriate approver based on student gender
    const User = mongoose.model('User');
    
    // First try to find dean
    const dean = await User.findOne({ role: 'dean' });
    if (dean) return dean;
    
    // If no dean, find appropriate staff based on gender
    let staffQuery = { role: 'staff' };
    if (student.gender === 'male') {
      staffQuery.staffType = 'father';
    } else if (student.gender === 'female') {
      staffQuery.staffType = 'sister';
    } else {
      staffQuery.staffType = 'hostel_admin';
    }
    
    const staff = await User.findOne(staffQuery);
    return staff;
  }
  
  return null;
};

// Method to check if request is overdue for return
ExeatRequestSchema.methods.isOverdue = function() {
  return new Date() > this.returnDate && !this.checkIn.status;
};

// Method to calculate days until departure/return
ExeatRequestSchema.methods.getDaysUntilDeparture = function() {
  const now = new Date();
  const departure = new Date(this.departureDate);
  const diffTime = departure - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

ExeatRequestSchema.methods.getDaysUntilReturn = function() {
  const now = new Date();
  const returnDate = new Date(this.returnDate);
  const diffTime = returnDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

module.exports = mongoose.model('ExeatRequest', ExeatRequestSchema); 