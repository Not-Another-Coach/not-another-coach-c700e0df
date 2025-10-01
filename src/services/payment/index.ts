/**
 * Payment Service
 * 
 * Handles payment operations, transactions, and financial tracking.
 */

import { supabase } from '@/integrations/supabase/client';
import { BaseService } from '../base/BaseService';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import type { ServiceResponse } from '../types';
import type {
  PaymentTransaction,
  TrainerPackage,
  PaymentStatement,
  CreatePaymentRequest,
  RefundRequest,
  PaymentMethodData
} from './types';

class PaymentServiceClass extends BaseService {
  /**
   * Get payment packages for trainer
   */
  static async getTrainerPackages(trainerId?: string): Promise<ServiceResponse<any[]>> {
    const effectiveTrainerId = trainerId || (await this.getCurrentUserId()).data;
    
    if (!effectiveTrainerId) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated')
      );
    }

    try {
      const { data, error } = await supabase
        .from('payment_packages')
        .select('*')
        .eq('trainer_id', effectiveTrainerId)
        .eq('is_active', true)
        .order('price_value', { ascending: true });
      
      if (error) throw error;
      return ServiceResponseHelper.success(data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get payment package by ID
   */
  static async getPackageById(packageId: string): Promise<ServiceResponse<any>> {
    if (!packageId) {
      return ServiceResponseHelper.error(
        ServiceError.validation('Package ID is required')
      );
    }

    return this.executeQuery(async () => {
      return await this.db
        .from('payment_packages')
        .select('*')
        .eq('id', packageId)
        .single();
    });
  }

  /**
   * Create payment package
   */
  static async createPackage(
    packageData: Record<string, any>
  ): Promise<ServiceResponse<any>> {
    const userIdResponse = await this.getCurrentUserId();
    if (!userIdResponse.success || !userIdResponse.data) {
      return ServiceResponseHelper.error(userIdResponse.error!);
    }

    try {
      const { data, error } = await this.db
        .from('payment_packages')
        .insert([{
          ...packageData,
          customer_id: userIdResponse.data
        }] as any)
        .select()
        .single();
      
      if (error) throw error;
      return ServiceResponseHelper.success(data);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Update payment package
   */
  static async updatePackage(
    packageId: string,
    updates: Record<string, any>
  ): Promise<ServiceResponse<any>> {
    if (!packageId) {
      return ServiceResponseHelper.error(
        ServiceError.validation('Package ID is required')
      );
    }

    return this.executeMutation(async () => {
      return await this.db
        .from('payment_packages')
        .update(updates)
        .eq('id', packageId)
        .select()
        .single();
    });
  }

  /**
   * Delete payment package
   */
  static async deletePackage(packageId: string): Promise<ServiceResponse<void>> {
    if (!packageId) {
      return ServiceResponseHelper.error(
        ServiceError.validation('Package ID is required')
      );
    }

    return this.executeMutation(async () => {
      return await this.db
        .from('payment_packages')
        .delete()
        .eq('id', packageId);
    });
  }

  /**
   * Get payment transactions
   */
  static async getTransactions(
    filters?: {
      trainerId?: string;
      clientId?: string;
      status?: string;
      limit?: number;
    }
  ): Promise<ServiceResponse<any[]>> {
    try {
      let query: any = this.db
        .from('customer_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.trainerId) {
        query = query.eq('trainer_id', filters.trainerId);
      }

      if (filters?.clientId) {
        query = query.eq('client_id', filters.clientId);
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return ServiceResponseHelper.success(data || []);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Calculate package commission (RPC wrapper)
   */
  static async calculateCommission(
    trainerId: string,
    packagePriceCents: number
  ): Promise<ServiceResponse<number>> {
    try {
      const { data, error } = await this.db.rpc('calculate_package_commission', {
        p_trainer_id: trainerId,
        p_package_price_cents: packagePriceCents
      });

      if (error) throw error;
      return ServiceResponseHelper.success(data as number);
    } catch (error) {
      return ServiceResponseHelper.error(ServiceError.fromError(error));
    }
  }

  /**
   * Get payment methods for user
   */
  static async getPaymentMethods(): Promise<ServiceResponse<any[]>> {
    const userIdResponse = await this.getCurrentUserId();
    if (!userIdResponse.success || !userIdResponse.data) {
      return ServiceResponseHelper.error(userIdResponse.error!);
    }

    return this.executeListQuery(async () => {
      return await this.db
        .from('billing_payment_method')
        .select('*')
        .eq('trainer_id', userIdResponse.data)
        .eq('is_active', true)
        .order('is_default', { ascending: false });
    });
  }

  /**
   * Get invoices for trainer
   */
  static async getInvoices(
    trainerId?: string,
    limit: number = 50
  ): Promise<ServiceResponse<any[]>> {
    const effectiveTrainerId = trainerId || (await this.getCurrentUserId()).data;
    
    if (!effectiveTrainerId) {
      return ServiceResponseHelper.error(
        ServiceError.unauthorized('User must be authenticated')
      );
    }

    return this.executeListQuery(async () => {
      return await this.db
        .from('billing_invoice')
        .select('*')
        .eq('trainer_id', effectiveTrainerId)
        .order('created_at', { ascending: false })
        .limit(limit);
    });
  }
}

export const PaymentService = PaymentServiceClass;
export { PaymentServiceClass };
