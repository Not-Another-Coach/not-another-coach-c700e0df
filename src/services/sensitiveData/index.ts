/**
 * Sensitive Data Service
 * 
 * Handles operations for sensitive user data stored in separate tables:
 * - contact_info (phone numbers)
 * - payment_methods (card details)
 * - billing_addresses (billing info)
 */

import { supabase } from '@/integrations/supabase/client';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import type { ServiceResponse } from '../types';

interface ContactInfo {
  phone?: string;
}

interface PaymentMethod {
  card_last_four?: string;
  card_type?: string;
  card_expiry_month?: number;
  card_expiry_year?: number;
}

interface BillingAddress {
  billing_address?: any;
}

class SensitiveDataServiceClass {
  /**
   * Get user's contact information
   */
  static async getContactInfo(userId?: string): Promise<ServiceResponse<ContactInfo | null>> {
    try {
      const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!effectiveUserId) {
        return ServiceResponseHelper.error(
          ServiceError.unauthorized('User must be authenticated')
        );
      }

      const { data, error } = await supabase
        .from('contact_info')
        .select('phone')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (error) throw error;
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Update or create user's contact information
   */
  static async upsertContactInfo(
    data: ContactInfo,
    userId?: string
  ): Promise<ServiceResponse<ContactInfo>> {
    try {
      const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!effectiveUserId) {
        return ServiceResponseHelper.error(
          ServiceError.unauthorized('User must be authenticated')
        );
      }

      const { data: result, error } = await supabase
        .from('contact_info')
        .upsert({
          user_id: effectiveUserId,
          ...data
        }, {
          onConflict: 'user_id'
        })
        .select('phone')
        .single();

      if (error) throw error;
      return ServiceResponseHelper.success(result);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get user's payment method
   */
  static async getPaymentMethod(userId?: string): Promise<ServiceResponse<PaymentMethod | null>> {
    try {
      const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!effectiveUserId) {
        return ServiceResponseHelper.error(
          ServiceError.unauthorized('User must be authenticated')
        );
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .select('card_last_four, card_type, card_expiry_month, card_expiry_year')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (error) throw error;
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Update or create user's payment method
   */
  static async upsertPaymentMethod(
    data: PaymentMethod,
    userId?: string
  ): Promise<ServiceResponse<PaymentMethod>> {
    try {
      const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!effectiveUserId) {
        return ServiceResponseHelper.error(
          ServiceError.unauthorized('User must be authenticated')
        );
      }

      const { data: result, error } = await supabase
        .from('payment_methods')
        .upsert({
          user_id: effectiveUserId,
          ...data
        }, {
          onConflict: 'user_id'
        })
        .select('card_last_four, card_type, card_expiry_month, card_expiry_year')
        .single();

      if (error) throw error;
      return ServiceResponseHelper.success(result);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get user's billing address
   */
  static async getBillingAddress(userId?: string): Promise<ServiceResponse<BillingAddress | null>> {
    try {
      const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!effectiveUserId) {
        return ServiceResponseHelper.error(
          ServiceError.unauthorized('User must be authenticated')
        );
      }

      const { data, error } = await supabase
        .from('billing_addresses')
        .select('billing_address')
        .eq('user_id', effectiveUserId)
        .maybeSingle();

      if (error) throw error;
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Update or create user's billing address
   */
  static async upsertBillingAddress(
    data: BillingAddress,
    userId?: string
  ): Promise<ServiceResponse<BillingAddress>> {
    try {
      const effectiveUserId = userId || (await supabase.auth.getUser()).data.user?.id;
      
      if (!effectiveUserId) {
        return ServiceResponseHelper.error(
          ServiceError.unauthorized('User must be authenticated')
        );
      }

      const { data: result, error } = await supabase
        .from('billing_addresses')
        .upsert({
          user_id: effectiveUserId,
          ...data
        }, {
          onConflict: 'user_id'
        })
        .select('billing_address')
        .single();

      if (error) throw error;
      return ServiceResponseHelper.success(result);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get all sensitive data for a user
   */
  static async getAllSensitiveData(userId?: string): Promise<ServiceResponse<{
    contact: ContactInfo | null;
    payment: PaymentMethod | null;
    billing: BillingAddress | null;
  }>> {
    try {
      const [contactResult, paymentResult, billingResult] = await Promise.all([
        this.getContactInfo(userId),
        this.getPaymentMethod(userId),
        this.getBillingAddress(userId)
      ]);

      if (!contactResult.success) return contactResult as any;
      if (!paymentResult.success) return paymentResult as any;
      if (!billingResult.success) return billingResult as any;

      return ServiceResponseHelper.success({
        contact: contactResult.data,
        payment: paymentResult.data,
        billing: billingResult.data
      });
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }
}

export const SensitiveDataService = SensitiveDataServiceClass;
export { SensitiveDataServiceClass };
