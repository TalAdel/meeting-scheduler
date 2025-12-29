import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database';
import UserRepository from '../repositories/user.repository';
import AuthService from '../services/auth.service';
import { CustomError } from '../lib/custom-error';


/**
 * AUTH SERVICE TEST SCRIPT
 * 
 * This tests AuthService business logic layer.
 * Tests signup, login, and password change flows.
 * 
 * Usage: npx ts-node src/test/test-auth-service.ts
 */

const userRepository = new UserRepository(pool);
const authService = new AuthService(userRepository);

// Test data
const testEmail = `test${Date.now()}@example.com`;
const testFullName = 'Test User';
const testPassword = 'TestPassword123!';
let testUserId: string;

// Helper to track test results
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    testsPassed++;
  } else {
    console.log(`  ❌ FAILED: ${message}`);
    testsFailed++;
    throw new Error(`Test failed: ${message}`);
  }
}

async function runTests() {
  console.log('\n=================================================');
  console.log('🧪 TESTING AUTH SERVICE');
  console.log('=================================================\n');

  try {
    // =====================================================
    // TEST 1: SIGNUP - SUCCESS
    // =====================================================
    console.log('TEST 1: Signup - Success');
    const signupResult = await authService.signup(testEmail, testFullName, testPassword);
    
    assert(signupResult.id !== undefined, 'User has ID');
    assert(signupResult.email === testEmail, 'Email matches');
    assert(signupResult.fullName === testFullName, 'Full name matches');
    assert(!('password' in signupResult), '⚠️ SECURITY: Password NOT in signup response');
    assert(signupResult.createdAt !== undefined, 'Has createdAt');
    assert(signupResult.updatedAt !== undefined, 'Has updatedAt');
    
    testUserId = signupResult.id;
    console.log(`  📝 Created user with ID: ${testUserId}\n`);

    // =====================================================
    // TEST 2: SIGNUP - DUPLICATE EMAIL
    // =====================================================
    console.log('TEST 2: Signup - Duplicate Email');
    try {
      await authService.signup(testEmail, testFullName, testPassword);
      assert(false, 'Should have thrown error for duplicate email');
    } catch (error) {
      assert(error instanceof CustomError, 'Throws CustomError');
      assert((error as CustomError).statusCode === 400, 'Returns 400 status');
      assert((error as CustomError).message.includes('already exists'), 'Error message mentions already exists');
      console.log(`  📝 Error message: "${(error as CustomError).message}"`);
    }
    console.log('');

    // =====================================================
    // TEST 3: LOGIN - SUCCESS
    // =====================================================
    console.log('TEST 3: Login - Success');
    const loginResult = await authService.login(testEmail, testPassword);
    
    assert(loginResult.user !== undefined, 'User object in response');
    assert(loginResult.token !== undefined, 'Token in response');
    assert(loginResult.user.id === testUserId, 'User ID matches');
    assert(loginResult.user.email === testEmail, 'User email matches');
    assert(!('password' in loginResult.user), '⚠️ SECURITY: Password NOT in login response');
    assert(loginResult.token.length > 20, 'Token is not empty');
    
    console.log(`  📝 Generated token: ${loginResult.token.substring(0, 20)}...`);
    console.log('');

    // =====================================================
    // TEST 4: LOGIN - WRONG PASSWORD
    // =====================================================
    console.log('TEST 4: Login - Wrong Password');
    try {
      await authService.login(testEmail, 'WrongPassword123!');
      assert(false, 'Should have thrown error for wrong password');
    } catch (error) {
      assert(error instanceof CustomError, 'Throws CustomError');
      assert((error as CustomError).statusCode === 401, 'Returns 401 status');
      console.log(`  📝 Error message: "${(error as CustomError).message}"`);
    }
    console.log('');

    // =====================================================
    // TEST 5: LOGIN - NON-EXISTENT EMAIL
    // =====================================================
    console.log('TEST 5: Login - Non-existent Email');
    try {
      await authService.login('nonexistent@example.com', testPassword);
      assert(false, 'Should have thrown error for non-existent email');
    } catch (error) {
      assert(error instanceof CustomError, 'Throws CustomError');
      console.log(`  📝 Error message: "${(error as CustomError).message}"`);
      
      // Get the error from wrong password test
      let wrongPasswordError: string = '';
      try {
        await authService.login(testEmail, 'WrongPassword123!');
      } catch (e) {
        wrongPasswordError = (e as CustomError).message;
      }
      
      // SECURITY CHECK: Same error message prevents email enumeration
      const sameMessage = (error as CustomError).message === wrongPasswordError;
      if (sameMessage) {
        console.log('  ✅ SECURITY: Same error message as wrong password (prevents email enumeration)');
        testsPassed++;
      } else {
        console.log('  ⚠️  WARNING: Different error messages allow email enumeration attacks!');
        console.log(`     - Non-existent email: "${(error as CustomError).message}"`);
        console.log(`     - Wrong password: "${wrongPasswordError}"`);
        console.log('  💡 FIX: Use same generic message for both cases');
      }
    }
    console.log('');

    // =====================================================
    // TEST 6: CHANGE PASSWORD
    // =====================================================
    console.log('TEST 6: Change Password');
    const newPassword = 'NewPassword456!';
    await authService.changePassword(testUserId, testPassword, newPassword);
    
    // Verify old password no longer works
    try {
      await authService.login(testEmail, testPassword);
      assert(false, 'Old password should not work after change');
    } catch (error) {
      assert(error instanceof CustomError, 'Old password rejected');
      assert((error as CustomError).statusCode === 401, 'Returns 401 for old password');
    }
    
    // Verify new password works
    const loginWithNewPassword = await authService.login(testEmail, newPassword);
    assert(loginWithNewPassword.token !== undefined, 'Login successful with new password');
    assert(!('password' in loginWithNewPassword.user), 'Password not in response');
    console.log('');

    // =====================================================
    // TEST 7: PASSWORD HASHING
    // =====================================================
    console.log('TEST 7: Password Security');
    
    // Create another user to test
    const testEmail2 = `test${Date.now() + 1}@example.com`;
    const samePassword = 'SamePassword123!';
    
    const user1 = await authService.signup(testEmail2, 'User 1', samePassword);
    const user2 = await authService.signup(`test${Date.now() + 2}@example.com`, 'User 2', samePassword);
    
    // Fetch their password hashes from database
    const dbUser1 = await userRepository.findUserById(user1.id);
    const dbUser2 = await userRepository.findUserById(user2.id);
    
    assert(dbUser1!.password !== dbUser2!.password, 'Same password produces different hashes (unique salts)');
    assert(dbUser1!.password.startsWith('$2'), 'Password is bcrypt hash');
    assert(dbUser1!.password.length === 60, 'Bcrypt hash is 60 characters');
    
    // Cleanup
    await userRepository.deleteUser(user1.id);
    await userRepository.deleteUser(user2.id);
    console.log('');

    // =====================================================
    // CLEANUP
    // =====================================================
    console.log('Cleaning up test data...');
    await userRepository.deleteUser(testUserId);
    console.log('  ✅ Test user deleted\n');

    // =====================================================
    // SUMMARY
    // =====================================================
    console.log('=================================================');
    console.log('📊 TEST SUMMARY');
    console.log('=================================================');
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed}`);
    console.log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
    console.log('=================================================\n');

    if (testsFailed === 0) {
      console.log('🎉 ALL TESTS PASSED! AuthService is working correctly!\n');
    } else {
      console.log('⚠️  Some tests failed. Check the output above.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ TEST ERROR:', error);
    console.log('\n=================================================');
    console.log('📊 TEST SUMMARY (INCOMPLETE)');
    console.log('=================================================');
    console.log(`✅ Tests Passed: ${testsPassed}`);
    console.log(`❌ Tests Failed: ${testsFailed + 1}`);
    console.log('=================================================\n');
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Run tests
runTests();