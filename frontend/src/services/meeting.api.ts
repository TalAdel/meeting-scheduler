import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import type { Meeting, CreateMeetingData, UpdateMeetingData, AttendingStatus } from '../types/meeting.types';

/**
 * Meeting API Service
 * Handles all meeting-related API calls
 */

/**
 * Get all meetings for the authenticated user
 */
export const getUserMeetings = async (): Promise<Meeting[]> => {
  const response = await axios.get<{ meetings: Meeting[] }>(API_ENDPOINTS.MEETINGS.BASE);
  return response.data.meetings;
};

/**
 * Get a specific meeting by ID
 */
export const getMeetingById = async (id: string): Promise<Meeting> => {
  const response = await axios.get<{ meeting: Meeting }>(`${API_ENDPOINTS.MEETINGS.BASE}/${id}`);
  return response.data.meeting;
};

/**
 * Create a new meeting with participants
 */
export const createMeeting = async (data: CreateMeetingData): Promise<any> => {
  const response = await axios.post(API_ENDPOINTS.MEETINGS.BASE, data);
  return response.data;
};

/**
 * Update a meeting
 */
export const updateMeeting = async (id: string, data: UpdateMeetingData): Promise<Meeting> => {
  const response = await axios.put<{ meeting: Meeting }>(`${API_ENDPOINTS.MEETINGS.BASE}/${id}`, data);
  return response.data.meeting;
};

/**
 * Delete a meeting
 */
export const deleteMeeting = async (id: string): Promise<void> => {
  await axios.delete(`${API_ENDPOINTS.MEETINGS.BASE}/${id}`);
};

/**
 * Update user's attendance status for a meeting
 */
export const updateAttendanceStatus = async (meetingId: string, status: AttendingStatus): Promise<any> => {
  const response = await axios.patch(`${API_ENDPOINTS.MEETINGS.BASE}/${meetingId}/attend-status`, { status });
  return response.data;
};

/**
 * Get participants for a specific meeting
 */
export const getMeetingParticipants = async (meetingId: string): Promise<any[]> => {
  const response = await axios.get<{ participants: any[] }>(`${API_ENDPOINTS.MEETINGS.BASE}/${meetingId}/participants`);
  return response.data.participants;
};



