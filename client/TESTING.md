# 🧪 Exeat System Testing Guide

This guide covers all automated testing for the Exeat System, including form validation, button functionality, user flows, and API testing.

## 🚀 Quick Start

### Run All Tests
```bash
cd client
node test-runner.js
```

### Run Specific Test Types
```bash
# Playwright E2E Tests (Recommended)
node test-runner.js playwright

# Playwright with UI (Interactive)
node test-runner.js playwright-ui

# Cypress E2E Tests
node test-runner.js cypress

# Unit Tests (Jest)
node test-runner.js unit
```

## 📋 Test Coverage

### ✅ What's Tested Automatically

#### 1. **Form Validation**
- ✅ Empty form submission
- ✅ Invalid email formats
- ✅ Password strength validation
- ✅ Required field validation
- ✅ Date validation (past dates, return before departure)
- ✅ Phone number format validation
- ✅ Emergency contact validation

#### 2. **Button Functionality**
- ✅ Navigation buttons (Dashboard, Profile, Logout)
- ✅ Form submission buttons
- ✅ Action buttons (Approve, Reject, View Details)
- ✅ Cancel/Back buttons
- ✅ Mobile menu buttons

#### 3. **User Flows**
- ✅ Complete student registration
- ✅ Student login and dashboard access
- ✅ Exeat request creation
- ✅ Staff approval workflow
- ✅ Security check-out/in process
- ✅ Parent approval via email

#### 4. **API Integration**
- ✅ Authentication endpoints
- ✅ Exeat CRUD operations
- ✅ Error handling
- ✅ Network failure scenarios

#### 5. **UI/UX Testing**
- ✅ Responsive design (mobile/desktop)
- ✅ Accessibility (keyboard navigation, ARIA labels)
- ✅ Loading states
- ✅ Error message display
- ✅ Success message display

## 🛠️ Test Frameworks Used

### 1. **Playwright** (Primary E2E Testing)
- **Speed**: 3x faster than Cypress
- **Reliability**: Better handling of modern web apps
- **Browser Support**: Chrome, Firefox, Safari, Edge
- **Mobile Testing**: Built-in mobile viewport testing

### 2. **Cypress** (Alternative E2E Testing)
- **Mature**: Large community and documentation
- **Real-time**: Live reload and debugging
- **Visual**: Great UI for test development

### 3. **Jest** (Unit Testing)
- **React Testing**: Component testing
- **API Testing**: Backend endpoint testing
- **Mocking**: Easy mocking of dependencies

## 📁 Test File Structure

```
client/
├── tests/
│   ├── auth.spec.js          # Authentication tests
│   ├── exeat-forms.spec.js   # Exeat form validation
│   └── dashboard.spec.js     # Dashboard functionality
├── playwright.config.js      # Playwright configuration
├── test-runner.js           # Test execution script
└── package.json             # Test scripts
```

## 🎯 Test Scenarios

### Authentication Tests (`auth.spec.js`)
```javascript
// Tests included:
- Login form validation
- Registration form validation
- Password strength requirements
- Email format validation
- Navigation between auth pages
- Error handling for invalid credentials
- Network error handling
```

### Exeat Form Tests (`exeat-forms.spec.js`)
```javascript
// Tests included:
- Empty form validation
- Required field validation
- Date validation (past dates, logic)
- Phone number format validation
- Emergency contact validation
- File upload functionality
- Form submission success/failure
- Cancel/back button functionality
```

### Dashboard Tests (`dashboard.spec.js`)
```javascript
// Tests included:
- Dashboard element visibility
- Navigation menu functionality
- Exeat request table display
- Action button functionality
- Responsive design testing
- Performance testing
- Role-based dashboard access
```

## 🚀 Running Tests

### 1. **Playwright Tests** (Recommended)
```bash
# Run all Playwright tests
npm run test:e2e

# Run with UI (interactive)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

### 2. **Cypress Tests**
```bash
# Run all Cypress tests
npx cypress run

# Open Cypress UI
npx cypress open
```

### 3. **Unit Tests**
```bash
# Run Jest tests
npm test

# Run with coverage
npm test -- --coverage
```

## 🔧 Configuration

### Playwright Configuration
```javascript
// playwright.config.js
module.exports = {
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: {
    command: 'npm start',
    url: 'http://localhost:3000',
    timeout: 120 * 1000,
  },
}
```

### Test Data
```javascript
// Test data is defined in each test file
const testData = {
  student: {
    email: 'teststudent@example.com',
    password: 'password123',
    // ... other fields
  },
  exeat: {
    reason: 'Medical appointment',
    destination: 'Hospital',
    // ... other fields
  }
};
```

## 🐛 Debugging Tests

### 1. **Playwright Debug Mode**
```bash
npm run test:e2e:debug
```
- Opens browser with step-by-step execution
- Shows test actions in real-time
- Allows inspection of elements

### 2. **Cypress Debug Mode**
```bash
npx cypress open
```
- Interactive test runner
- Real-time test execution
- Element inspection tools

### 3. **Common Issues & Solutions**

#### Test Fails on Form Submission
```javascript
// Check if form elements exist
await expect(page.locator('input[name="email"]')).toBeVisible();

// Check if button is clickable
await expect(page.locator('button[type="submit"]')).toBeEnabled();
```

#### Test Fails on Navigation
```javascript
// Wait for navigation to complete
await expect(page).toHaveURL(/.*dashboard/);

// Check if element is visible after navigation
await expect(page.locator('h1')).toBeVisible();
```

#### Test Fails on API Calls
```javascript
// Mock API responses for consistent testing
await page.route('**/api/auth/login', route => 
  route.fulfill({ status: 200, body: JSON.stringify({ token: 'test-token' }) })
);
```

## 📊 Test Reports

### Playwright Reports
- HTML reports generated automatically
- View with: `npm run test:e2e:report`
- Includes screenshots, videos, and traces

### Coverage Reports
```bash
npm test -- --coverage
```
- Shows code coverage percentage
- Identifies untested code paths

## 🔄 Continuous Integration

### GitHub Actions Example
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run test:e2e
```

## 🎯 Best Practices

### 1. **Test Organization**
- Group related tests in describe blocks
- Use descriptive test names
- Keep tests independent

### 2. **Data Management**
- Use test data objects
- Clean up after tests
- Use unique data for each test

### 3. **Assertions**
- Test one thing per test
- Use specific assertions
- Check both positive and negative cases

### 4. **Performance**
- Run tests in parallel when possible
- Use headless mode for CI
- Optimize test data setup

## 🆘 Getting Help

### Common Commands
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run specific test file
npx playwright test auth.spec.js

# Run tests with specific browser
npx playwright test --project=firefox

# Run tests in debug mode
npx playwright test --debug
```

### Troubleshooting
1. **Tests fail intermittently**: Add wait conditions
2. **Elements not found**: Check selectors and timing
3. **API errors**: Mock external dependencies
4. **Performance issues**: Optimize test data and setup

---

## 🎉 You're All Set!

With this testing setup, you can now:
- ✅ Automatically test all forms and validation
- ✅ Verify button functionality across the app
- ✅ Test complete user workflows
- ✅ Catch bugs before they reach production
- ✅ Ensure consistent user experience

**No more manual testing!** 🚀 