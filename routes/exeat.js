const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Exeat = require('../models/Exeat');
const User = require('../models/User');

// Create new exeat request
router.post('/', [
  auth,
  authorize('student'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('destination').notEmpty().withMessage('Destination is required'),
  body('departureDate').isISO8601().withMessage('Invalid departure date'),
  body('returnDate').isISO8601().withMessage('Invalid return date'),
  body('emergencyContact.name').notEmpty().withMessage('Emergency contact name is required'),
  body('emergencyContact.phone').notEmpty().withMessage('Emergency contact phone is required'),
  body('emergencyContact.relationship').notEmpty().withMessage('Emergency contact relationship is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exeat = new Exeat({
      ...req.body,
      student: req.user._id
    });

    await exeat.save();
    res.status(201).json(exeat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all exeat requests for a student
router.get('/my-requests', auth, authorize('student'), async (req, res) => {
  try {
    const exeats = await Exeat.find({ student: req.user._id })
      .sort({ createdAt: -1 });
    res.json(exeats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single exeat request
router.get('/:id', auth, async (req, res) => {
  try {
    const exeat = await Exeat.findById(req.params.id)
      .populate('student', 'firstName lastName email matricNumber')
      .populate('approvedBy', 'firstName lastName');

    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    // Check if user is authorized to view this exeat
    if (req.user.role !== 'admin' && exeat.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(exeat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update exeat request status (admin only)
router.patch('/:id/status', [
  auth,
  authorize('admin'),
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status'),
  body('rejectionReason').if(body('status').equals('rejected')).notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exeat = await Exeat.findById(req.params.id);
    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    exeat.status = req.body.status;
    exeat.approvedBy = req.user._id;
    if (req.body.rejectionReason) {
      exeat.rejectionReason = req.body.rejectionReason;
    }

    await exeat.save();
    res.json(exeat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all exeat requests (admin only)
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};

    if (status) query.status = status;
    if (department) {
      const students = await User.find({ department, role: 'student' });
      query.student = { $in: students.map(s => s._id) };
    }

    const exeats = await Exeat.find(query)
      .populate('student', 'firstName lastName email matricNumber department')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json(exeats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark exeat as used (admin only)
router.patch('/:id/use', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const result = await Exeat.markAsUsed(req.params.id);
    
    if (!result.success) {
      return res.status(400).json({ message: result.message });
    }
    
    const exeat = await Exeat.findById(req.params.id)
      .populate('student', 'firstName lastName email matricNumber')
      .populate('approvedBy', 'firstName lastName');
      
    res.json(exeat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check exeat validity
router.get('/:id/validate', [
  auth,
  authorize('admin')
], async (req, res) => {
  try {
    const result = await Exeat.isValid(req.params.id);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 