import { useState, useEffect, useCallback } from 'react';

const useParallax = (speed = 0.15) => {
  const [offset, setOffset] = useState(0);

  const onScroll = useCallback(() => {
    setOffset(window.scrollY * speed);
  }, [speed]);

  useEffect(() => {
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  return offset;
};

export default useParallax;
