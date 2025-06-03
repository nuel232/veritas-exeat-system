module.exports = {
  // Test environment
  testEnvironment: 'node',
  
  // Test timeout
  testTimeout: 10000,
  
  // Test patterns
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  
  // Ignore client-side tests when running from root
  testPathIgnorePatterns: [
    '/node_modules/',
    '/client/'
  ],
  
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/mocks.js'],
  
  // Coverage settings
  collectCoverageFrom: [
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    'app.js',
    'server.js'
  ],
  
  // Ignore coverage for certain files
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/client/',
    '/tests/'
  ]
}; 