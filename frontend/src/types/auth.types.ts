/**
 * Shared Authentication Types
 * 
 * WHY separate file?
 * - Avoids circular dependencies
 * - Single source of truth for types
 * - Can be imported anywhere without side effects
 */

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  title?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpData {
  email: string;
  fullName: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface SignUpResponse {
  user: User;
}



