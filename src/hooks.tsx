import { useState, useCallback } from "react";

export function useAsyncLoading<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const [loading, setLoading] = useState(false);

  const wrapped = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      setLoading(true);
      try {
        return await fn(...args);
      } finally {
        setLoading(false);
      }
    },
    [fn]
  );

  return { loading, wrapped };
}