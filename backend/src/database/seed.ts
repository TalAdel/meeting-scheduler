import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcrypt';
import pool from '../config/database';

/**
 * Seed Script - Creates Demo Data
 * 
 * WHY? Provides realistic test data for reviewers/interviewers to explore the application
 * without manually creating accounts and meetings.
 * 
 * What it creates:
 * 1. Three demo users (Tal, Liran, Yeal)
 * 2. Multiple meetings across different timelines (past, today, upcoming)
 * 3. Participants with various RSVP statuses (pending, confirmed, declined, attended)
 * 4. Meetings with different locations (including international addresses)
 * 
 * This demonstrates:
 * - Multi-user interactions
 * - RSVP workflow
 * - Meeting history
 * - Google Maps integration with various locations
 */

interface User {
  id?: string;
  email: string;
  fullName: string;
  password: string;
}

interface Meeting {
  id?: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  locationCountry?: string;
  latitude?: number;
  longitude?: number;
  notes: string;
  ownerId: string;
}

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seeding...\n');

    // ==========================================
    // STEP 1: Create Demo Users
    // ==========================================
    console.log('👥 Creating demo users...');
    
    const users: User[] = [
      {
        email: 'talf16@gmail.com',
        fullName: 'Tal Adler',
        password: 'Tal123456!'
      },
      {
        email: 'liran@gmail.com',
        fullName: 'Liran Cohen',
        password: 'liran123456!'
      },
      {
        email: 'yeal@gmail.com',
        fullName: 'Yeal Sharon',
        password: 'yeal123456!'
      }
    ];

    const createdUsers: User[] = [];
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      const result = await client.query(
        `INSERT INTO users (email, full_name, password) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (email) DO UPDATE SET full_name = $2
         RETURNING id, email, full_name`,
        [user.email, user.fullName, hashedPassword]
      );
      
      createdUsers.push({
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
        password: user.password
      });
      
      console.log(`  ✓ ${user.fullName} (${user.email})`);
    }

    const [tal, liran, yeal] = createdUsers;

    console.log('\n📅 Creating demo meetings...\n');

    // ==========================================
    // STEP 2: Create Meetings with Various States
    // ==========================================

    const now = new Date();
    const meetings: Meeting[] = [];

    // Meeting 1: Past Meeting - Already Attended
    meetings.push({
      title: 'Q4 2024 Planning Session',
      startTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endTime: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: 'Google Campus, Tel Aviv',
      locationCountry: 'IL',
      latitude: 32.0668,
      longitude: 34.7649,
      notes: 'Quarterly planning and retrospective. Discussed goals for next quarter.',
      ownerId: tal.id!
    });

    // Meeting 2: Yesterday - Mixed Attendance
    meetings.push({
      title: 'Team Sync - Weekly Standup',
      startTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      endTime: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), // 1 hour later
      location: 'WeWork Sarona, Tel Aviv',
      locationCountry: 'IL',
      latitude: 32.0719,
      longitude: 34.7866,
      notes: 'Weekly team standup to discuss progress and blockers.',
      ownerId: liran.id!
    });

    // Meeting 3: Today - Happening Soon
    meetings.push({
      title: 'Product Demo & Feedback Session',
      startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // In 2 hours
      endTime: new Date(now.getTime() + 3 * 60 * 60 * 1000), // In 3 hours
      location: 'Microsoft Israel R&D Center, Herzliya',
      locationCountry: 'IL',
      latitude: 32.1656,
      longitude: 34.8433,
      notes: 'Demonstrating the new meeting scheduler features. Bring questions!',
      ownerId: tal.id!
    });

    // Meeting 4: Tomorrow - Some Confirmed
    meetings.push({
      title: 'Client Meeting - Project Kickoff',
      startTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
      endTime: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: 'Times Square, New York, NY',
      locationCountry: 'US',
      latitude: 40.7580,
      longitude: -73.9855,
      notes: 'Initial kickoff meeting with new client. Review requirements and timeline.',
      ownerId: yeal.id!
    });

    // Meeting 5: Next Week - Mostly Pending
    meetings.push({
      title: 'Architecture Review',
      startTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      endTime: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000 + 1.5 * 60 * 60 * 1000), // 1.5 hours later
      location: 'Campus London, Google UK',
      locationCountry: 'GB',
      latitude: 51.5339,
      longitude: -0.1247,
      notes: 'Review system architecture and discuss scalability improvements.',
      ownerId: liran.id!
    });

    // Meeting 6: Next Week - Conference
    meetings.push({
      title: 'Tech Conference 2025 - Keynote',
      startTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
      endTime: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
      location: 'Tour Eiffel, Paris, France',
      locationCountry: 'FR',
      latitude: 48.8584,
      longitude: 2.2945,
      notes: 'Annual tech conference. Networking and learning about latest trends.',
      ownerId: tal.id!
    });

    // Meeting 7: Far Future - Some Declined
    meetings.push({
      title: 'Q1 2025 Budget Planning',
      startTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      endTime: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
      location: 'Tokyo Tower, Tokyo, Japan',
      locationCountry: 'JP',
      latitude: 35.6586,
      longitude: 139.7454,
      notes: 'Planning budget allocation for Q1. All department heads required.',
      ownerId: yeal.id!
    });

    // Insert all meetings
    const createdMeetings: Meeting[] = [];
    
    for (const meeting of meetings) {
      const result = await client.query(
        `INSERT INTO meetings (
          title, start_time, end_time, location, location_country, 
          latitude, longitude, notes, owner_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, title`,
        [
          meeting.title,
          meeting.startTime,
          meeting.endTime,
          meeting.location,
          meeting.locationCountry,
          meeting.latitude,
          meeting.longitude,
          meeting.notes,
          meeting.ownerId
        ]
      );
      
      createdMeetings.push({
        ...meeting,
        id: result.rows[0].id
      });
      
      console.log(`  ✓ ${result.rows[0].title}`);
    }

    console.log('\n👥 Adding participants and RSVP statuses...\n');

    // ==========================================
    // STEP 3: Add Participants with Various RSVP States
    // ==========================================

    // Meeting 1: Past - All Attended
    await addParticipant(client, createdMeetings[0].id!, liran.id!, 'attended');
    await addParticipant(client, createdMeetings[0].id!, yeal.id!, 'attended');
    console.log('  ✓ Q4 Planning: All attended');

    // Meeting 2: Yesterday - Mixed
    await addParticipant(client, createdMeetings[1].id!, tal.id!, 'attended');
    await addParticipant(client, createdMeetings[1].id!, yeal.id!, 'declined');
    console.log('  ✓ Team Sync: Mixed attendance');

    // Meeting 3: Today - Some Confirmed, Some Pending
    await addParticipant(client, createdMeetings[2].id!, liran.id!, 'confirmed');
    await addParticipant(client, createdMeetings[2].id!, yeal.id!, 'pending');
    console.log('  ✓ Product Demo: Some confirmed');

    // Meeting 4: Tomorrow - Mostly Confirmed
    await addParticipant(client, createdMeetings[3].id!, tal.id!, 'confirmed');
    await addParticipant(client, createdMeetings[3].id!, liran.id!, 'confirmed');
    console.log('  ✓ Client Meeting: Mostly confirmed');

    // Meeting 5: Next Week - All Pending
    await addParticipant(client, createdMeetings[4].id!, tal.id!, 'pending');
    await addParticipant(client, createdMeetings[4].id!, yeal.id!, 'pending');
    console.log('  ✓ Architecture Review: All pending');

    // Meeting 6: Conference - Confirmed
    await addParticipant(client, createdMeetings[5].id!, liran.id!, 'confirmed');
    await addParticipant(client, createdMeetings[5].id!, yeal.id!, 'confirmed');
    console.log('  ✓ Tech Conference: All confirmed');

    // Meeting 7: Future - Some Declined
    await addParticipant(client, createdMeetings[6].id!, tal.id!, 'pending');
    await addParticipant(client, createdMeetings[6].id!, liran.id!, 'declined');
    console.log('  ✓ Budget Planning: Mixed responses');

    console.log('\n✅ Seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${createdUsers.length} users created`);
    console.log(`   - ${createdMeetings.length} meetings created`);
    console.log('   - Multiple RSVP statuses across timelines\n');
    
    console.log('🔑 Demo Credentials:');
    createdUsers.forEach(user => {
      console.log(`   - ${user.email} / ${users.find(u => u.email === user.email)?.password}`);
    });
    console.log('');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

async function addParticipant(
  client: any, 
  meetingId: string, 
  userId: string, 
  status: 'pending' | 'confirmed' | 'declined' | 'attended'
) {
  await client.query(
    `INSERT INTO meeting_users (meeting_id, user_id, status, responded_at)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (meeting_id, user_id) DO UPDATE SET status = $3`,
    [
      meetingId, 
      userId, 
      status,
      status !== 'pending' ? new Date() : null
    ]
  );
}

// Run the seed
seed().catch(console.error);
