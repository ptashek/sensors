// @flow
import type { KeyValue } from 'lib/types';
import { useEffect, useRef, useMemo } from 'react';

type useIntervalHook = (() => void, number) => void;
type useTrendHook = (KeyValue<number>[], string) => -1 | 0 | 1;

// Source: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export const useInterval: useIntervalHook = (callback, delay) => {
  const savedCallback = useRef<() => void>(callback);

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  // eslint-disable-next-line consistent-return
  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export const useTrend: useTrendHook = (data, propName) => {
  return useMemo<-1 | 0 | 1>(() => {
    if (data && propName) {
      const intercept = data[data.length - 1][propName];
      const trend = (data[0][propName] - intercept) / data.length;

      if (trend > 0) {
        return 1;
      }

      if (trend < 0) {
        return -1;
      }
    }
    return 0;
  }, [data, propName]);
};
