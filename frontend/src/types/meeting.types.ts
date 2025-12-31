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
  location?: string | null;
  locationCountry?: string | null;  // ISO 3166-1 alpha-2 code (e.g., IL, US, FR)
  latitude?: number | null;         // Cached latitude
  longitude?: number | null;        // Cached longitude
  notes?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  userStatus?: AttendingStatus | null; // User's attendance status (null if owner)
}

export interface MeetingWithStatus extends Meeting {
  userStatus?: AttendingStatus;
  isOwner?: boolean;
}

export interface CreateMeetingData {
  title: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  locationCountry?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
  emails: string[];
  status?: AttendingStatus;
}

export interface UpdateMeetingData {
  title?: string;
  startTime?: string;
  endTime?: string;
  location?: string | null;
  locationCountry?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string;
}

