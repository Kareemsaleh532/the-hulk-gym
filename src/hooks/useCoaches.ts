import { useGym } from '../context/GymContext';

export function useCoaches() {
  const { coaches, coachesLoading: loading } = useGym();
  return { coaches, loading, error: null };
}
