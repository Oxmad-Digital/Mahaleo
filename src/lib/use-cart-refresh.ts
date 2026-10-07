"use client";

import { useEffect, useRef, useState } from "react";
import { refreshCart } from "@/app/actions/cart";
import { useCart } from "@/lib/cart";

/**
 * Rafraîchit une fois le panier du navigateur avec le catalogue (prix, stock,
 * disponibilité) et renvoie les corrections à afficher au visiteur.
 */
export function useCartRefresh() {
  const { items, hydrated, replaceItems } = useCart();
  const [notices, setNotices] = useState<string[]>([]);
  const [refreshed, setRefreshed] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!hydrated || started.current) return;
    started.current = true;
    if (items.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRefreshed(true);
      return;
    }
    refreshCart(items.map(({ productId, size, qty, priceCents }) => ({ productId, size, qty, priceCents })))
      .then((result) => {
        replaceItems(result.items);
        setNotices(result.notices);
      })
      // Hors ligne ou serveur indisponible : le checkout revérifie de toute façon.
      .catch(() => {})
      .finally(() => setRefreshed(true));
  }, [hydrated, items, replaceItems]);

  return { notices, refreshed };
}
