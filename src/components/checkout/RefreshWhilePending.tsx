"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 20;

/**
 * Le webhook Stripe confirme le paiement quelques secondes après le retour du
 * client : la page se recharge jusqu'à le voir passer (une minute au plus).
 */
export function RefreshWhilePending() {
  const router = useRouter();

  useEffect(() => {
    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= MAX_ATTEMPTS) clearInterval(timer);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [router]);

  return null;
}
