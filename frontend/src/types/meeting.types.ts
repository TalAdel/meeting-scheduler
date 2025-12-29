/**
 * Meeting Types for Frontend
 * Mirrors backend meeting structure
 */

export const AttendingStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
  ATTENDED: 'attended'
} as const;

export type AttendingStatus = typeof AttendingStatus[keyof typeof AttendingStatus];

export interface Meeting {
  id: string;
  title: string;
  startTime: string; // ISO string from backend
  endTime: string;
  location: string;
  notes?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingWithStatus extends Meeting {
  userStatus?: AttendingStatus;
  isOwner?: boolean;
}

export interface CreateMeetingData {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
  emails: string[];
  status?: AttendingStatus;
}

export interface UpdateMeetingData {
  title?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
}

