import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import type { User } from '../types/auth.types';

/**
 * User API Service
 * Handles user profile operations
 */

export interface UpdateProfileData {
  fullName?: string;
  email?: string;
}

/**
 * Get current user's profile
 */
export const getUserProfile = async (): Promise<User> => {
  const response = await axios.get<{ user: User }>(API_ENDPOINTS.USERS.BASE + '/profile');
  return response.data.user;
};

/**
 * Update current user's profile
 * Can update fullName, email, or both
 */
export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
  const response = await axios.put<{ user: User }>(API_ENDPOINTS.USERS.BASE + '/profile', data);
  return response.data.user;
};

/**
 * Delete current user's account
 */
export const deleteAccount = async (): Promise<void> => {
  await axios.delete(API_ENDPOINTS.USERS.BASE + '/account');
};


