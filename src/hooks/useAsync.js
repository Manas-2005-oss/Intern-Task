import { useCallback, useEffect, useState } from 'react';

export function useAsync(asyncFunction, options = {}) {
  const [data, setData] = useState(options.initialData ?? null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(Boolean(options.runOnMount ?? true));

  const execute = useCallback(
    async (...args) => {
      setIsLoading(true);
      setError('');
      try {
        const result = await asyncFunction(...args);
        setData(result);
        return result;
      } catch (err) {
        setError(err.message || 'Unable to complete request');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [asyncFunction],
  );

  useEffect(() => {
    if (options.runOnMount === false) return;
    execute();
  }, [execute, options.runOnMount]);

  return { data, error, isLoading, execute, setData };
}
