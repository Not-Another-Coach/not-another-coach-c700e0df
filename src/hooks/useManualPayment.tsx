import { useState } from "react";
import { toast } from "sonner";
import { calculatePackagePaymentOptions, calculateInitialPayment } from "@/lib/packagePaymentUtils";

export interface PaymentRecord {
  id: string;
  packageId: string;
  packageName: string;
  paymentType: 'one-off' | 'subscription';
  paymentMode: 'upfront' | 'installments';
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  installmentCount?: number;
  installmentAmount?: number;
  paidInstallments: number;
  status: 'pending' | 'completed' | 'active';
  createdAt: Date;
  nextPaymentDate?: Date;
}

export function useManualPayment() {
  const [processing, setProcessing] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);

  const processPayment = async (
    pkg: {
      id: string;
      name: string;
      price: number;
      currency: string;
      customerPaymentModes?: ('upfront' | 'installments')[];
      installmentCount?: number;
    },
    selectedMode: 'upfront' | 'installments',
    successUrl?: string,
    cancelUrl?: string
  ): Promise<PaymentRecord> => {
    setProcessing(true);
    
    try {
      const calculation = calculatePackagePaymentOptions(pkg);
      const initialAmount = calculateInitialPayment(calculation, selectedMode);
      
      // Redirect to Stripe Checkout - return a placeholder record
      // The actual payment will be processed via webhook
      const paymentRecord: PaymentRecord = {
        id: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        packageId: pkg.id,
        packageName: pkg.name,
        paymentType: selectedMode === 'upfront' ? 'one-off' : 'subscription',
        paymentMode: selectedMode,
        totalAmount: pkg.price,
        paidAmount: 0, // Will be updated after webhook
        remainingAmount: pkg.price,
        currency: pkg.currency,
        installmentCount: selectedMode === 'installments' ? pkg.installmentCount : undefined,
        installmentAmount: selectedMode === 'installments' ? initialAmount : undefined,
        paidInstallments: 0,
        status: 'pending',
        createdAt: new Date(),
        nextPaymentDate: selectedMode === 'installments' && pkg.installmentCount && pkg.installmentCount > 1 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          : undefined,
      };
      
      setPaymentHistory(prev => [...prev, paymentRecord]);
      
      // This will be handled by the calling component to redirect to Stripe
      return paymentRecord;
    } catch (error) {
      toast.error("Payment setup failed. Please try again.");
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const processInstallmentPayment = async (paymentRecord: PaymentRecord): Promise<PaymentRecord> => {
    if (paymentRecord.paymentMode !== 'installments' || paymentRecord.status !== 'active') {
      throw new Error('Invalid payment record for installment processing');
    }

    setProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const updatedRecord: PaymentRecord = {
        ...paymentRecord,
        paidAmount: paymentRecord.paidAmount + (paymentRecord.installmentAmount || 0),
        paidInstallments: paymentRecord.paidInstallments + 1,
        remainingAmount: paymentRecord.remainingAmount - (paymentRecord.installmentAmount || 0),
      };
      
      // Check if this was the final installment
      if (updatedRecord.paidInstallments >= (paymentRecord.installmentCount || 0)) {
        updatedRecord.status = 'completed';
        updatedRecord.remainingAmount = 0;
        updatedRecord.nextPaymentDate = undefined;
        toast.success("All installments completed! Package fully paid.");
      } else {
        updatedRecord.nextPaymentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        toast.success(`Installment ${updatedRecord.paidInstallments} of ${paymentRecord.installmentCount} processed!`);
      }
      
      setPaymentHistory(prev => 
        prev.map(record => record.id === paymentRecord.id ? updatedRecord : record)
      );
      
      return updatedRecord;
    } catch (error) {
      toast.error("Installment payment failed. Please try again.");
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const getPaymentSummary = () => {
    const totalPaid = paymentHistory.reduce((sum, record) => sum + record.paidAmount, 0);
    const activeSubscriptions = paymentHistory.filter(record => record.status === 'active').length;
    const completedPayments = paymentHistory.filter(record => record.status === 'completed').length;
    
    return {
      totalPaid,
      activeSubscriptions,
      completedPayments,
      totalTransactions: paymentHistory.length,
    };
  };

  return {
    processing,
    paymentHistory,
    processPayment,
    processInstallmentPayment,
    getPaymentSummary,
  };
}