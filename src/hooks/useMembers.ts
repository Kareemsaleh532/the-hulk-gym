import { useState } from 'react';
import { useGym } from '../context/GymContext';
import { memberService } from '../services/memberService';
import type { Member, Payment } from '../types';

export const useMembers = () => {
  const { members, membersLoading: loading } = useGym();
  return { members, loading, error: null };
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
