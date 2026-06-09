import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../services/paymentService';
import type { Payment } from '../types';

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentService.getPayments();
      setPayments(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch payments'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return { payments, loading, error, refetch: fetchPayments };
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
