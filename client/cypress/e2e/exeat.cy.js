/// <reference types="cypress" />

// End-to-end tests for the Student Exeat Permission System

describe('Student Exeat System E2E Tests', () => {
  // Test Data
  const student = {
    email: 'student@example.com',
    password: 'password123',
    firstName: 'Student',
    lastName: 'User'
  };

  const dean = {
    email: 'dean@example.com',
    password: 'password123',
    firstName: 'Dean',
    lastName: 'User'
  };

  const security = {
    email: 'security@example.com',
    password: 'password123',
    firstName: 'Security',
    lastName: 'User'
  };

  const exeatData = {
    reason: 'Medical appointment',
    destination: 'Hospital',
    departureDate: '2023-05-20',
    returnDate: '2023-05-22',
    emergencyContact: {
      name: 'Parent Name',
      phone: '1234567890',
      relationship: 'Parent'
    }
  };

  // Login helper function
  const login = (email, password) => {
    cy.visit('/login');
    cy.get('input[placeholder*="email"]').type(email);
    cy.get('input[placeholder*="password"]').type(password);
    cy.get('button').contains(/login/i).click();
    cy.url().should('include', '/dashboard');
  };

  beforeEach(() => {
    // Reset any previous login
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('should allow a student to register', () => {
    cy.visit('/register');
    
    // Fill out registration form
    cy.get('input[placeholder*="First Name"]').type(student.firstName);
    cy.get('input[placeholder*="Last Name"]').type(student.lastName);
    cy.get('input[placeholder*="Email"]').type(`new${Date.now()}@example.com`);
    cy.get('input[placeholder*="Password"]').type(student.password);
    cy.get('select[name="role"]').select('student');
    
    // Student-specific fields
    cy.get('input[name="department"]').type('Computer Science');
    cy.get('input[name="matricNumber"]').type('CS' + Date.now().toString().slice(-6));
    cy.get('input[name="phoneNumber"]').type('1234567890');
    cy.get('input[name="parentEmail"]').type('parent@example.com');
    
    // Submit form
    cy.get('button').contains(/register/i).click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should allow a student to log in', () => {
    login(student.email, student.password);
    cy.contains(`Welcome, ${student.firstName}`).should('be.visible');
  });

  it('should allow a student to create an exeat request', () => {
    login(student.email, student.password);
    
    // Navigate to exeat form
    cy.get('button').contains(/create/i).click();
    cy.url().should('include', '/exeat/new');
    
    // Fill out exeat form
    cy.get('textarea[name="reason"]').type(exeatData.reason);
    cy.get('input[name="destination"]').type(exeatData.destination);
    cy.get('input[name="departureDate"]').type(exeatData.departureDate);
    cy.get('input[name="returnDate"]').type(exeatData.returnDate);
    cy.get('input[name="emergencyContact.name"]').type(exeatData.emergencyContact.name);
    cy.get('input[name="emergencyContact.phone"]').type(exeatData.emergencyContact.phone);
    cy.get('input[name="emergencyContact.relationship"]').type(exeatData.emergencyContact.relationship);
    
    // Submit form
    cy.get('button').contains(/submit/i).click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    
    // Should show the new exeat request
    cy.contains(exeatData.reason).should('be.visible');
    cy.contains(/pending parent approval/i).should('be.visible');
  });

  it('should allow a dean to approve an exeat request', () => {
    // Login as dean
    login(dean.email, dean.password);
    
    // Should see pending requests
    cy.contains(/pending dean approval/i).click();
    
    // View exeat details
    cy.get('table tbody tr').first().click();
    
    // Approve exeat
    cy.get('button').contains(/approve/i).click();
    cy.get('textarea[name="comments"]').type('Approved by dean');
    cy.get('button').contains(/confirm/i).click();
    
    // Should show updated status
    cy.contains(/approved/i).should('be.visible');
  });

  it('should show the QR code for an approved exeat', () => {
    // Login as student
    login(student.email, student.password);
    
    // Find approved exeat
    cy.contains(/approved/i).should('be.visible');
    
    // View exeat details
    cy.get('table tbody tr').contains(/approved/i).parent().click();
    
    // Should show QR code
    cy.get('img[alt="QR Code"]').should('be.visible');
  });

  it('should allow security to verify and check-out a student', () => {
    // Login as security
    login(security.email, security.password);
    
    // Go to verification page
    cy.visit('/verify');
    
    // Search for student by matric number
    cy.get('input[name="matricNumber"]').type('CS123456');
    cy.get('button').contains(/search/i).click();
    
    // Should show student details
    cy.contains(student.firstName).should('be.visible');
    cy.contains(student.lastName).should('be.visible');
    
    // Check out student
    cy.get('button').contains(/check out/i).click();
    
    // Should show checked out status
    cy.contains(/checked out/i).should('be.visible');
  });

  it('should allow security to check-in a student', () => {
    // Login as security
    login(security.email, security.password);
    
    // Go to verification page
    cy.visit('/verify');
    
    // Search for student by matric number
    cy.get('input[name="matricNumber"]').type('CS123456');
    cy.get('button').contains(/search/i).click();
    
    // Should show student details
    cy.contains(student.firstName).should('be.visible');
    cy.contains(student.lastName).should('be.visible');
    
    // Check in student
    cy.get('button').contains(/check in/i).click();
    
    // Should show checked in status
    cy.contains(/checked in/i).should('be.visible');
  });

  it('should allow a parent to approve an exeat request via email link', () => {
    // Simulate parent following email link
    // Note: In a real test, you'd need to intercept emails or mock this flow
    cy.visit('/parent-approval/sample-exeat-id/sample-token');
    
    // Parent approval form
    cy.get('button').contains(/approve/i).click();
    cy.get('textarea[name="comments"]').type('Approved by parent');
    cy.get('button').contains(/confirm/i).click();
    
    // Should show confirmation
    cy.contains(/successfully approved/i).should('be.visible');
  });
}); 