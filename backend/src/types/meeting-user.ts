import { AttendingStatus } from "./enums";

export interface MeetingUser {
  id: string;
  meetingId: string;
  userId: string;
  status: AttendingStatus;
  respondedAt: Date | null;
  createdAt: Date;
}