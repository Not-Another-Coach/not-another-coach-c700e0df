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
      const result = await (supabase as any)
        .from('payment_packages')
        .select('*')
        .eq('trainer_id', effectiveTrainerId)
        .eq('is_active', true)
        .order('price_value', { ascending: true });
      
      if (result.error) throw result.error;
      return ServiceResponseHelper.success(result.data || []);
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
   * Create payment package with commission snapshot
   */
  static async createPackage(
    packageData: Record<string, any>
  ): Promise<ServiceResponse<any>> {
    const userIdResponse = await this.getCurrentUserId();
    if (!userIdResponse.success || !userIdResponse.data) {
      return ServiceResponseHelper.error(userIdResponse.error!);
    }

    const trainerId = packageData.trainer_id || userIdResponse.data;

    try {
      // 1. Fetch current membership commission details
      const { data: membership, error: membershipError } = await this.db
        .from('trainer_membership')
        .select(`
          id,
          plan_type,
          membership_plan_definitions!inner(
            id,
            has_package_commission,
            commission_fee_type,
            commission_fee_value_percent,
            commission_fee_value_flat_cents
          )
        `)
        .eq('trainer_id', trainerId)
        .eq('is_active', true)
        .single();

      if (membershipError) throw new Error('Failed to fetch membership details');

      const planDef = (membership as any).membership_plan_definitions;

      // 2. Check engagement stage to determine commission lock timing
      const clientId = packageData.customer_id || packageData.client_id;
      let engagementStage = 'getting_to_know_your_coach'; // Default

      if (clientId) {
        const { data: engagement } = await this.db
          .from('client_trainer_engagement')
          .select('stage')
          .eq('trainer_id', trainerId)
          .eq('client_id', clientId)
          .single();

        if (engagement) {
          engagementStage = engagement.stage;
        }
      }

      // 3. Create package with commission snapshot
      const packageWithCommission = {
        ...packageData,
        applied_commission_plan_id: planDef.id,
        applied_commission_snapshot: {
          has_commission: planDef.has_package_commission,
          fee_type: planDef.commission_fee_type,
          fee_value_percent: planDef.commission_fee_value_percent,
          fee_value_flat_cents: planDef.commission_fee_value_flat_cents
        },
        engagement_stage_at_lock: engagementStage,
        commission_locked_at: new Date().toISOString()
      };

      const { data, error } = await this.db
        .from('payment_packages')
        .insert([{
          ...packageWithCommission,
          customer_id: userIdResponse.data
        }] as any)
        .select()
        .single();
      
      if (error) throw error;

      console.log('✅ Package created with commission snapshot:', data.id);
      
      return ServiceResponseHelper.success(data);
    } catch (error) {
      console.error('❌ Package creation failed:', error);
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
