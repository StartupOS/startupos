import React, { useEffect, useRef } from 'react';

interface Props {
  callback: () => void;
  ignoreRef: React.RefObject<HTMLDivElement>;
}

export default function useOnClickOutside(props: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { callback, ignoreRef} = props;
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      if (
        !ignoreRef.current ||
        ignoreRef.current.contains(event.target)
      ) {
        return;
      }

      callback();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [callback, ignoreRef]);

  return ref;
}
