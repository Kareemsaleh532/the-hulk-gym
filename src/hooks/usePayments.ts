import { useState } from 'react';
import { useGym } from '../context/GymContext';
import { paymentService } from '../services/paymentService';
import type { Payment } from '../types';

export const usePayments = () => {
  const { payments, paymentsLoading: loading } = useGym();
  return { payments, loading, error: null };
};

export const useCreatePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createPayment = async (paymentData: Omit<Payment, 'id' | 'date' | 'memberName'>) => {
    try {
      setLoading(true);
      setError(null);
      await paymentService.createPayment(paymentData);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create payment');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { createPayment, loading, error };
};

export const useUpdatePaymentStatus = () => {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (id: string, status: Payment['status']) => {
    setLoading(true);
    try {
      await paymentService.updatePaymentStatus(id, status);
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading };
};

export const useDeletePayment = () => {
  const [loading, setLoading] = useState(false);

  const deletePayment = async (id: string) => {
    setLoading(true);
    try {
      await paymentService.deletePayment(id);
    } finally {
      setLoading(false);
    }
  };

  return { deletePayment, loading };
};
