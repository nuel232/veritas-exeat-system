const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const ExeatRequest = require('../models/ExeatRequest');
const User = require('../models/User');
const { upload, handleUploadErrors } = require('../middleware/fileUpload');
const crypto = require('crypto');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');

// Email transporter setup
const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Create new exeat request with file upload
router.post('/', [
  auth,
  authorize('student'),
  upload.array('attachments', 5),
  handleUploadErrors,
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

    // Get student info with parent email
    const student = await User.findById(req.user._id);
    if (!student.parentEmail) {
      return res.status(400).json({ message: 'Parent email is required. Please update your profile.' });
    }

    // Process uploaded files
    const attachments = req.files ? req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: file.path || file.cloudinary?.secure_url
    })) : [];

    // Generate parent approval token
    const approvalToken = crypto.randomBytes(32).toString('hex');

    // Create new exeat request
    const exeatRequest = new ExeatRequest({
      student: req.user._id,
      reason: req.body.reason,
      destination: req.body.destination,
      departureDate: req.body.departureDate,
      returnDate: req.body.returnDate,
      emergencyContact: {
        name: req.body.emergencyContact.name,
        phone: req.body.emergencyContact.phone,
        relationship: req.body.emergencyContact.relationship
      },
      attachments: attachments,
      status: 'pending_parent',
      parentApproval: {
        approvalToken: approvalToken,
        parentEmail: student.parentEmail
      }
    });

    await exeatRequest.save();

    // Send parent approval email
    await sendParentApprovalEmail(exeatRequest, student, req);

    res.status(201).json({
      message: 'Exeat request submitted successfully. Parent approval email sent.',
      exeatRequest: {
        _id: exeatRequest._id,
        status: exeatRequest.status,
        reason: exeatRequest.reason,
        destination: exeatRequest.destination,
        departureDate: exeatRequest.departureDate,
        returnDate: exeatRequest.returnDate,
        createdAt: exeatRequest.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating exeat request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Send parent approval email
async function sendParentApprovalEmail(exeatRequest, student, req) {
  const transporter = createEmailTransporter();
  const approvalUrl = `${req.protocol}://${req.get('host')}/parent-approval/${exeatRequest._id}/${exeatRequest.parentApproval.approvalToken}`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937;">Exeat Permission Request</h2>
      <p>Dear Parent/Guardian,</p>
      <p>Your child <strong>${student.firstName} ${student.lastName}</strong> (${student.matricNumber}) has submitted an exeat request.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Request Details:</h3>
        <p><strong>Reason:</strong> ${exeatRequest.reason}</p>
        <p><strong>Destination:</strong> ${exeatRequest.destination}</p>
        <p><strong>Departure:</strong> ${new Date(exeatRequest.departureDate).toLocaleDateString()}</p>
        <p><strong>Return:</strong> ${new Date(exeatRequest.returnDate).toLocaleDateString()}</p>
        <p><strong>Emergency Contact:</strong> ${exeatRequest.emergencyContact.name} (${exeatRequest.emergencyContact.phone})</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${approvalUrl}" style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">REVIEW & APPROVE REQUEST</a>
      </div>
      
      <p>Please click the button above to review and approve or reject this request.</p>
      <p>This link will expire in 7 days.</p>
      
      <p>Best regards,<br>Veritas University Exeat System</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: student.parentEmail,
    subject: `Exeat Permission Request - ${student.firstName} ${student.lastName}`,
    html: emailHtml
  });

  // Update email sent status
  exeatRequest.parentApproval.emailSent = true;
  exeatRequest.notifications.parentEmailSent = true;
  await exeatRequest.save();
}

// Parent approval endpoint (public route with token verification)
router.post('/parent-approval/:id/:token', [
  body('approved').isBoolean().withMessage('Approved must be a boolean'),
  body('comments').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id, token } = req.params;
    const { approved, comments } = req.body;

    const exeat = await ExeatRequest.findById(id).populate('student');
    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    // Verify token and status
    if (exeat.parentApproval.approvalToken !== token) {
      return res.status(401).json({ message: 'Invalid approval token' });
    }

    if (exeat.status !== 'pending_parent') {
      return res.status(400).json({ message: 'This request has already been processed' });
    }

    // Update parent approval
    exeat.parentApproval.approved = approved;
    exeat.parentApproval.approvalDate = new Date();
    if (comments) {
      exeat.parentApproval.comments = comments;
    }

    if (approved) {
      // Move to staff approval step
      exeat.status = 'pending_staff';
      
      // Find appropriate approver based on student gender
      const nextApprover = await findNextApprover(exeat.student);
      if (nextApprover) {
        await sendStaffNotificationEmail(exeat, nextApprover);
      }
    } else {
      exeat.status = 'rejected';
      await sendStudentNotificationEmail(exeat, 'rejected');
    }

    await exeat.save();
    res.json({ 
      message: 'Parent approval updated successfully', 
      status: exeat.status,
      approved: approved
    });
  } catch (error) {
    console.error('Error in parent approval:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Find next approver based on student gender
async function findNextApprover(student) {
  // First try to find dean
  let approver = await User.findOne({ role: 'dean' });
  if (approver) return approver;

  // If no dean, find appropriate staff based on gender
  let staffQuery = { role: 'staff' };
  if (student.gender === 'male') {
    staffQuery.staffType = 'father';
  } else if (student.gender === 'female') {
    staffQuery.staffType = 'sister';
  } else {
    staffQuery.staffType = 'hostel_admin';
  }

  approver = await User.findOne(staffQuery);
  return approver;
}

// Send staff notification email
async function sendStaffNotificationEmail(exeatRequest, staff) {
  const transporter = createEmailTransporter();
  
  const student = exeatRequest.student;
  const reviewUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/staff/exeat/${exeatRequest._id}`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937;">New Exeat Request for Review</h2>
      <p>Dear ${staff.firstName} ${staff.lastName},</p>
      <p>A new exeat request requires your approval:</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Student Details:</h3>
        <p><strong>Name:</strong> ${student.firstName} ${student.lastName}</p>
        <p><strong>Matric Number:</strong> ${student.matricNumber}</p>
        <p><strong>Department:</strong> ${student.department}</p>
        <p><strong>Gender:</strong> ${student.gender}</p>
        
        <h3>Request Details:</h3>
        <p><strong>Reason:</strong> ${exeatRequest.reason}</p>
        <p><strong>Destination:</strong> ${exeatRequest.destination}</p>
        <p><strong>Departure:</strong> ${new Date(exeatRequest.departureDate).toLocaleDateString()}</p>
        <p><strong>Return:</strong> ${new Date(exeatRequest.returnDate).toLocaleDateString()}</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${reviewUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">REVIEW REQUEST</a>
      </div>
      
      <p>Please log in to the system to review and approve or reject this request.</p>
      
      <p>Best regards,<br>Veritas University Exeat System</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: staff.email,
    subject: `Exeat Request for Review - ${student.firstName} ${student.lastName}`,
    html: emailHtml
  });

  exeatRequest.notifications.staffNotificationSent = true;
  await exeatRequest.save();
}

// Staff/Dean approval endpoint
router.patch('/:id/staff-approval', [
  auth,
  authorize(['dean', 'staff']),
  body('approved').isBoolean().withMessage('Approved must be a boolean'),
  body('comments').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exeat = await ExeatRequest.findById(req.params.id).populate('student');
    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    // Verify the exeat is in the right state for staff approval
    if (exeat.status !== 'pending_staff') {
      return res.status(400).json({ message: 'This exeat is not pending staff approval' });
    }

    // Check if user can approve for this student
    if (!req.user.canApproveFor(exeat.student.gender)) {
      return res.status(403).json({ message: 'You are not authorized to approve requests for this student gender' });
    }

    // Update staff approval
    exeat.staffApproval.approved = req.body.approved;
    exeat.staffApproval.approvedBy = req.user._id;
    exeat.staffApproval.approverRole = req.user.role;
    exeat.staffApproval.approverType = req.user.staffType || req.user.role;
    exeat.staffApproval.approvalDate = new Date();
    
    if (req.body.comments) {
      exeat.staffApproval.comments = req.body.comments;
    }
    
    // Update overall status
    exeat.status = req.body.approved ? 'approved' : 'rejected';

    await exeat.save();

    // Generate QR code if approved
    if (req.body.approved) {
      await generateQRCode(exeat);
    }

    // Notify student of approval/rejection
    await sendStudentNotificationEmail(exeat, exeat.status);

    res.json({
      message: `Exeat request ${exeat.status} successfully`,
      exeat: exeat
    });
  } catch (error) {
    console.error('Error in staff approval:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate QR code for approved exeat
async function generateQRCode(exeat) {
  try {
    const qrData = {
      exeatId: exeat._id,
      studentId: exeat.student._id,
      status: exeat.status,
      departureDate: exeat.departureDate,
      returnDate: exeat.returnDate,
      generatedAt: new Date()
    };

    const qrCodeData = JSON.stringify(qrData);
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    exeat.qrCode = {
      code: qrCodeData,
      imageUrl: qrCodeImage,
      generatedAt: new Date()
    };

    await exeat.save();
  } catch (error) {
    console.error('Error generating QR code:', error);
  }
}

// Send notification email to student
async function sendStudentNotificationEmail(exeatRequest, status) {
  const transporter = createEmailTransporter();
  const student = exeatRequest.student;
  
  const statusText = status === 'approved' ? 'APPROVED' : 'REJECTED';
  const statusColor = status === 'approved' ? '#059669' : '#dc2626';
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: ${statusColor};">Your Exeat Request has been ${statusText}</h2>
      <p>Dear ${student.firstName},</p>
      <p>Your exeat request submitted on ${new Date(exeatRequest.createdAt).toLocaleDateString()} has been <strong>${statusText}</strong>.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Request Details:</h3>
        <p><strong>Reason:</strong> ${exeatRequest.reason}</p>
        <p><strong>Destination:</strong> ${exeatRequest.destination}</p>
        <p><strong>Departure:</strong> ${new Date(exeatRequest.departureDate).toLocaleDateString()}</p>
        <p><strong>Return:</strong> ${new Date(exeatRequest.returnDate).toLocaleDateString()}</p>
      </div>
      
      ${status === 'approved' ? `
        <div style="background: #dcfce7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
          <h3 style="margin-top: 0; color: #059669;">Next Steps:</h3>
          <p>1. Log in to your dashboard to view your QR code</p>
          <p>2. Present the QR code to security when leaving campus</p>
          <p>3. Present the QR code again when returning to campus</p>
          <p>4. Ensure you return by ${new Date(exeatRequest.returnDate).toLocaleDateString()}</p>
        </div>
      ` : `
        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
          <h3 style="margin-top: 0; color: #dc2626;">Reason for Rejection:</h3>
          <p>${exeatRequest.staffApproval.comments || exeatRequest.parentApproval.comments || 'No specific reason provided.'}</p>
        </div>
      `}
      
      <p>Best regards,<br>Veritas University Exeat System</p>
    </div>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: student.email,
    subject: `Exeat Request ${statusText} - ${student.firstName} ${student.lastName}`,
    html: emailHtml
  });

  exeatRequest.notifications.approvalNotificationSent = true;
  await exeatRequest.save();
}

// Get all exeat requests for a student
router.get('/my-requests', auth, authorize('student'), async (req, res) => {
  try {
    const exeats = await ExeatRequest.find({ student: req.user._id })
      .sort({ createdAt: -1 });
    res.json(exeats);
  } catch (error) {
    console.error('Error fetching student requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get exeat requests for staff/dean to review
router.get('/pending-approval', auth, authorize(['dean', 'staff']), async (req, res) => {
  try {
    let query = { status: 'pending_staff' };
    
    // If user is staff (not dean), filter by gender they can approve
    if (req.user.role === 'staff') {
      const students = await User.find({ role: 'student' });
      const approveableStudents = students.filter(student => 
        req.user.canApproveFor(student.gender)
      );
      query.student = { $in: approveableStudents.map(s => s._id) };
    }

    const exeats = await ExeatRequest.find(query)
      .populate('student', 'firstName lastName matricNumber department gender')
      .sort({ createdAt: -1 });

    res.json(exeats);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single exeat request
router.get('/:id', auth, async (req, res) => {
  try {
    const exeat = await ExeatRequest.findById(req.params.id)
      .populate('student', 'firstName lastName email matricNumber department gender')
      .populate('staffApproval.approvedBy', 'firstName lastName role staffType');

    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    // Check authorization
    const isAuthorized = 
      req.user._id.toString() === exeat.student._id.toString() ||
      ['dean', 'staff', 'security'].includes(req.user.role) ||
      (req.user.role === 'staff' && req.user.canApproveFor(exeat.student.gender));

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(exeat);
  } catch (error) {
    console.error('Error fetching exeat:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Security check-out endpoint
router.patch('/:id/check-out', [
  auth,
  authorize('security'),
  body('location').notEmpty().withMessage('Location is required'),
  body('securityNotes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exeat = await ExeatRequest.findById(req.params.id)
      .populate('student', 'firstName lastName matricNumber');

    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    if (exeat.status !== 'approved') {
      return res.status(400).json({ message: 'Exeat is not approved' });
    }

    if (exeat.checkOut.status) {
      return res.status(400).json({ message: 'Student has already checked out' });
    }

    // Update check-out status
    exeat.checkOut.status = true;
    exeat.checkOut.time = new Date();
    exeat.checkOut.by = req.user._id;
    exeat.checkOut.location = req.body.location;
    if (req.body.securityNotes) {
      exeat.checkOut.securityNotes = req.body.securityNotes;
    }

    await exeat.save();

    res.json({
      message: 'Student checked out successfully',
      checkOut: exeat.checkOut,
      student: exeat.student
    });
  } catch (error) {
    console.error('Error in check-out:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Security check-in endpoint
router.patch('/:id/check-in', [
  auth,
  authorize('security'),
  body('location').notEmpty().withMessage('Location is required'),
  body('securityNotes').optional().isString(),
  body('lateReturnReason').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const exeat = await ExeatRequest.findById(req.params.id)
      .populate('student', 'firstName lastName matricNumber');

    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    if (!exeat.checkOut.status) {
      return res.status(400).json({ message: 'Student has not checked out yet' });
    }

    if (exeat.checkIn.status) {
      return res.status(400).json({ message: 'Student has already checked in' });
    }

    // Check if return is late
    const now = new Date();
    const isLate = now > new Date(exeat.returnDate);

    // Update check-in status
    exeat.checkIn.status = true;
    exeat.checkIn.time = now;
    exeat.checkIn.by = req.user._id;
    exeat.checkIn.location = req.body.location;
    exeat.checkIn.lateReturn = isLate;
    
    if (req.body.securityNotes) {
      exeat.checkIn.securityNotes = req.body.securityNotes;
    }
    
    if (isLate && req.body.lateReturnReason) {
      exeat.checkIn.lateReturnReason = req.body.lateReturnReason;
    }

    await exeat.save();

    res.json({
      message: 'Student checked in successfully',
      checkIn: exeat.checkIn,
      student: exeat.student,
      lateReturn: isLate
    });
  } catch (error) {
    console.error('Error in check-in:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// QR code verification endpoint (public)
router.get('/verify-qr/:id', async (req, res) => {
  try {
    const exeat = await ExeatRequest.findById(req.params.id)
      .populate('student', 'firstName lastName matricNumber department');

    if (!exeat) {
      return res.status(404).json({ message: 'Exeat not found' });
    }

    res.json({
      valid: exeat.status === 'approved',
      student: {
        name: `${exeat.student.firstName} ${exeat.student.lastName}`,
        matricNumber: exeat.student.matricNumber,
        department: exeat.student.department
      },
      exeat: {
        status: exeat.status,
        destination: exeat.destination,
        departureDate: exeat.departureDate,
        returnDate: exeat.returnDate,
        checkedOut: exeat.checkOut.status,
        checkedIn: exeat.checkIn.status
      }
    });
  } catch (error) {
    console.error('Error verifying QR code:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard statistics
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    let stats = {};

    if (req.user.role === 'student') {
      const studentStats = await ExeatRequest.aggregate([
        { $match: { student: req.user._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      stats = {
        total: studentStats.reduce((sum, stat) => sum + stat.count, 0),
        pending: studentStats.find(s => s._id.includes('pending'))?.count || 0,
        approved: studentStats.find(s => s._id === 'approved')?.count || 0,
        rejected: studentStats.find(s => s._id === 'rejected')?.count || 0
      };
    } else if (['dean', 'staff'].includes(req.user.role)) {
      let matchQuery = { status: 'pending_staff' };
      
      if (req.user.role === 'staff') {
        const students = await User.find({ role: 'student' });
        const approveableStudents = students.filter(student => 
          req.user.canApproveFor(student.gender)
        );
        matchQuery.student = { $in: approveableStudents.map(s => s._id) };
      }

      const pendingCount = await ExeatRequest.countDocuments(matchQuery);
      const totalProcessed = await ExeatRequest.countDocuments({
        'staffApproval.approvedBy': req.user._id
      });

      stats = {
        pendingApproval: pendingCount,
        totalProcessed: totalProcessed
      };
    } else if (req.user.role === 'security') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todayCheckOuts = await ExeatRequest.countDocuments({
        'checkOut.time': { $gte: today, $lt: tomorrow }
      });

      const todayCheckIns = await ExeatRequest.countDocuments({
        'checkIn.time': { $gte: today, $lt: tomorrow }
      });

      const pendingCheckIns = await ExeatRequest.countDocuments({
        'checkOut.status': true,
        'checkIn.status': false
      });

      stats = {
        todayCheckOuts: todayCheckOuts,
        todayCheckIns: todayCheckIns,
        pendingCheckIns: pendingCheckIns
      };
    }

    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
