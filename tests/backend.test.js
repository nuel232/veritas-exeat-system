const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const ExeatRequest = require('../models/ExeatRequest');
const jwt = require('jsonwebtoken');

// Import mocks
require('./mocks');

// Mock data
const testStudent = {
  firstName: 'Test',
  lastName: 'Student',
  email: 'teststudent@example.com',
  password: 'password123',
  role: 'student',
  department: 'Computer Science',
  matricNumber: 'CS123456',
  phoneNumber: '1234567890',
  parentEmail: 'parent@example.com'
};

const testDean = {
  firstName: 'Test',
  lastName: 'Dean',
  email: 'testdean@example.com',
  password: 'password123',
  role: 'dean',
  phoneNumber: '0987654321',
  office: 'Dean Office',
  staffId: 'DEAN001'
};

const testExeatRequest = {
  reason: 'Family emergency',
  destination: 'Home',
  departureDate: new Date(Date.now() + 86400000), // Tomorrow
  returnDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
  emergencyContact: {
    name: 'Emergency Contact',
    phone: '1122334455',
    relationship: 'Parent'
  }
};

let studentToken;
let deanToken;
let exeatId;

// Connect to test database before running tests
beforeAll(async () => {
  // Use a test database
  const testDbUrl = process.env.MONGODB_URI_TEST || 'mongodb://127.0.0.1:27017/exeat_system_test';
  
  try {
    await mongoose.connect(testDbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`Connected to test database: ${testDbUrl}`);
    
    // Clear test database
    await User.deleteMany({});
    await ExeatRequest.deleteMany({});
    
    // Create test users
    const studentUser = await User.create(testStudent);
    const deanUser = await User.create(testDean);
    
    // Generate tokens
    studentToken = jwt.sign({ userId: studentUser._id }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
    deanToken = jwt.sign({ userId: deanUser._id }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
  } catch (error) {
    console.error('Test database connection error:', error.message);
    throw error; // Let Jest know the setup failed
  }
});

// Disconnect from database after tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
    console.log('Test database connection closed');
  } catch (error) {
    console.error('Error closing test database connection:', error.message);
  }
});

// Test Authentication
describe('Authentication', () => {
  test('User can register', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'New',
        lastName: 'User',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'student',
        department: 'Engineering',
        matricNumber: 'ENG123456',
        phoneNumber: '5555555555',
        parentEmail: 'newparent@example.com'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });
  
  test('User can login', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testStudent.email,
        password: testStudent.password
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });
  
  test('Login fails with wrong credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testStudent.email,
        password: 'wrongpassword'
      });
    
    expect(res.statusCode).toBe(400);
  });
});

// Test Exeat Requests
describe('Exeat Requests', () => {
  test('Student can create exeat request', async () => {
    const res = await request(app)
      .post('/api/exeat')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(testExeatRequest);
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.status).toBe('pending_parent');
    
    // Save exeat ID for later tests
    exeatId = res.body._id;
  });
  
  test('Student can view their exeat requests', async () => {
    const res = await request(app)
      .get('/api/exeat/my-requests')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
  });
  
  test('Student can view a specific exeat request', async () => {
    const res = await request(app)
      .get(`/api/exeat/${exeatId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(exeatId);
  });
  
  test('Dean can view all exeat requests', async () => {
    const res = await request(app)
      .get('/api/exeat')
      .set('Authorization', `Bearer ${deanToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });
});

// Test Parent Approval
describe('Parent Approval', () => {
  test('Parent can approve exeat request with token', async () => {
    // First get the exeat to extract the parent approval token
    const exeat = await ExeatRequest.findById(exeatId);
    const token = exeat.parentApproval.approvalToken;
    
    const res = await request(app)
      .post(`/api/exeat/parent-approval/${exeatId}/${token}`)
      .send({ approved: true });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('pending_dean');
  });
});

// Test Dean Approval
describe('Dean Approval', () => {
  test('Dean can approve exeat request', async () => {
    const res = await request(app)
      .patch(`/api/exeat/${exeatId}/dean-approval`)
      .set('Authorization', `Bearer ${deanToken}`)
      .send({ 
        approved: true,
        comments: 'Approved by dean'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('approved');
  });
});

// Test QR Code Generation
describe('QR Code Generation', () => {
  test('QR code can be generated for approved exeat', async () => {
    const res = await request(app)
      .post(`/api/verify/generate-qr/${exeatId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('qrCode');
  });
});

// Test Security Verification
describe('Security Verification', () => {
  test('Security can check out a student', async () => {
    // Create a security user first
    const securityUser = await User.create({
      firstName: 'Security',
      lastName: 'Officer',
      email: 'security@example.com',
      password: 'password123',
      role: 'security',
      staffId: 'SEC001',
      phoneNumber: '5555555555'
    });
    
    const securityToken = jwt.sign({ userId: securityUser._id }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
    
    const res = await request(app)
      .post(`/api/verify/check-out/${exeatId}`)
      .set('Authorization', `Bearer ${securityToken}`)
      .send({ securityId: securityUser._id.toString() });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.checkOut.status).toBe(true);
  });
  
  test('Security can check in a student', async () => {
    // Use the same security user created in the previous test
    const securityUser = await User.findOne({ role: 'security' });
    
    // Make sure the security user exists before proceeding
    if (!securityUser) {
      throw new Error('Security user not found. Previous test may have failed.');
    }
    
    const securityToken = jwt.sign({ userId: securityUser._id }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
    
    const res = await request(app)
      .post(`/api/verify/check-in/${exeatId}`)
      .set('Authorization', `Bearer ${securityToken}`)
      .send({ securityId: securityUser._id.toString() });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.checkIn.status).toBe(true);
  });
});

// Test Email Notifications - Skip these tests since we're mocking email service
describe('Notifications', () => {
  // Mark notification tests as skipped since they require email configuration
  test.skip('System can send parent notification', async () => {
    const res = await request(app)
      .post('/api/notifications/notify-parent')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ exeatId });
    
    expect(res.statusCode).toBe(200);
  });
  
  test.skip('System can send dean notification', async () => {
    const res = await request(app)
      .post('/api/notifications/notify-dean')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ exeatId });
    
    expect(res.statusCode).toBe(200);
  });
  
  test.skip('System can send student notification', async () => {
    const res = await request(app)
      .post('/api/notifications/notify-student')
      .set('Authorization', `Bearer ${deanToken}`)
      .send({
        studentId: testStudent._id,
        message: 'Test notification'
      });
    
    expect(res.statusCode).toBe(200);
  });
}); 