/**
 * Frontend Types
 * 
 * WHY? Centralized type definitions for TypeScript type safety
 * 
 * These types match the backend API responses
 * This ensures type safety across frontend-backend communication
 */

export type AttendingStatus = 'pending' | 'confirmed' | 'declined' | 'attended'

export interface User {
  id: string
  fullName: string
  email: string
  avatar?: string
  title?: string
  bio?: string
}

export interface Participant {
  email: string
  status: AttendingStatus
  name?: string
}

export interface Meeting {
  id: string
  title: string
  start_time: string // ISO string
  end_time: string // ISO string
  location: string
  notes?: string
  owner_id: string
  participants: Participant[]
  created_at: string
  updated_at: string
}

