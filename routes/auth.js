const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register a new user
router.post('/register', [
  // Common validations for all users
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').optional(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['student', 'parent', 'security', 'staff']).withMessage('Invalid role'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  
  // Student-specific validations
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
  body('gender').custom((value, { req }) => {
    if (req.body.role === 'student' && !value) {
      throw new Error('Gender is required for students');
    }
    if (req.body.role === 'student' && !['male', 'female'].includes(value)) {
      throw new Error('Gender must be either male or female');
    }
    return true;
  }),
  body('parentEmail').custom((value, { req }) => {
    if (req.body.role === 'student' && !value) {
      throw new Error('Parent email is required for students');
    }
    if (req.body.role === 'student' && !/\S+@\S+\.\S+/.test(value)) {
      throw new Error('Please enter a valid parent email');
    }
    return true;
  }),
  
  // Staff/Security validations
  body('office').custom((value, { req }) => {
    if (req.body.role === 'staff' && !value) {
      throw new Error('Office is required for staff role');
    }
    return true;
  }),
  body('staffId').custom((value, { req }) => {
    if (['staff', 'security'].includes(req.body.role) && !value) {
      throw new Error('Staff ID is required for staff and security roles');
    }
    return true;
  }),
  body('staffType').custom((value, { req }) => {
    if (req.body.role === 'staff' && !value) {
      throw new Error('Staff type is required for staff role');
    }
    const validStaffTypes = ['father', 'sister', 'hostel_admin'];
    if (req.body.role === 'staff' && !validStaffTypes.includes(value)) {
      throw new Error('Invalid staff type');
    }
    return true;
  }),
  body('year').custom((value, { req }) => {
    if (['student', 'staff', 'security'].includes(req.body.role) && !value) {
      throw new Error('Year is required');
    }
    return true;
  }),
  
  // Parent-specific validations
  body('children').custom((value, { req }) => {
    if (req.body.role === 'parent') {
      if (!value || !Array.isArray(value) || value.length === 0) {
        throw new Error('At least one child is required for parent accounts');
      }
      // Validate each child object
      for (const child of value) {
        if (!child.matricNumber || !child.firstName || !child.lastName) {
          throw new Error('Each child must have matricNumber, firstName, and lastName');
        }
      }
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

    // For students, check if matricNumber is already taken
    if (req.body.role === 'student') {
      const existingStudent = await User.findOne({ matricNumber: req.body.matricNumber });
      if (existingStudent) {
        return res.status(400).json({ message: 'Matric number already exists' });
      }
    }

    // For staff/security, check if staffId is already taken
    if (['staff', 'security'].includes(req.body.role)) {
      const existingStaff = await User.findOne({ staffId: req.body.staffId });
      if (existingStaff) {
        return res.status(400).json({ message: 'Staff ID already exists' });
      }
    }

    // For parent registration, verify that the children exist as students
    if (req.body.role === 'parent' && req.body.children) {
      const matricNumbers = req.body.children.map(child => child.matricNumber);
      const existingStudents = await User.find({ 
        matricNumber: { $in: matricNumbers },
        role: 'student'
      });
      
      if (existingStudents.length !== matricNumbers.length) {
        return res.status(400).json({ 
          message: 'One or more students not found with the provided matric numbers' 
        });
      }

      // Update the children array with actual student IDs
      req.body.children = req.body.children.map(child => {
        const student = existingStudents.find(s => s.matricNumber === child.matricNumber);
        return {
          ...child,
          studentId: student._id
        };
      });
    }

    // Generate email based on role and ID
    let generatedEmail = '';
    if (req.body.role === 'student') {
      generatedEmail = `${req.body.matricNumber}@edu.veritas.ng`;
    } else if (req.body.role === 'staff') {
      generatedEmail = `${req.body.staffId}@edu.veritas.ng`;
    } else if (req.body.role === 'security') {
      generatedEmail = `${req.body.staffId}@edu.veritas.ng`;
    } else if (req.body.role === 'dean') {
      generatedEmail = `${req.body.staffId}@edu.veritas.ng`;
    }
    req.body.email = generatedEmail;

    // Create new user
    user = new User(req.body);
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      token,
      user: userResponse,
      generatedEmail
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
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

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('x-auth-token') || req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error in get user:', error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Parent approval route (for tokenized email links)
router.get('/parent-approval/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user with this approval token
    const parent = await User.findOne({ approvalToken: token });
    
    if (!parent) {
      return res.status(400).json({ message: 'Invalid or expired approval token' });
    }

    // Return parent info for approval interface
    res.json({
      parentId: parent._id,
      firstName: parent.firstName,
      lastName: parent.lastName,
      email: parent.email,
      children: parent.children
    });
  } catch (error) {
    console.error('Error in parent approval:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search students endpoint for parent registration
router.get('/search-students', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({ students: [] });
    }

    // Search for students by firstName, lastName, or matricNumber
    const students = await User.find({
      role: 'student',
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { matricNumber: { $regex: query, $options: 'i' } }
      ]
    })
    .select('firstName lastName matricNumber department')
    .limit(10)
    .sort({ firstName: 1, lastName: 1 });

    res.json({ students });
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 