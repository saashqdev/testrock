import { useEffect, useState } from "react";

/**
 * Hook to handle hydration mismatches by ensuring consistent rendering between server and client.
 * Returns false during SSR and first client render, then true after hydration.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}