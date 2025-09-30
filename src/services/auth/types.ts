/**
 * Authentication Types
 */

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  userType: 'client' | 'trainer';
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at?: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordUpdateRequest {
  password: string;
  confirmPassword: string;
}
