"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { getFavoriteCount } from "@/app/actions/favorites";

type FavoritesContextValue = {
  count: number;
  increment: () => void;
  decrement: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { status, data: session } = useSession();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "authenticated") {
      // Reset local count when the session ends; nothing external to synchronize with here.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(0);
      return;
    }
    let cancelled = false;
    getFavoriteCount().then((n) => {
      if (!cancelled) setCount(n);
    });
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.id]);

  const increment = useCallback(() => setCount((n) => n + 1), []);
  const decrement = useCallback(() => setCount((n) => Math.max(0, n - 1)), []);

  const value = useMemo(() => ({ count, increment, decrement }), [count, increment, decrement]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
