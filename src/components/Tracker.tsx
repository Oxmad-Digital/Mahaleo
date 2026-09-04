"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function sendDuration(id: string, duration: number) {
  const payload = JSON.stringify({ id, duration });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/track/duration", new Blob([payload], { type: "application/json" }));
  } else {
    fetch("/api/track/duration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {});
  }
}

export function Tracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer,
    });

    const startedAt = Date.now();
    let viewId: string | null = null;
    let sent = false;

    const finalize = () => {
      if (sent || !viewId) return;
      sent = true;
      sendDuration(viewId, Date.now() - startedAt);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") finalize();
    };

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    })
      .then((res) => res.json())
      .then((data: { id?: unknown }) => {
        if (typeof data.id === "string") viewId = data.id;
      })
      .catch(() => {});

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", finalize);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", finalize);
      finalize();
    };
  }, [pathname]);

  return null;
}
