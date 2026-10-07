"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { MAX_QTY_PER_LINE } from "@/lib/shipping";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  priceCents: number;
  currency: string;
  size?: string;
  qty: number;
  /** Stock connu de la taille au dernier ajout ou rafraîchissement du panier. */
  maxQty?: number;
};

/** Plafond de quantité d'une ligne : stock connu, et au plus MAX_QTY_PER_LINE. */
export function lineMaxQty(item: Pick<CartItem, "maxQty">) {
  return Math.min(item.maxQty ?? MAX_QTY_PER_LINE, MAX_QTY_PER_LINE);
}

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotalCents: number;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  updateQty: (productId: string, size: string | undefined, delta: number) => void;
  removeItem: (productId: string, size: string | undefined) => void;
  replaceItems: (items: CartItem[]) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "mahaleo:cart";

function sameLine(a: CartItem, productId: string, size: string | undefined) {
  return a.productId === productId && a.size === size;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      // localStorage is only available post-mount; this hydrates client state after SSR.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed/unavailable storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore unavailable storage
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    setItems((current) => {
      const existing = current.find((c) => sameLine(c, item.productId, item.size));
      if (existing) {
        return current.map((c) =>
          sameLine(c, item.productId, item.size)
            ? { ...c, ...item, qty: Math.min(c.qty + qty, lineMaxQty(item)) }
            : c
        );
      }
      return [...current, { ...item, qty: Math.min(qty, lineMaxQty(item)) }];
    });
  }, []);

  const updateQty = useCallback((productId: string, size: string | undefined, delta: number) => {
    setItems((current) =>
      current.map((c) =>
        sameLine(c, productId, size) ? { ...c, qty: Math.max(1, Math.min(c.qty + delta, lineMaxQty(c))) } : c
      )
    );
  }, []);

  const removeItem = useCallback((productId: string, size: string | undefined) => {
    setItems((current) => current.filter((c) => !sameLine(c, productId, size)));
  }, []);

  const replaceItems = useCallback((next: CartItem[]) => setItems(next), []);

  const clear = useCallback(() => setItems([]), []);

  const itemCount = useMemo(() => items.reduce((n, c) => n + c.qty, 0), [items]);
  const subtotalCents = useMemo(() => items.reduce((n, c) => n + c.priceCents * c.qty, 0), [items]);

  const value = useMemo(
    () => ({ items, itemCount, subtotalCents, hydrated, addItem, updateQty, removeItem, replaceItems, clear }),
    [items, itemCount, subtotalCents, hydrated, addItem, updateQty, removeItem, replaceItems, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
