import dotenv from 'dotenv';
dotenv.config();

import pool from '../config/database';
import MeetingRepository from '../repositories/meeting.repository';
import UserRepository from '../repositories/user.repository';
/**
 * MEETING REPOSITORY TEST SCRIPT
 * 
 * Tests all MeetingRepository methods including:
 * - CRUD operations
 * - Conflict detection
 * - Date range queries
 * - Search functionality
 * 
 * Usage: npx ts-node src/test/test-meeting-repository.ts
 */

const meetingRepository = new MeetingRepository(pool);
const userRepository = new UserRepository(pool);

// Test data
const testEmail = `testowner${Date.now()}@example.com`;
let testUserId: string;
let testMeetingId: string;

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
  console.log('🧪 TESTING MEETING REPOSITORY');
  console.log('=================================================\n');

  try {
    // =====================================================
    // SETUP: Create test user
    // =====================================================
    console.log('SETUP: Creating test user...');
    const hashedPassword = 'hashed_password_here'; // Placeholder
    const testUser = await userRepository.createUser(
      testEmail,
      'Test Owner',
      hashedPassword
    );
    testUserId = testUser.id;
    console.log(`  ✅ Created test user: ${testUserId}\n`);

    // =====================================================
    // TEST 1: CREATE MEETING
    // =====================================================
    console.log('TEST 1: Create Meeting');


    const startTime = new Date('2028-05-17T09:00:00+03:00').toISOString();
    const endTime = new Date('2028-05-17T09:15:00+03:00').toISOString();   
    const newMeetingData = {
      title: 'Team Standup',
      startTime: startTime,
      endTime: endTime,
      location: 'Conference Room A',
      notes: 'Daily standup meeting',
      ownerId: testUserId,
    };

    const createdMeeting = await meetingRepository.createMeeting(newMeetingData.title, new Date(newMeetingData.startTime), new Date(newMeetingData.endTime), newMeetingData.location, newMeetingData.notes, newMeetingData.ownerId);
    
    assert(createdMeeting.id !== undefined, 'Meeting has ID');
    assert(createdMeeting.title === newMeetingData.title, 'Title matches');
    assert(createdMeeting.location === newMeetingData.location, 'Location matches');
    assert(createdMeeting.ownerId === testUserId, 'Owner ID matches');
    assert(createdMeeting.startTime !== undefined, 'Has start time');
    assert(createdMeeting.endTime !== undefined, 'Has end time');
    assert(createdMeeting.createdAt !== undefined, 'Has createdAt');
    assert(createdMeeting.updatedAt !== undefined, 'Has updatedAt');
    
    testMeetingId = createdMeeting.id;
    console.log(`  📝 Created meeting with ID: ${testMeetingId}\n`);

    // =====================================================
    // TEST 2: FIND MEETING BY ID
    // =====================================================
    console.log('TEST 2: Find Meeting By ID');
    
    const foundMeeting = await meetingRepository.findMeetingById(testMeetingId);
    
    assert(foundMeeting !== null, 'Meeting found');
    assert(foundMeeting!.id === testMeetingId, 'ID matches');
    assert(foundMeeting!.title === 'Team Standup', 'Title matches');
    console.log('');

    // =====================================================
    // TEST 3: FIND MEETING BY ID - NOT FOUND
    // =====================================================
    console.log('TEST 3: Find Meeting By ID - Not Found');
    
    const notFound = await meetingRepository.findMeetingById('00000000-0000-0000-0000-000000000000');
    
    assert(notFound === null, 'Returns null for non-existent meeting');
    console.log('');

    // =====================================================
    // TEST 4: FIND MEETINGS BY OWNER
    // =====================================================
    console.log('TEST 4: Find Meetings By Owner');
    
    const ownerMeetings = await meetingRepository.findMeetingsByOwner(testUserId);
    
    assert(ownerMeetings!.length === 1, 'Found 1 meeting');
    assert(ownerMeetings![0].id === testMeetingId, 'Meeting ID matches');
    console.log('');

    // =====================================================
    // TEST 5: CREATE SECOND MEETING
    // =====================================================
    console.log('TEST 5: Create Second Meeting');
    
    const secondMeeting = await meetingRepository.createMeeting('Project Review', new Date('2028-05-17T14:00:00+03:00'), new Date('2028-05-17T15:30:00+03:00'), 'Conference Room B', 'Q2 Project Review', testUserId);
 
    
    assert(secondMeeting.id !== testMeetingId, 'Different ID from first meeting');
    console.log(`  📝 Created second meeting: ${secondMeeting.id}\n`);

    // =====================================================
    // TEST 6: FIND MEETINGS BY DATE
    // =====================================================
    console.log('TEST 6: Find Meetings By Date');
    
    const dateMeetings = await meetingRepository.findMeetingsByDate(
      new Date('2028-05-17')
    );
    
    assert(dateMeetings.length === 2, 'Found 2 meetings on May 17');
    assert(dateMeetings[0].startTime < dateMeetings[1].startTime, 'Meetings ordered by time');
    console.log('');

    // =====================================================
    // TEST 7: FIND MEETINGS IN RANGE
    // =====================================================
    console.log('TEST 7: Find Meetings In Range');
    
    const rangeMeetings = await meetingRepository.findMeetingsInRange(
      new Date('2028-05-17T08:00:00+03:00'),
      new Date('2028-05-17T16:00:00+03:00')
    );
    
    assert(rangeMeetings!.length === 2, 'Found 2 meetings in range');
    console.log('');

    // =====================================================
    // TEST 8: CONFLICT DETECTION - NO CONFLICT
    // =====================================================
    console.log('TEST 8: Conflict Detection - No Conflict');
    
    const hasNoConflict = await meetingRepository.hasConflict(
      testUserId,
      new Date('2028-05-17T10:00:00+03:00'),  // 10:00-11:00 (free slot)
      new Date('2028-05-17T11:00:00+03:00')
    );
    
    assert(!hasNoConflict, 'No conflict detected for free slot');
    console.log('');

    // =====================================================
    // TEST 9: CONFLICT DETECTION - HAS CONFLICT
    // =====================================================
    console.log('TEST 9: Conflict Detection - Has Conflict');
    
    const hasConflict = await meetingRepository.hasConflict(
      testUserId,
      new Date('2028-05-17T09:00:00+03:00'),  // Overlaps with 09:00-09:15 meeting
      new Date('2028-05-17T09:30:00+03:00')
    );
    
    assert(hasConflict, 'Conflict detected for overlapping time');
    console.log('');

    // =====================================================
    // TEST 10: CONFLICT DETECTION - PARTIAL OVERLAP
    // =====================================================
    console.log('TEST 10: Conflict Detection - Partial Overlap');
    
    const hasPartialConflict = await meetingRepository.hasConflict(
      testUserId,
      new Date('2028-05-17T14:30:00+03:00'),  // Overlaps with 14:00-15:30 meeting
      new Date('2028-05-17T16:00:00+03:00')
    );
    
    assert(hasPartialConflict, 'Conflict detected for partial overlap');
    console.log('');

    // =====================================================
    // TEST 11: UPDATE MEETING
    // =====================================================
    console.log('TEST 11: Update Meeting');
    
    const updatedMeeting = await meetingRepository.updateMeeting(testMeetingId, {
      title: 'Daily Standup (Updated)',
      location: 'Virtual - Zoom',
    });
    
    assert(updatedMeeting !== null, 'Meeting updated');
    assert(updatedMeeting!.title === 'Daily Standup (Updated)', 'Title updated');
    assert(updatedMeeting!.location === 'Virtual - Zoom', 'Location updated');
    assert(updatedMeeting!.startTime.getTime() === createdMeeting.startTime.getTime(), 
           'Start time unchanged (not in update)');
    console.log('');

    // =====================================================
    // TEST 12: UPDATE MEETING - NOT FOUND
    // =====================================================
    console.log('TEST 12: Update Meeting - Not Found');
    
    const notUpdated = await meetingRepository.updateMeeting(
      '00000000-0000-0000-0000-000000000000',
      { title: 'Test' }
    );
    
    assert(notUpdated === null, 'Returns null for non-existent meeting');
    console.log('');

    // =====================================================
    // TEST 13: SEARCH MEETINGS BY TITLE
    // =====================================================
    // console.log('TEST 13: Search Meetings By Title');
    
    // const searchResults = await meetingRepository.searchMeetingsByTitle('standup');
    
    // assert(searchResults.length >= 1, 'Found meetings with "standup" in title');
    // assert(searchResults[0].title.toLowerCase().includes('standup'), 
    //        'Search is case-insensitive');
    // console.log('');

    // =====================================================
    // TEST 14: GET UPCOMING MEETINGS
    // =====================================================
    // console.log('TEST 14: Get Upcoming Meetings');
    
    // // Create a future meeting
    // await meetingRepository.createMeeting({
    //   title: 'Future Meeting',
    //   startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    //   endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000), // +1 hour
    //   location: 'TBD',
    //   ownerId: testUserId,
    // });
    
    // const upcomingMeetings = await meetingRepository.getUpcomingMeetings(testUserId, 5);
    
    // assert(upcomingMeetings.length >= 1, 'Found upcoming meetings');
    // assert(upcomingMeetings[0].startTime > new Date(), 'Meeting is in the future');
    // console.log('');

    // =====================================================
    // TEST 15: DELETE MEETING
    // =====================================================
    console.log('TEST 15: Delete Meeting');
    
    const deleted = await meetingRepository.deleteMeeting(testMeetingId);
    
    assert(deleted === true, 'Meeting deleted');
    
    const afterDelete = await meetingRepository.findMeetingById(testMeetingId);
    assert(afterDelete === null, 'Meeting no longer exists');
    console.log('');

    // =====================================================
    // TEST 16: DELETE MEETING - NOT FOUND
    // =====================================================
    console.log('TEST 16: Delete Meeting - Not Found');
    
    const notDeleted = await meetingRepository.deleteMeeting('00000000-0000-0000-0000-000000000000');
    
    assert(notDeleted === false, 'Returns false for non-existent meeting');
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
      console.log('🎉 ALL TESTS PASSED! MeetingRepository is working correctly!\n');
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
  } finally {
    // Cleanup test data (runs whether tests pass or fail)
    console.log('\nCleaning up test data...');
    try {
      if (testUserId) {
        const allMeetings = await meetingRepository.findMeetingsByOwner(testUserId);
        if (allMeetings) {
          for (const meeting of allMeetings) {
            await meetingRepository.deleteMeeting(meeting.id);
          }
        }
        await userRepository.deleteUser(testUserId);
        console.log('  ✅ Cleanup complete\n');
      }
    } catch (cleanupError) {
      console.error('  ⚠️  Cleanup failed:', cleanupError);
    }
    
    // Close database connection
    await pool.end();
    
    // Exit with error code if tests failed
    if (testsFailed > 0) {
      process.exit(1);
    }
  }
}

// Run tests
runTests();