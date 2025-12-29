import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import type { SignUpData, SignInData, LoginResponse, SignUpResponse } from '../types/auth.types';

/**
 * Auth API Service
 * Handles all authentication-related API calls to the backend
 */

/**
 * Signs up a new user
 */
export const signUp = async (data: SignUpData): Promise<SignUpResponse> => {
  const response = await axios.post<SignUpResponse>(API_ENDPOINTS.AUTH.SIGNUP, data);
  return response.data;
};

/**
 * Logs in an existing user
 */
export const signIn = async (data: SignInData): Promise<LoginResponse> => {
  const response = await axios.post<LoginResponse>(API_ENDPOINTS.AUTH.SIGNIN, data);
  return response.data;
};

/**
 * Change user password
 */
export const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
  await axios.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    currentPassword,
    newPassword
  });
};
