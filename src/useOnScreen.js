import { useState, useEffect } from 'react';

const useOnScreen = (ref) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { rootMargin: '0px', threshold: 1.0 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.unobserve(ref.current);
    };
  }, [ref]);

  return isIntersecting;
};

export default useOnScreen;
