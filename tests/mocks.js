// Mock email and notification services for testing
const nodemailer = require('nodemailer');

// Mock nodemailer for testing
jest.mock('nodemailer');

// Create a mock transporter
const mockTransporter = {
  sendMail: jest.fn().mockImplementation(() => Promise.resolve({ 
    response: '250 Message received',
    accepted: ['test@example.com'],
    rejected: [],
  }))
};

// Replace the real nodemailer.createTransport with our mock
nodemailer.createTransport.mockReturnValue(mockTransporter);

module.exports = {
  mockTransporter,
}; 