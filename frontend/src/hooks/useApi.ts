import { useState, useCallback, useEffect } from 'react';

interface UseApiResponse<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  get: (url: string) => Promise<void>;
  post: (url: string, body: any) => Promise<void>;
  put: (url: string, body: any) => Promise<void>;
  del: (url: string) => Promise<void>;
}

export function useApi<T>(): UseApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const handleApiCall = useCallback(async (
    url: string,
    method: string,
    body?: any
  ) => {
    const abortController = new AbortController();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('An unknown error occurred'));
      }
    } finally {
      setLoading(false);
    }

    return () => {
      abortController.abort();
    };
  }, []);

  const get = useCallback(async (url: string) => {
    return handleApiCall(url, 'GET');
  }, [handleApiCall]);

  const post = useCallback(async (url: string, body: any) => {
    return handleApiCall(url, 'POST', body);
  }, [handleApiCall]);

  const put = useCallback(async (url: string, body: any) => {
    return handleApiCall(url, 'PUT', body);
  }, [handleApiCall]);

  const del = useCallback(async (url: string) => {
    return handleApiCall(url, 'DELETE');
  }, [handleApiCall]);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      setData(null);
      setError(null);
    };
  }, []);

  return {
    data,
    loading,
    error,
    get,
    post,
    put,
    del
  };
}