import { useState, useEffect, useCallback } from 'react';
import { memberService } from '../services/memberService';
import type { Member, Payment } from '../types';

export const useMembers = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await memberService.getMembers();
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred while fetching members'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  return { members, loading, error, refetch: fetchMembers };
};

export const useCreateMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createMember = async (memberData: Omit<Member, 'id' | 'status' | 'endDate'>, paymentInfo?: { method: Payment['method'], status: Payment['status'] }) => {
    try {
      setLoading(true);
      setError(null);
      await memberService.createMember(memberData, paymentInfo);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create member');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { createMember, loading, error };
};

export const useUpdateMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateMember = async (id: string, memberData: Partial<Member>) => {
    try {
      setLoading(true);
      setError(null);
      await memberService.updateMember(id, memberData);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to update member');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { updateMember, loading, error };
};

export const useDeleteMember = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteMember = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await memberService.deleteMember(id);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to delete member');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { deleteMember, loading, error };
};
