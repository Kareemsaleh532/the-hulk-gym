import { useMemo } from 'react';
import { useMembers } from './useMembers';
import { useAuth } from './useAuth';

export const useFilteredMembers = () => {
  const { members, loading, error } = useMembers();
  const { filterMembersByAccess } = useAuth();

  const filteredMembers = useMemo(() => {
    return filterMembersByAccess(members);
  }, [members, filterMembersByAccess]);

  return { members: filteredMembers, allMembers: members, loading, error };
};
