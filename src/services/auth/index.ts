/**
 * Authentication Service
 * 
 * Handles authentication operations including sign in, sign up, and session management.
 */

import { supabase } from '@/integrations/supabase/client';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import type { ServiceResponse } from '../types';
import type { 
  SignUpCredentials, 
  SignInCredentials, 
  AuthSession,
  PasswordResetRequest,
  PasswordUpdateRequest 
} from './types';
import { User, Session } from '@supabase/supabase-js';

export const AuthService = {
  /**
   * Sign up a new user with email and password
   */
  async signUp(
    credentials: SignUpCredentials,
    redirectUrl?: string
  ): Promise<ServiceResponse<{ user: User | null; session: Session | null }>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            firstName: credentials.firstName,
            lastName: credentials.lastName,
            userType: credentials.userType,
          }
        }
      });

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Sign up failed', error)
        );
      }

      return ServiceResponseHelper.success({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Sign in an existing user
   */
  async signIn(
    credentials: SignInCredentials
  ): Promise<ServiceResponse<{ user: User | null; session: Session | null }>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Sign in failed', error)
        );
      }

      return ServiceResponseHelper.success({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Sign out the current user
   */
  async signOut(): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Sign out failed', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Get the current session
   */
  async getSession(): Promise<ServiceResponse<Session | null>> {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to get session', error)
        );
      }

      return ServiceResponseHelper.success(data.session);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Resend confirmation email
   */
  async resendConfirmation(
    email: string,
    redirectUrl?: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: redirectUrl
        }
      });

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to resend confirmation', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(
    request: PasswordResetRequest,
    redirectUrl?: string
  ): Promise<ServiceResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        request.email,
        {
          redirectTo: redirectUrl
        }
      );

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Password reset request failed', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Update user password
   */
  async updatePassword(
    request: PasswordUpdateRequest
  ): Promise<ServiceResponse<void>> {
    try {
      if (request.password !== request.confirmPassword) {
        return ServiceResponseHelper.error(
          ServiceError.validation('Passwords do not match')
        );
      }

      const { error } = await supabase.auth.updateUser({
        password: request.password
      });

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Password update failed', error)
        );
      }

      return ServiceResponseHelper.success(undefined);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<ServiceResponse<User | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) {
        return ServiceResponseHelper.error(
          ServiceError.database('Failed to get current user', error)
        );
      }

      return ServiceResponseHelper.success(user);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  },

  /**
   * Subscribe to auth state changes
   * Returns an unsubscribe function
   */
  onAuthStateChange(
    callback: (event: string, session: Session | null) => void
  ): () => void {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        callback(event, session);
      }
    );

    return () => subscription.unsubscribe();
  },
};
