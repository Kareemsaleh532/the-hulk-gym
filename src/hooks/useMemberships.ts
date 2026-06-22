import { useState, useEffect, useCallback } from 'react';
import { membershipService } from '../services/membershipService';
import type { DbMembership } from '../types';

export const useMemberships = () => {
  const [memberships, setMemberships] = useState<DbMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMemberships = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await membershipService.getMemberships();
      setMemberships(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch memberships'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);

  return { memberships, loading, error, refetch: fetchMemberships };
};

export const useRenewMembership = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const renewMembership = async (memberId: string, planId: string, customStartDate?: string, paymentInfo?: { method: string, status: string }) => {
    try {
      setLoading(true);
      setError(null);
      await membershipService.renewMembership(memberId, planId, customStartDate, paymentInfo);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to renew membership');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { renewMembership, loading, error };
};

export const useWithdrawMembership = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const withdrawMembership = async (memberId: string) => {
    try {
      setLoading(true);
      setError(null);
      await membershipService.withdrawMembership(memberId);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to withdraw membership');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { withdrawMembership, loading, error };
};
