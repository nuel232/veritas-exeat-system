/// <reference types="cypress" />

describe('Comprehensive Exeat System Tests', () => {
  // Test data
  const testUsers = {
    student: {
      email: 'teststudent@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Student',
      department: 'Computer Science',
      matricNumber: 'CS123456',
      phoneNumber: '1234567890',
      parentEmail: 'parent@example.com'
    },
    dean: {
      email: 'testdean@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Dean'
    },
    staff: {
      email: 'teststaff@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Staff'
    },
    security: {
      email: 'testsecurity@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'Security'
    }
  };

  const exeatData = {
    reason: 'Medical appointment',
    destination: 'Hospital',
    departureDate: '2024-12-20',
    returnDate: '2024-12-22',
    emergencyContact: {
      name: 'Parent Name',
      phone: '1234567890',
      relationship: 'Parent'
    }
  };

  // Helper functions
  const login = (userType) => {
    const user = testUsers[userType];
    cy.visit('/login');
    cy.get('input[name="email"]').type(user.email);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  };

  const clearStorage = () => {
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
  };

  beforeEach(() => {
    clearStorage();
    cy.visit('/');
  });

  // ===== FORM VALIDATION TESTS =====
  describe('Form Validation Tests', () => {
    it('should validate student registration form fields', () => {
      cy.visit('/register');
      
      // Test required field validation
      cy.get('button[type="submit"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'required');
      
      // Test email format validation
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('input[name="firstName"]').type('John');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'valid email');
      
      // Test password strength validation
      cy.get('input[name="email"]').clear().type('valid@email.com');
      cy.get('input[name="password"]').type('123');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'at least 6 characters');
      
      // Test successful form submission
      cy.get('input[name="password"]').clear().type('password123');
      cy.get('input[name="firstName"]').clear().type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('select[name="role"]').select('student');
      cy.get('input[name="department"]').type('Computer Science');
      cy.get('input[name="matricNumber"]').type('CS123456');
      cy.get('input[name="phoneNumber"]').type('1234567890');
      cy.get('input[name="parentEmail"]').type('parent@email.com');
      
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should validate login form fields', () => {
      cy.visit('/login');
      
      // Test empty form submission
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
      
      // Test invalid credentials
      cy.get('input[name="email"]').type('wrong@email.com');
      cy.get('input[name="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
      
      // Test successful login
      cy.get('input[name="email"]').clear().type(testUsers.student.email);
      cy.get('input[name="password"]').clear().type(testUsers.student.password);
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should validate exeat request form fields', () => {
      login('student');
      
      // Navigate to exeat form
      cy.get('[data-testid="create-exeat-btn"]').click();
      cy.url().should('include', '/exeat/new');
      
      // Test empty form submission
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
      
      // Test date validation
      cy.get('input[name="departureDate"]').type('2023-01-01'); // Past date
      cy.get('input[name="returnDate"]').type('2023-01-02');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'future date');
      
      // Test return date before departure date
      cy.get('input[name="departureDate"]').clear().type('2024-12-25');
      cy.get('input[name="returnDate"]').clear().type('2024-12-20');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'after departure');
      
      // Test phone number validation
      cy.get('input[name="emergencyContact.phone"]').type('abc');
      cy.get('button[type="submit"]').click();
      cy.get('[data-testid="error-message"]').should('contain', 'valid phone number');
      
      // Test successful form submission
      cy.get('input[name="departureDate"]').clear().type(exeatData.departureDate);
      cy.get('input[name="returnDate"]').clear().type(exeatData.returnDate);
      cy.get('input[name="reason"]').type(exeatData.reason);
      cy.get('input[name="destination"]').type(exeatData.destination);
      cy.get('input[name="emergencyContact.name"]').type(exeatData.emergencyContact.name);
      cy.get('input[name="emergencyContact.phone"]').clear().type(exeatData.emergencyContact.phone);
      cy.get('input[name="emergencyContact.relationship"]').type(exeatData.emergencyContact.relationship);
      
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
      cy.contains('Exeat request submitted successfully').should('be.visible');
    });
  });

  // ===== BUTTON FUNCTIONALITY TESTS =====
  describe('Button Functionality Tests', () => {
    it('should test all navigation buttons', () => {
      login('student');
      
      // Test dashboard navigation
      cy.get('[data-testid="dashboard-link"]').click();
      cy.url().should('include', '/dashboard');
      
      // Test profile navigation
      cy.get('[data-testid="profile-link"]').click();
      cy.url().should('include', '/profile');
      
      // Test logout button
      cy.get('[data-testid="logout-btn"]').click();
      cy.url().should('include', '/login');
    });

    it('should test exeat action buttons', () => {
      login('student');
      
      // Create an exeat request first
      cy.get('[data-testid="create-exeat-btn"]').click();
      cy.get('input[name="reason"]').type(exeatData.reason);
      cy.get('input[name="destination"]').type(exeatData.destination);
      cy.get('input[name="departureDate"]').type(exeatData.departureDate);
      cy.get('input[name="returnDate"]').type(exeatData.returnDate);
      cy.get('input[name="emergencyContact.name"]').type(exeatData.emergencyContact.name);
      cy.get('input[name="emergencyContact.phone"]').type(exeatData.emergencyContact.phone);
      cy.get('input[name="emergencyContact.relationship"]').type(exeatData.emergencyContact.relationship);
      cy.get('button[type="submit"]').click();
      
      // Test view details button
      cy.get('[data-testid="view-exeat-btn"]').first().click();
      cy.url().should('include', '/exeat/');
      
      // Test back button
      cy.get('[data-testid="back-btn"]').click();
      cy.url().should('include', '/dashboard');
      
      // Test edit button (if available)
      cy.get('[data-testid="edit-exeat-btn"]').first().click();
      cy.url().should('include', '/exeat/edit/');
    });

    it('should test staff approval buttons', () => {
      login('dean');
      
      // Navigate to pending approvals
      cy.get('[data-testid="pending-approvals-link"]').click();
      cy.url().should('include', '/pending-approvals');
      
      // Test view details button
      cy.get('[data-testid="view-approval-btn"]').first().click();
      cy.url().should('include', '/exeat/');
      
      // Test approve button
      cy.get('[data-testid="approve-btn"]').click();
      cy.get('textarea[name="comments"]').type('Approved by dean');
      cy.get('[data-testid="confirm-approval-btn"]').click();
      cy.contains('Exeat approved successfully').should('be.visible');
      
      // Test reject button
      cy.get('[data-testid="reject-btn"]').click();
      cy.get('textarea[name="comments"]').type('Rejected by dean');
      cy.get('[data-testid="confirm-rejection-btn"]').click();
      cy.contains('Exeat rejected successfully').should('be.visible');
    });
  });

  // ===== USER FLOW TESTS =====
  describe('Complete User Flow Tests', () => {
    it('should complete full student exeat flow', () => {
      // 1. Student login
      login('student');
      
      // 2. Create exeat request
      cy.get('[data-testid="create-exeat-btn"]').click();
      cy.get('input[name="reason"]').type(exeatData.reason);
      cy.get('input[name="destination"]').type(exeatData.destination);
      cy.get('input[name="departureDate"]').type(exeatData.departureDate);
      cy.get('input[name="returnDate"]').type(exeatData.returnDate);
      cy.get('input[name="emergencyContact.name"]').type(exeatData.emergencyContact.name);
      cy.get('input[name="emergencyContact.phone"]').type(exeatData.emergencyContact.phone);
      cy.get('input[name="emergencyContact.relationship"]').type(exeatData.emergencyContact.relationship);
      cy.get('button[type="submit"]').click();
      
      // 3. Verify request is pending
      cy.contains('Pending Parent Approval').should('be.visible');
      
      // 4. View request details
      cy.get('[data-testid="view-exeat-btn"]').first().click();
      cy.contains(exeatData.reason).should('be.visible');
      cy.contains(exeatData.destination).should('be.visible');
      
      // 5. Go back to dashboard
      cy.get('[data-testid="back-btn"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should complete full staff approval flow', () => {
      // 1. Staff login
      login('dean');
      
      // 2. Navigate to pending approvals
      cy.get('[data-testid="pending-approvals-link"]').click();
      
      // 3. View approval details
      cy.get('[data-testid="view-approval-btn"]').first().click();
      
      // 4. Approve request
      cy.get('[data-testid="approve-btn"]').click();
      cy.get('textarea[name="comments"]').type('Approved by staff');
      cy.get('[data-testid="confirm-approval-btn"]').click();
      
      // 5. Verify approval
      cy.contains('Exeat approved successfully').should('be.visible');
      cy.contains('Approved').should('be.visible');
    });

    it('should complete security check-out/in flow', () => {
      // 1. Security login
      login('security');
      
      // 2. Navigate to verification page
      cy.get('[data-testid="verification-link"]').click();
      
      // 3. Search for student
      cy.get('input[name="matricNumber"]').type(testUsers.student.matricNumber);
      cy.get('[data-testid="search-btn"]').click();
      
      // 4. Check out student
      cy.get('[data-testid="checkout-btn"]').click();
      cy.get('input[name="location"]').type('Main Gate');
      cy.get('textarea[name="securityNotes"]').type('Student checked out');
      cy.get('[data-testid="confirm-checkout-btn"]').click();
      
      // 5. Verify check out
      cy.contains('Student checked out successfully').should('be.visible');
      
      // 6. Check in student
      cy.get('[data-testid="checkin-btn"]').click();
      cy.get('input[name="location"]').type('Main Gate');
      cy.get('textarea[name="securityNotes"]').type('Student checked in');
      cy.get('[data-testid="confirm-checkin-btn"]').click();
      
      // 7. Verify check in
      cy.contains('Student checked in successfully').should('be.visible');
    });
  });

  // ===== API INTEGRATION TESTS =====
  describe('API Integration Tests', () => {
    it('should test exeat API endpoints', () => {
      login('student');
      
      // Test GET /api/exeat/my-requests
      cy.request({
        method: 'GET',
        url: '/api/exeat/my-requests',
        headers: {
          'Authorization': `Bearer ${Cypress.env('studentToken')}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
      
      // Test POST /api/exeat
      cy.request({
        method: 'POST',
        url: '/api/exeat',
        headers: {
          'Authorization': `Bearer ${Cypress.env('studentToken')}`,
          'Content-Type': 'application/json'
        },
        body: exeatData
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('_id');
      });
    });

    it('should test authentication API endpoints', () => {
      // Test login API
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: testUsers.student.email,
          password: testUsers.student.password
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('token');
      });
      
      // Test invalid login
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
          email: 'wrong@email.com',
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
      });
    });
  });

  // ===== ERROR HANDLING TESTS =====
  describe('Error Handling Tests', () => {
    it('should handle network errors gracefully', () => {
      // Intercept API calls and force them to fail
      cy.intercept('POST', '/api/auth/login', { forceNetworkError: true });
      
      cy.visit('/login');
      cy.get('input[name="email"]').type(testUsers.student.email);
      cy.get('input[name="password"]').type(testUsers.student.password);
      cy.get('button[type="submit"]').click();
      
      cy.contains('Network error').should('be.visible');
    });

    it('should handle server errors gracefully', () => {
      // Intercept API calls and return server error
      cy.intercept('GET', '/api/exeat/my-requests', {
        statusCode: 500,
        body: { message: 'Internal server error' }
      });
      
      login('student');
      cy.get('[data-testid="my-requests-link"]').click();
      
      cy.contains('Server error').should('be.visible');
    });

    it('should handle validation errors properly', () => {
      cy.visit('/register');
      
      // Submit form with invalid data
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      
      // Should show specific validation errors
      cy.get('[data-testid="email-error"]').should('contain', 'valid email');
    });
  });

  // ===== PERFORMANCE TESTS =====
  describe('Performance Tests', () => {
    it('should load dashboard within acceptable time', () => {
      login('student');
      
      // Measure dashboard load time
      cy.window().then((win) => {
        const startTime = win.performance.now();
        
        cy.visit('/dashboard').then(() => {
          const endTime = win.performance.now();
          const loadTime = endTime - startTime;
          
          // Dashboard should load within 3 seconds
          expect(loadTime).to.be.lessThan(3000);
        });
      });
    });

    it('should handle large data sets efficiently', () => {
      login('dean');
      
      // Test with many exeat requests
      cy.intercept('GET', '/api/exeat/pending-approval', {
        fixture: 'large-exeat-list.json'
      });
      
      cy.get('[data-testid="pending-approvals-link"]').click();
      
      // Should load without significant delay
      cy.get('[data-testid="exeat-list"]').should('be.visible');
      cy.get('[data-testid="exeat-item"]').should('have.length.greaterThan', 50);
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  describe('Accessibility Tests', () => {
    it('should have proper ARIA labels', () => {
      cy.visit('/login');
      
      // Check for proper form labels
      cy.get('input[name="email"]').should('have.attr', 'aria-label');
      cy.get('input[name="password"]').should('have.attr', 'aria-label');
      
      // Check for proper button labels
      cy.get('button[type="submit"]').should('have.attr', 'aria-label');
    });

    it('should be keyboard navigable', () => {
      cy.visit('/login');
      
      // Test tab navigation
      cy.get('body').tab();
      cy.focused().should('have.attr', 'name', 'email');
      
      cy.get('body').tab();
      cy.focused().should('have.attr', 'name', 'password');
      
      cy.get('body').tab();
      cy.focused().should('have.attr', 'type', 'submit');
    });

    it('should have proper color contrast', () => {
      cy.visit('/login');
      
      // Check text contrast ratios
      cy.get('h1').should('have.css', 'color');
      cy.get('label').should('have.css', 'color');
      
      // This would need a more sophisticated test in a real environment
      // to actually calculate contrast ratios
    });
  });
}); 