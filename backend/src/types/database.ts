import { AttendingStatus } from './enums';
import { Meeting } from './meeting';

export interface UserRow {
  id: string;
  email: string;
  full_name: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserWithoutPasswordRow extends Omit<UserRow, 'password'> {
  id: string;
  email: string;
  full_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface MeetingRow {
  id: string;
  title: string;
  start_time: Date;
  end_time: Date;
  location: string;
  notes: string | null;
  owner_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface MeetingUserRow {
  id: string;
  meeting_id: string;
  user_id: string;
  status: AttendingStatus;
  responded_at: Date | null;
  created_at: Date;
}

// DTOs (Data Transfer Objects) - what we send to frontend
export interface MeetingWithParticipants extends MeetingRow {
  owner: Pick<UserRow, 'id' | 'full_name' | 'email'>;
  participants: Array<{
    user: Pick<UserRow, 'id' | 'full_name' | 'email'>;
    status: AttendingStatus;
    responded_at: Date | null;
  }>;
}

export function mapRowToMeeting(row: MeetingRow): Meeting {
  return {
    id: row.id,
    title: row.title,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    notes: row.notes,
    ownerId: row.owner_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
