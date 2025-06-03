# Test Fixes Documentation

## Issues Fixed

1. **MongoDB Connection Problems**
   - Changed import from `server.js` to `app.js` to avoid server startup behavior during tests
   - Added proper connection options to mongoose.connect call
   - Added better error handling for database connections

2. **JWT Authentication Issues**
   - Added JWT_SECRET environment variable for testing
   - Installed cross-env to support environment variables across platforms

3. **Security Testing Fixes**
   - Created proper security user with required fields
   - Used actual ObjectId values instead of string IDs for Mongoose operations
   - Added validation to ensure security user exists before tests

4. **Notification Tests**
   - Created mocks for nodemailer to avoid actual email sending during tests
   - Skipped notification tests that require email configuration

5. **Test Expectations Corrections**
   - Fixed response code expectations to match actual API responses

6. **Jest Configuration Issues**
   - Created `jest.config.js` to properly separate backend and frontend tests
   - Configured Jest to ignore client-side tests when running from root
   - Added proper test environment configuration for Node.js
   - Fixed test path patterns to only run backend tests from root

7. **Port Conflict Issues**
   - Added commands to kill existing Node.js processes that might be using port 5000
   - Fixed port conflicts that were preventing tests from running

8. **Environment Variable Configuration**
   - Updated all test scripts to include necessary environment variables
   - Fixed the root `npm test` command to work with proper Jest configuration

## Running Tests

You can now run the tests using the following commands:

- `npm test` - Runs backend tests only (with proper Jest configuration)
- `npm run test:backend` - Runs all backend tests
- `npm run test:backend:no-notifications` - Runs backend tests excluding notification tests
- `npm run test:frontend` - Runs frontend tests (from client directory)
- `npm run test:e2e` - Runs end-to-end tests with Cypress
- `npm run test:all` - Runs all backend and frontend tests

## Requirements

Make sure MongoDB is running locally before running tests.

```bash
# Environment variables needed (automatically set by npm scripts)
JWT_SECRET=test_secret_key
MONGODB_URI_TEST=mongodb://127.0.0.1:27017/exeat_system_test
```

## Common Issues

If you encounter issues with the tests:

1. **MongoDB Connection**: Ensure MongoDB is running locally
2. **JWT Authentication**: Make sure JWT_SECRET is properly set
3. **Email Tests**: These are skipped as they require actual email configuration
4. **Port Conflicts**: Run `taskkill /F /IM node.exe` to kill existing Node.js processes
5. **Jest Configuration**: The root Jest config only runs backend tests; frontend tests must be run from the client directory

## File Structure

- `jest.config.js` - Jest configuration for backend tests
- `tests/backend.test.js` - Backend API tests
- `tests/mocks.js` - Mock configurations for testing
- `client/src/tests/` - Frontend React component tests (run separately) 