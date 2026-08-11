import { useState, useEffect } from 'react';

export const useFetch = (fetchFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const execute = async () => {
      try {
        setLoading(true);
        const result = await fetchFunction();
        if (isMounted) setData(result.data || result);
      } catch (err) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    execute();
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
};
