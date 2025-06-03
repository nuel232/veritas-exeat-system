const express = require('express');
const router = express.Router();
const ExeatRequest = require('../models/ExeatRequest');
const { auth } = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const QRCode = require('qrcode');

// Generate QR code for an exeat request
router.post('/generate-qr/:id', auth, async (req, res) => {
  try {
    const exeat = await ExeatRequest.findById(req.params.id);
    
    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }
    
    // Only generate QR if exeat is approved
    if (exeat.status !== 'approved') {
      return res.status(400).json({ message: 'Cannot generate QR code for unapproved exeat' });
    }
    
    // Generate verification URL
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BASE_URL 
      : 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify/${exeat._id}`;
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
    
    // Save QR code to exeat
    exeat.qrCode = qrCodeDataUrl;
    await exeat.save();
    
    res.json({ qrCode: qrCodeDataUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify exeat by ID
router.get('/:id', async (req, res) => {
  try {
    const exeat = await ExeatRequest.findById(req.params.id)
      .populate('student', 'firstName lastName matricNumber department')
      .select('status departureDate returnDate destination reason checkIn checkOut');
    
    if (!exeat) {
      return res.status(404).json({ message: 'Exeat not found' });
    }
    
    res.json({
      status: exeat.status,
      studentName: `${exeat.student.firstName} ${exeat.student.lastName}`,
      matricNumber: exeat.student.matricNumber,
      department: exeat.student.department,
      departureDate: exeat.departureDate,
      returnDate: exeat.returnDate,
      destination: exeat.destination,
      reason: exeat.reason,
      checkedOut: exeat.checkOut.status,
      checkedIn: exeat.checkIn.status
    });
  } catch (error) {
    console.error('Error verifying exeat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark student check-out
router.post('/check-out/:id', [
  auth,
  check('securityId', 'Security ID is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { securityId } = req.body;
    const exeatId = req.params.id;
    
    const exeat = await ExeatRequest.findById(exeatId);
    
    if (!exeat) {
      return res.status(404).json({ message: 'Exeat not found' });
    }
    
    // Verify it's an approved exeat
    if (exeat.status !== 'approved') {
      return res.status(400).json({ message: 'This exeat has not been approved' });
    }
    
    // Verify it hasn't already been checked out
    if (exeat.checkOut.status) {
      return res.status(400).json({ message: 'Student has already checked out' });
    }
    
    // Mark as checked out
    exeat.checkOut = {
      status: true,
      time: Date.now(),
      by: securityId
    };
    
    await exeat.save();
    
    res.json({ 
      message: 'Student checked out successfully', 
      checkOut: exeat.checkOut 
    });
  } catch (error) {
    console.error('Error checking out student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark student check-in
router.post('/check-in/:id', [
  auth,
  check('securityId', 'Security ID is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { securityId } = req.body;
    const exeatId = req.params.id;
    
    const exeat = await ExeatRequest.findById(exeatId);
    
    if (!exeat) {
      return res.status(404).json({ message: 'Exeat not found' });
    }
    
    // Verify it's an approved exeat
    if (exeat.status !== 'approved') {
      return res.status(400).json({ message: 'This exeat has not been approved' });
    }
    
    // Verify student has checked out
    if (!exeat.checkOut.status) {
      return res.status(400).json({ message: 'Student has not checked out yet' });
    }
    
    // Verify student hasn't already checked in
    if (exeat.checkIn.status) {
      return res.status(400).json({ message: 'Student has already checked in' });
    }
    
    // Mark as checked in
    exeat.checkIn = {
      status: true,
      time: Date.now(),
      by: securityId
    };
    
    await exeat.save();
    
    // Check if student is returning late
    const returnDate = new Date(exeat.returnDate);
    const currentDate = new Date();
    const isLate = currentDate > returnDate;
    
    res.json({ 
      message: 'Student checked in successfully', 
      checkIn: exeat.checkIn,
      isLate: isLate
    });
  } catch (error) {
    console.error('Error checking in student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Search exeat by student matriculation number
router.post('/search', [
  auth,
  check('matricNumber', 'Matriculation Number is required').not().isEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { matricNumber } = req.body;
    
    // Find student by matric number
    const student = await require('../models/User').findOne({ 
      matricNumber,
      role: 'student'
    });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Find active exeat requests for this student
    const exeats = await ExeatRequest.find({
      student: student._id,
      status: 'approved',
      returnDate: { $gte: new Date() }
    }).select('_id departureDate returnDate destination checkIn checkOut');
    
    if (exeats.length === 0) {
      return res.status(404).json({ message: 'No active exeat found for this student' });
    }
    
    res.json({ student: {
      name: `${student.firstName} ${student.lastName}`,
      matricNumber: student.matricNumber,
      department: student.department
    }, exeats });
  } catch (error) {
    console.error('Error searching exeat:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router; 