const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Register a new user
router.post('/register', [
  // Common validations for all users
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['student', 'admin', 'staff']).withMessage('Invalid role'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  
  // Conditional validation based on role
  body('department').custom((value, { req }) => {
    if (req.body.role === 'student' && !value) {
      throw new Error('Department is required for students');
    }
    return true;
  }),
  body('matricNumber').custom((value, { req }) => {
    if (req.body.role === 'student' && !value) {
      throw new Error('Matric number is required for students');
    }
    return true;
  }),
  body('office').custom((value, { req }) => {
    if (['admin', 'staff'].includes(req.body.role) && !value) {
      throw new Error('Office is required for admin/staff');
    }
    return true;
  }),
  body('staffId').custom((value, { req }) => {
    if (['admin', 'staff'].includes(req.body.role) && !value) {
      throw new Error('Staff ID is required for admin/staff');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    user = new User(req.body);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        office: user.office,
        staffId: user.staffId
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').exists().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Find user by email
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // If role was specified, check if user has that role
    if (role && user.role !== role) {
      return res.status(400).json({ message: `Invalid credentials for ${role} login` });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = {
      userId: user._id
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    user = user.toObject();
    delete user.password;

    res.json({
      token,
      user
    });
  } catch (error) {
    console.error('Error in login:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 