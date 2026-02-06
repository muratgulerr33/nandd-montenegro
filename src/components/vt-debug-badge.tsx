"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";

const DATA_DIRECTION = "data-page-transition";
const FORCE_MOTION_KEY = "__nandd_force_motion";
const SLOW_ROUTE_PREFIX = "__nandd_vt_slow:";
const SLOW_ROUTE_EXPIRE_MS = 30 * 60 * 1000;

function isSlowRoute(pathname: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(SLOW_ROUTE_PREFIX + pathname);
    if (raw == null) return false;
    const data = JSON.parse(raw) as { t?: number };
    const t = data?.t;
    if (typeof t !== "number" || !Number.isFinite(t)) return false;
    if (Date.now() - t > SLOW_ROUTE_EXPIRE_MS) return false;
    return true;
  } catch {
    return false;
  }
}

export function VTDebugBadge() {
  const pathname = usePathname();
  const [vt, setVt] = useState<"ON" | "OFF">("OFF");
  const [rm, setRm] = useState<"ON" | "OFF">("OFF");
  const [force, setForce] = useState<"ON" | "OFF">("OFF");
  const [last, setLast] = useState<"forward" | "back" | "none">("none");
  const [slow, setSlow] = useState<"ON" | "OFF">("OFF");

  useEffect(() => {
    const hasVT =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as Document & { startViewTransition?: (cb: () => void | Promise<void>) => { finished: Promise<void> } })
        .startViewTransition === "function";
    const mq =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    const tick = () => {
      setVt(hasVT ? "ON" : "OFF");
      setRm(mq?.matches ? "ON" : "OFF");
      setForce(typeof localStorage !== "undefined" && localStorage.getItem(FORCE_MOTION_KEY) === "1" ? "ON" : "OFF");
      setSlow(isSlowRoute(pathname) ? "ON" : "OFF");
    };
    const id = requestAnimationFrame(tick);

    const onChange = () => {
      setRm(mq?.matches ? "ON" : "OFF");
      setForce(typeof localStorage !== "undefined" && localStorage.getItem(FORCE_MOTION_KEY) === "1" ? "ON" : "OFF");
    };
    mq?.addEventListener("change", onChange);
    window.addEventListener("storage", onChange);

    const updateLast = () => {
      const v = document.documentElement.getAttribute(DATA_DIRECTION);
      if (v === "forward" || v === "back") setLast(v);
    };
    const observer = new MutationObserver(updateLast);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [DATA_DIRECTION],
    });
    updateLast();

    tick();
    let intervalId: ReturnType<typeof setInterval> | null = setInterval(tick, 1000);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } else {
        if (!intervalId) {
          tick();
          intervalId = setInterval(tick, 1000);
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelAnimationFrame(id);
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      mq?.removeEventListener("change", onChange);
      window.removeEventListener("storage", onChange);
      observer.disconnect();
    };
  }, [pathname]);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div
      className="fixed bottom-3 right-3 z-[9999] rounded border border-border bg-background/95 px-2 py-1 font-mono text-[10px] shadow-md backdrop-blur"
      aria-hidden
    >
      <div>VT: {vt}</div>
      <div>RM: {rm}</div>
      <div>FORCE: {force}</div>
      <div>LAST: {last}</div>
      <div>SLOW: {slow}</div>
    </div>
  );
}
