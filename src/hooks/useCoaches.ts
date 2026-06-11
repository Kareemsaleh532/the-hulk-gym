import { useState, useEffect } from 'react';
import type { Coach } from '../types';
import { coachService } from '../services/coachService';

export function useCoaches() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = coachService.subscribeToCoaches((data, err) => {
      if (err) {
        setError(err.message);
      } else {
        setCoaches(data);
        setError(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { coaches, loading, error };
}
