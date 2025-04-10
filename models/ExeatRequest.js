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
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
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
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvalDate: {
    type: Date
  },
  comments: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add index for better query performance
ExeatRequestSchema.index({ student: 1, status: 1 });
ExeatRequestSchema.index({ departureDate: 1, returnDate: 1 });

// Pre-save middleware to validate dates
ExeatRequestSchema.pre('save', function(next) {
  if (this.returnDate <= this.departureDate) {
    next(new Error('Return date must be after departure date'));
  }
  next();
});

// Method to check if the request can be approved/rejected
ExeatRequestSchema.methods.canUpdateStatus = function() {
  return this.status === 'pending';
};

module.exports = mongoose.model('ExeatRequest', ExeatRequestSchema); 