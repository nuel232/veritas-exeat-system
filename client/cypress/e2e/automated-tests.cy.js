/// <reference types="cypress" />

describe('Automated Exeat System Tests', () => {
  const testData = {
    student: {
      email: 'teststudent@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Student'
    },
    exeat: {
      reason: 'Medical appointment',
      destination: 'Hospital',
      departureDate: '2024-12-20',
      returnDate: '2024-12-22',
      emergencyContact: {
        name: 'Parent Name',
        phone: '1234567890',
        relationship: 'Parent'
      }
    }
  };

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  // Form Validation Tests
  describe('Form Validation', () => {
    it('should validate registration form', () => {
      cy.visit('/register');
      
      // Test empty form
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('be.visible');
      
      // Test invalid email
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('contain', 'valid email');
      
      // Test successful registration
      cy.get('input[name="email"]').clear().type('new@email.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('select[name="role"]').select('student');
      cy.get('input[name="department"]').type('Computer Science');
      cy.get('input[name="matricNumber"]').type('CS123456');
      cy.get('input[name="phoneNumber"]').type('1234567890');
      cy.get('input[name="parentEmail"]').type('parent@email.com');
      
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should validate login form', () => {
      cy.visit('/login');
      
      // Test empty form
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('be.visible');
      
      // Test invalid credentials
      cy.get('input[name="email"]').type('wrong@email.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('contain', 'Invalid credentials');
      
      // Test successful login
      cy.get('input[name="email"]').clear().type(testData.student.email);
      cy.get('input[name="password"]').clear().type(testData.student.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should validate exeat form', () => {
      // Login first
      cy.visit('/login');
      cy.get('input[name="email"]').type(testData.student.email);
      cy.get('input[name="password"]').type(testData.student.password);
      cy.get('button[type="submit"]').click();
      
      // Navigate to exeat form
      cy.get('a[href="/exeat/new"]').click();
      
      // Test empty form
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('be.visible');
      
      // Test date validation
      cy.get('input[name="departureDate"]').type('2023-01-01');
      cy.get('input[name="returnDate"]').type('2023-01-02');
      cy.get('button[type="submit"]').click();
      cy.get('.error-message').should('contain', 'future date');
      
      // Test successful submission
      cy.get('input[name="departureDate"]').clear().type(testData.exeat.departureDate);
      cy.get('input[name="returnDate"]').clear().type(testData.exeat.returnDate);
      cy.get('input[name="reason"]').type(testData.exeat.reason);
      cy.get('input[name="destination"]').type(testData.exeat.destination);
      cy.get('input[name="emergencyContact.name"]').type(testData.exeat.emergencyContact.name);
      cy.get('input[name="emergencyContact.phone"]').type(testData.exeat.emergencyContact.phone);
      cy.get('input[name="emergencyContact.relationship"]').type(testData.exeat.emergencyContact.relationship);
      
      cy.get('button[type="submit"]').click();
      cy.contains('Exeat request submitted successfully').should('be.visible');
    });
  });

  // Button Functionality Tests
  describe('Button Functionality', () => {
    it('should test navigation buttons', () => {
      cy.visit('/login');
      cy.get('input[name="email"]').type(testData.student.email);
      cy.get('input[name="password"]').type(testData.student.password);
      cy.get('button[type="submit"]').click();
      
      // Test dashboard button
      cy.get('a[href="/dashboard"]').click();
      cy.url().should('include', '/dashboard');
      
      // Test profile button
      cy.get('a[href="/profile"]').click();
      cy.url().should('include', '/profile');
      
      // Test logout button
      cy.get('button').contains('Logout').click();
      cy.url().should('include', '/login');
    });

    it('should test exeat action buttons', () => {
      // Login and create exeat
      cy.visit('/login');
      cy.get('input[name="email"]').type(testData.student.email);
      cy.get('input[name="password"]').type(testData.student.password);
      cy.get('button[type="submit"]').click();
      
      cy.get('a[href="/exeat/new"]').click();
      cy.get('input[name="reason"]').type(testData.exeat.reason);
      cy.get('input[name="destination"]').type(testData.exeat.destination);
      cy.get('input[name="departureDate"]').type(testData.exeat.departureDate);
      cy.get('input[name="returnDate"]').type(testData.exeat.returnDate);
      cy.get('input[name="emergencyContact.name"]').type(testData.exeat.emergencyContact.name);
      cy.get('input[name="emergencyContact.phone"]').type(testData.exeat.emergencyContact.phone);
      cy.get('input[name="emergencyContact.relationship"]').type(testData.exeat.emergencyContact.relationship);
      cy.get('button[type="submit"]').click();
      
      // Test view details button
      cy.get('button').contains('View Details').first().click();
      cy.url().should('include', '/exeat/');
      
      // Test back button
      cy.get('button').contains('Back').click();
      cy.url().should('include', '/dashboard');
    });
  });

  // User Flow Tests
  describe('User Flows', () => {
    it('should complete student exeat flow', () => {
      // 1. Login
      cy.visit('/login');
      cy.get('input[name="email"]').type(testData.student.email);
      cy.get('input[name="password"]').type(testData.student.password);
      cy.get('button[type="submit"]').click();
      
      // 2. Create exeat
      cy.get('a[href="/exeat/new"]').click();
      cy.get('input[name="reason"]').type(testData.exeat.reason);
      cy.get('input[name="destination"]').type(testData.exeat.destination);
      cy.get('input[name="departureDate"]').type(testData.exeat.departureDate);
      cy.get('input[name="returnDate"]').type(testData.exeat.returnDate);
      cy.get('input[name="emergencyContact.name"]').type(testData.exeat.emergencyContact.name);
      cy.get('input[name="emergencyContact.phone"]').type(testData.exeat.emergencyContact.phone);
      cy.get('input[name="emergencyContact.relationship"]').type(testData.exeat.emergencyContact.relationship);
      cy.get('button[type="submit"]').click();
      
      // 3. Verify submission
      cy.contains('Exeat request submitted successfully').should('be.visible');
      cy.contains('Pending Parent Approval').should('be.visible');
      
      // 4. View details
      cy.get('button').contains('View Details').first().click();
      cy.contains(testData.exeat.reason).should('be.visible');
    });
  });
}); 