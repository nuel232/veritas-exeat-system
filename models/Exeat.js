const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExeatSchema = new Schema({
  student: {
    type: Schema.Types.ObjectId,
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
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired', 'used'],
    default: 'pending'
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
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
  attachments: [{
    type: String // URLs to uploaded files
  }],
  used: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
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

// Update the updatedAt field before saving
ExeatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to check if exeat is past return date
ExeatSchema.pre('find', async function() {
  const currentDate = new Date();
  await mongoose.model('Exeat').updateMany(
    { 
      status: 'approved', 
      returnDate: { $lt: currentDate },
      used: false
    },
    { $set: { status: 'expired' } }
  );
});

// Static method to check if an exeat is valid
ExeatSchema.statics.isValid = async function(exeatId) {
  const exeat = await this.findById(exeatId);
  
  if (!exeat) {
    return { valid: false, message: 'Exeat not found' };
  }
  
  if (exeat.status !== 'approved') {
    return { valid: false, message: `Exeat is ${exeat.status}` };
  }
  
  if (exeat.used) {
    return { valid: false, message: 'Exeat has already been used' };
  }
  
  const currentDate = new Date();
  if (currentDate > exeat.returnDate) {
    await this.findByIdAndUpdate(exeatId, { status: 'expired' });
    return { valid: false, message: 'Exeat has expired' };
  }
  
  if (currentDate < exeat.departureDate) {
    return { valid: false, message: 'Exeat not yet valid (before departure date)' };
  }
  
  return { valid: true, message: 'Exeat is valid' };
};

// Method to mark exeat as used
ExeatSchema.statics.markAsUsed = async function(exeatId) {
  const validity = await this.isValid(exeatId);
  if (!validity.valid) {
    return { success: false, message: validity.message };
  }
  
  await this.findByIdAndUpdate(exeatId, { 
    used: true, 
    usedAt: new Date(),
    status: 'used'
  });
  
  return { success: true, message: 'Exeat marked as used' };
};

module.exports = mongoose.model('Exeat', ExeatSchema); 