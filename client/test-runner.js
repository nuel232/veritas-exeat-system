const { execSync } = require('child_process');

console.log('🚀 Starting Exeat System Test Suite\n');

function runCommand(command, description) {
  try {
    console.log(`\n🔍 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed successfully\n`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} failed\n`);
    return false;
  }
}

// Check if we're in the right directory
if (!require('fs').existsSync('package.json')) {
  console.log('❌ Please run this script from the client directory');
  process.exit(1);
}

// Run tests based on command line arguments
const args = process.argv.slice(2);
const testType = args[0] || 'all';

switch (testType) {
  case 'playwright':
    runCommand('npx playwright test', 'Playwright E2E Tests');
    break;
    
  case 'playwright-ui':
    runCommand('npx playwright test --ui', 'Playwright Tests with UI');
    break;
    
  case 'cypress':
    runCommand('npx cypress run', 'Cypress E2E Tests');
    break;
    
  case 'unit':
    runCommand('npm test -- --watchAll=false', 'Unit Tests');
    break;
    
  case 'all':
    console.log('🧪 Running all test suites...\n');
    
    const results = {
      unit: runCommand('npm test -- --watchAll=false', 'Unit Tests'),
      playwright: runCommand('npx playwright test', 'Playwright E2E Tests'),
      cypress: runCommand('npx cypress run', 'Cypress E2E Tests')
    };
    
    console.log('📊 Test Results Summary:');
    console.log(`Unit Tests: ${results.unit ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Playwright Tests: ${results.playwright ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Cypress Tests: ${results.cypress ? '✅ PASSED' : '❌ FAILED'}`);
    
    const allPassed = Object.values(results).every(result => result);
    if (allPassed) {
      console.log('\n🎉 ALL TESTS PASSED!');
    } else {
      console.log('\n⚠️  Some tests failed. Check the output above.');
      process.exit(1);
    }
    break;
    
  default:
    console.log('Usage: node test-runner.js [playwright|playwright-ui|cypress|unit|all]');
    console.log('Default: runs all tests');
    process.exit(1);
} 