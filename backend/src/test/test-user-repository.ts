import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database';
import UserRepository from '../repositories/user.repository';
import PasswordUtils from '../utils/password.service';

/**
 * USER REPOSITORY TEST SCRIPT
 * 
 * This tests ALL UserRepository methods against the real database.
 * Run this to verify everything works before testing the full auth flow.
 * 
 * Usage: npx ts-node src/test/test-user-repository.ts
 */

const userRepository = new UserRepository(pool);

// Test data
const testEmail = `test${Date.now()}@example.com`;
const testEmail2 = `test${Date.now() + 1}@example.com`;
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
  console.log('🧪 TESTING USER REPOSITORY');
  console.log('=================================================\n');

  try {
    // =====================================================
    // TEST 1: CREATE USER
    // =====================================================
    console.log('TEST 1: Create User');
    const hashedPassword = await PasswordUtils.hashPassword(testPassword);
    const createdUser = await userRepository.createUser(testEmail, testFullName, hashedPassword);
    
    assert(createdUser.id !== undefined, 'User has ID');
    assert(createdUser.email === testEmail, 'Email matches');
    assert(createdUser.fullName === testFullName, 'Full name matches');
    assert(!('password' in createdUser), 'Password NOT in response (security)');
    assert(createdUser.createdAt !== undefined, 'Has createdAt timestamp');
    assert(createdUser.updatedAt !== undefined, 'Has updatedAt timestamp');
    
    testUserId = createdUser.id;
    console.log(`  📝 Created user with ID: ${testUserId}\n`);

    // =====================================================
    // TEST 2: FIND USER BY ID
    // =====================================================
    console.log('TEST 2: Find User by ID');
    const foundById = await userRepository.findUserById(testUserId);
    
    assert(foundById !== null, 'User found by ID');
    assert(foundById!.id === testUserId, 'ID matches');
    assert(foundById!.email === testEmail, 'Email matches');
    assert(foundById!.fullName === testFullName, 'Full name matches');
    assert(foundById!.password !== undefined, 'Password included (for auth)');
    assert(foundById!.password.startsWith('$2'), 'Password is bcrypt hash');
    console.log('');

    // =====================================================
    // TEST 3: FIND USER BY ID - NOT FOUND
    // =====================================================
    console.log('TEST 3: Find User by ID - Not Found');
    const notFoundById = await userRepository.findUserById('00000000-0000-0000-0000-000000000000');
    
    assert(notFoundById === null, 'Returns null when user not found');
    console.log('');

    // =====================================================
    // TEST 4: FIND USER BY EMAIL
    // =====================================================
    console.log('TEST 4: Find User by Email (with password)');
    const foundByEmail = await userRepository.findUserByEmail(testEmail);
    
    assert(foundByEmail !== null, 'User found by email');
    assert(foundByEmail!.id === testUserId, 'ID matches');
    assert(foundByEmail!.email === testEmail, 'Email matches');
    assert(foundByEmail!.password !== undefined, 'Password included');
    assert(foundByEmail!.password === foundById!.password, 'Same password hash as findById');
    console.log('');

    // =====================================================
    // TEST 5: FIND USER BY EMAIL - NOT FOUND
    // =====================================================
    console.log('TEST 5: Find User by Email - Not Found');
    const notFoundByEmail = await userRepository.findUserByEmail('nonexistent@example.com');
    
    assert(notFoundByEmail === null, 'Returns null when email not found');
    console.log('');

    // =====================================================
    // TEST 6: FIND USER WITHOUT PASSWORD BY EMAIL
    // =====================================================
    console.log('TEST 6: Find User Without Password by Email');
    const foundWithoutPassword = await userRepository.findUserWithoutPasswordByEmail(testEmail);
    
    assert(foundWithoutPassword !== null, 'User found');
    assert(foundWithoutPassword!.id === testUserId, 'ID matches');
    assert(foundWithoutPassword!.email === testEmail, 'Email matches');
    assert(!('password' in foundWithoutPassword!), 'Password NOT included (security)');
    console.log('');

    // =====================================================
    // TEST 7: UPDATE USER - FULL NAME
    // =====================================================
    console.log('TEST 7: Update User - Full Name');
    const newFullName = 'Updated Name';
    const updatedUser = await userRepository.updateUser(testUserId, { fullName: newFullName });
    
    assert(updatedUser !== null, 'Update successful');
    assert(updatedUser!.fullName === newFullName, 'Full name updated');
    assert(updatedUser!.email === testEmail, 'Email unchanged');
    console.log('');

    // =====================================================
    // TEST 8: UPDATE USER - EMAIL
    // =====================================================
    console.log('TEST 8: Update User - Email');
    const updatedEmail = await userRepository.updateUser(testUserId, { email: testEmail2 });
    
    assert(updatedEmail !== null, 'Update successful');
    assert(updatedEmail!.email === testEmail2, 'Email updated');
    assert(updatedEmail!.fullName === newFullName, 'Full name unchanged');
    console.log('');

    // =====================================================
    // TEST 9: UPDATE USER - NO CHANGES
    // =====================================================
    console.log('TEST 9: Update User - No Changes');
    const noChanges = await userRepository.updateUser(testUserId, {});
    
    assert(noChanges !== null, 'Returns user when no updates');
    assert(noChanges!.id === testUserId, 'Same user returned');
    console.log('');

    // =====================================================
    // TEST 10: UPDATE PASSWORD
    // =====================================================
    console.log('TEST 10: Update Password');
    const newPassword = 'NewPassword456!';
    const newHashedPassword = await PasswordUtils.hashPassword(newPassword);
    const passwordUpdated = await userRepository.updatePassword(testUserId, newHashedPassword);
    
    assert(passwordUpdated === true, 'Password update successful');
    
    // Verify password was actually updated
    const userAfterPasswordUpdate = await userRepository.findUserById(testUserId);
    assert(userAfterPasswordUpdate!.password !== hashedPassword, 'Password hash changed');
    assert(userAfterPasswordUpdate!.password === newHashedPassword, 'New password hash matches');
    
    // Verify old password doesn't work
    const oldPasswordWorks = await PasswordUtils.verifyPassword(testPassword, userAfterPasswordUpdate!.password);
    assert(oldPasswordWorks === false, 'Old password no longer works');
    
    // Verify new password works
    const newPasswordWorks = await PasswordUtils.verifyPassword(newPassword, userAfterPasswordUpdate!.password);
    assert(newPasswordWorks === true, 'New password works');
    console.log('');

    // =====================================================
    // TEST 11: DELETE USER
    // =====================================================
    console.log('TEST 11: Delete User');
    const deleted = await userRepository.deleteUser(testUserId);
    
    assert(deleted === true, 'Delete successful');
    
    // Verify user no longer exists
    const deletedUser = await userRepository.findUserById(testUserId);
    assert(deletedUser === null, 'User no longer in database');
    console.log('');

    // =====================================================
    // TEST 12: DELETE NON-EXISTENT USER
    // =====================================================
    console.log('TEST 12: Delete Non-existent User');
    const deletedNonExistent = await userRepository.deleteUser('00000000-0000-0000-0000-000000000000');
    
    assert(deletedNonExistent === false, 'Returns false when user not found');
    console.log('');

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
      console.log('🎉 ALL TESTS PASSED! UserRepository is working perfectly!\n');
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
    // Cleanup: Close database connection
    await pool.end();
  }
}

// Run tests
runTests();