#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive Test Suite for Exeat System\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n${colors.blue}${description}...${colors.reset}`);
    execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    log(`✅ ${description} completed successfully`, 'green');
    return true;
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    return false;
  }
}

function checkDependencies() {
  log('\n🔍 Checking dependencies...', 'blue');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const hasPlaywright = packageJson.devDependencies && packageJson.devDependencies['@playwright/test'];
  const hasCypress = packageJson.devDependencies && packageJson.devDependencies['cypress'];
  
  if (!hasPlaywright) {
    log('⚠️  Playwright not found. Installing...', 'yellow');
    runCommand('npm install @playwright/test --save-dev --legacy-peer-deps', 'Installing Playwright');
    runCommand('npx playwright install', 'Installing Playwright browsers');
  }
  
  if (!hasCypress) {
    log('⚠️  Cypress not found. Installing...', 'yellow');
    runCommand('npm install cypress --save-dev --legacy-peer-deps', 'Installing Cypress');
  }
  
  log('✅ Dependencies check completed', 'green');
}

function runUnitTests() {
  log('\n🧪 Running Unit Tests (Jest)...', 'blue');
  return runCommand('npm test -- --watchAll=false --coverage', 'Unit Tests');
}

function runPlaywrightTests() {
  log('\n🎭 Running Playwright E2E Tests...', 'blue');
  return runCommand('npx playwright test', 'Playwright Tests');
}

function runPlaywrightTestsUI() {
  log('\n🎭 Running Playwright Tests with UI...', 'blue');
  return runCommand('npx playwright test --ui', 'Playwright Tests with UI');
}

function runCypressTests() {
  log('\n🌲 Running Cypress E2E Tests...', 'blue');
  return runCommand('npx cypress run', 'Cypress Tests');
}

function generateTestReport() {
  log('\n📊 Generating Test Report...', 'blue');
  
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      unit: { status: 'pending' },
      playwright: { status: 'pending' },
      cypress: { status: 'pending' }
    }
  };
  
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
  log('✅ Test report generated', 'green');
}

function showMenu() {
  log('\n' + '='.repeat(50), 'bold');
  log('🎯 EXEAT SYSTEM TEST SUITE', 'bold');
  log('='.repeat(50), 'bold');
  log('Choose an option:');
  log('1. 🔍 Check Dependencies');
  log('2. 🧪 Run Unit Tests (Jest)');
  log('3. 🎭 Run Playwright E2E Tests');
  log('4. 🎭 Run Playwright Tests with UI');
  log('5. 🌲 Run Cypress E2E Tests');
  log('6. 🚀 Run All Tests');
  log('7. 📊 Generate Test Report');
  log('8. ❌ Exit');
  log('='.repeat(50), 'bold');
}

function runAllTests() {
  log('\n🚀 Running Complete Test Suite...', 'bold');
  
  const results = {
    dependencies: checkDependencies(),
    unit: runUnitTests(),
    playwright: runPlaywrightTests(),
    cypress: runCypressTests()
  };
  
  log('\n' + '='.repeat(50), 'bold');
  log('📊 TEST RESULTS SUMMARY', 'bold');
  log('='.repeat(50), 'bold');
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    const color = passed ? 'green' : 'red';
    log(`${test.toUpperCase()}: ${status}`, color);
  });
  
  const allPassed = Object.values(results).every(result => result);
  if (allPassed) {
    log('\n🎉 ALL TESTS PASSED!', 'green');
  } else {
    log('\n⚠️  SOME TESTS FAILED. Check the output above.', 'yellow');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Interactive mode
    showMenu();
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (key) => {
      if (key === '\u0003') {
        process.exit();
      }
      
      const choice = key.trim();
      switch (choice) {
        case '1':
          checkDependencies();
          break;
        case '2':
          runUnitTests();
          break;
        case '3':
          runPlaywrightTests();
          break;
        case '4':
          runPlaywrightTestsUI();
          break;
        case '5':
          runCypressTests();
          break;
        case '6':
          runAllTests();
          break;
        case '7':
          generateTestReport();
          break;
        case '8':
          log('\n👋 Goodbye!', 'blue');
          process.exit(0);
          break;
        default:
          log('Invalid choice. Please try again.', 'red');
      }
      
      setTimeout(() => {
        showMenu();
      }, 1000);
    });
  } else {
    // Command line mode
    const command = args[0];
    switch (command) {
      case 'deps':
        checkDependencies();
        break;
      case 'unit':
        runUnitTests();
        break;
      case 'playwright':
        runPlaywrightTests();
        break;
      case 'playwright-ui':
        runPlaywrightTestsUI();
        break;
      case 'cypress':
        runCypressTests();
        break;
      case 'all':
        runAllTests();
        break;
      case 'report':
        generateTestReport();
        break;
      default:
        log('Usage: node run-tests.js [deps|unit|playwright|playwright-ui|cypress|all|report]', 'red');
        process.exit(1);
    }
  }
}

// Handle process termination
process.on('SIGINT', () => {
  log('\n\n👋 Test runner terminated by user', 'yellow');
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log(`\n❌ Uncaught Exception: ${error.message}`, 'red');
  process.exit(1);
});

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
}); 