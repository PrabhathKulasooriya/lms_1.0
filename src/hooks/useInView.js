"use client";
import { useEffect, useRef, useState } from "react";

export function useInView(threshold = 0.1) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold },
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
