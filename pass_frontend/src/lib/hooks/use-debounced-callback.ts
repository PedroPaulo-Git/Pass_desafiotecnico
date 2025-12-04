import { useRef, useEffect, useCallback } from "react";

export function useDebouncedCallback<T extends (...args: any[]) => void>(
  fn: T,
  delay = 200
) {
  const fnRef = useRef(fn);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      // @ts-ignore window.setTimeout returns number in browsers
      timer.current = window.setTimeout(
        () => fnRef.current(...args),
        delay
      ) as unknown as number;
    },
    [delay]
  );
}

export default useDebouncedCallback;
