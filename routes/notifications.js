const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const ExeatRequest = require('../models/ExeatRequest');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Helper function to send emails
const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

// Route to notify parent about new exeat request
router.post('/notify-parent', auth, async (req, res) => {
  try {
    const { exeatId } = req.body;
    const exeat = await ExeatRequest.findById(exeatId)
      .populate('student', 'firstName lastName matricNumber parentEmail');

    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    // Generate approval token
    const approvalToken = crypto.randomBytes(20).toString('hex');
    
    // Save token to the exeat request
    exeat.parentApproval.approvalToken = approvalToken;
    await exeat.save();

    // Prepare approval link
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? process.env.BASE_URL 
      : 'http://localhost:3000';
    const approvalLink = `${baseUrl}/parent-approval/${exeatId}/${approvalToken}`;

    // Prepare email content
    const html = `
      <h2>Exeat Permission Request</h2>
      <p>Dear Parent/Guardian,</p>
      <p>Your child, ${exeat.student.firstName} ${exeat.student.lastName} (${exeat.student.matricNumber}), has requested permission to leave campus from ${new Date(exeat.departureDate).toLocaleDateString()} to ${new Date(exeat.returnDate).toLocaleDateString()}.</p>
      <p><strong>Reason:</strong> ${exeat.reason}</p>
      <p><strong>Destination:</strong> ${exeat.destination}</p>
      <p>Please click the link below to approve or reject this request:</p>
      <p><a href="${approvalLink}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">Review Request</a></p>
      <p>If you did not expect this email, please ignore it.</p>
      <p>Regards,<br>Veritas University</p>
    `;

    // Send email
    const emailSent = await sendEmail(
      exeat.student.parentEmail,
      'Exeat Permission Request Approval Needed',
      html
    );

    if (emailSent) {
      res.json({ message: 'Notification sent to parent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send notification' });
    }
  } catch (error) {
    console.error('Error notifying parent:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to notify dean about parent-approved exeat request
router.post('/notify-dean', auth, async (req, res) => {
  try {
    const { exeatId } = req.body;
    const exeat = await ExeatRequest.findById(exeatId)
      .populate('student', 'firstName lastName matricNumber department');

    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    // Find dean by role
    const dean = await User.findOne({ role: 'dean' });
    if (!dean) {
      return res.status(404).json({ message: 'Dean not found in the system' });
    }

    // Prepare email content
    const html = `
      <h2>Exeat Permission Request - Parent Approved</h2>
      <p>Dear Dean,</p>
      <p>A parent-approved exeat request requires your attention:</p>
      <p><strong>Student:</strong> ${exeat.student.firstName} ${exeat.student.lastName} (${exeat.student.matricNumber})</p>
      <p><strong>Department:</strong> ${exeat.student.department}</p>
      <p><strong>Dates:</strong> ${new Date(exeat.departureDate).toLocaleDateString()} to ${new Date(exeat.returnDate).toLocaleDateString()}</p>
      <p><strong>Reason:</strong> ${exeat.reason}</p>
      <p><strong>Destination:</strong> ${exeat.destination}</p>
      <p>Please log in to the system to review this request.</p>
      <p>Regards,<br>Exeat Permission System</p>
    `;

    // Send email
    const emailSent = await sendEmail(
      dean.email,
      'Exeat Request Needs Your Approval',
      html
    );

    if (emailSent) {
      res.json({ message: 'Notification sent to dean successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send notification' });
    }
  } catch (error) {
    console.error('Error notifying dean:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to notify student about request approval/rejection
router.post('/notify-student', auth, async (req, res) => {
  try {
    const { exeatId, status } = req.body;
    const exeat = await ExeatRequest.findById(exeatId)
      .populate('student', 'firstName lastName email');

    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    // Prepare email content based on status
    let subject, html;
    if (status === 'approved') {
      const baseUrl = process.env.NODE_ENV === 'production' 
        ? process.env.BASE_URL 
        : 'http://localhost:3000';
      const exeatLink = `${baseUrl}/exeat/${exeatId}`;
      
      subject = 'Exeat Request Approved';
      html = `
        <h2>Exeat Request Approved</h2>
        <p>Dear ${exeat.student.firstName},</p>
        <p>Your exeat request for ${new Date(exeat.departureDate).toLocaleDateString()} to ${new Date(exeat.returnDate).toLocaleDateString()} has been approved.</p>
        <p>You can now access your exeat pass by clicking the link below:</p>
        <p><a href="${exeatLink}" style="padding: 10px 15px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;">View Exeat Pass</a></p>
        <p>Remember to present this pass to security when leaving campus.</p>
        <p>Regards,<br>Veritas University</p>
      `;
    } else {
      subject = 'Exeat Request Rejected';
      html = `
        <h2>Exeat Request Rejected</h2>
        <p>Dear ${exeat.student.firstName},</p>
        <p>We regret to inform you that your exeat request for ${new Date(exeat.departureDate).toLocaleDateString()} to ${new Date(exeat.returnDate).toLocaleDateString()} has been rejected.</p>
        <p>Comments: ${exeat.deanApproval.comments || 'No comments provided'}</p>
        <p>If you have any questions, please contact your department or the dean's office.</p>
        <p>Regards,<br>Veritas University</p>
      `;
    }

    // Send email
    const emailSent = await sendEmail(
      exeat.student.email,
      subject,
      html
    );

    if (emailSent) {
      res.json({ message: 'Notification sent to student successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send notification' });
    }
  } catch (error) {
    console.error('Error notifying student:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Route to send return deadline reminder
router.post('/return-reminder', auth, async (req, res) => {
  try {
    const { exeatId } = req.body;
    const exeat = await ExeatRequest.findById(exeatId)
      .populate('student', 'firstName email');

    if (!exeat) {
      return res.status(404).json({ message: 'Exeat request not found' });
    }

    // Prepare email content
    const html = `
      <h2>Exeat Return Reminder</h2>
      <p>Dear ${exeat.student.firstName},</p>
      <p>This is a reminder that your exeat permission will expire on ${new Date(exeat.returnDate).toLocaleDateString()}.</p>
      <p>Please ensure you return to campus by this date. Failure to return on time may result in disciplinary action.</p>
      <p>Regards,<br>Veritas University</p>
    `;

    // Send email
    const emailSent = await sendEmail(
      exeat.student.email,
      'Exeat Return Reminder',
      html
    );

    if (emailSent) {
      res.json({ message: 'Reminder sent to student successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send reminder' });
    }
  } catch (error) {
    console.error('Error sending reminder:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;