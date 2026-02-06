"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { routing } from "@/i18n/routing";

const SCROLL_PREFIX = "__nandd_scroll:";
const SLOW_ROUTE_PREFIX = "__nandd_vt_slow:";
const HISTORY_PATCHED_KEY = "__nandd_historyPatched";
const FORCE_MOTION_KEY = "__nandd_force_motion";
const INTENT_WINDOW_MS = 700;
const SLOW_ROUTE_THRESHOLD_MS = 750;
const SLOW_ROUTE_EXPIRE_MS = 30 * 60 * 1000;
const SLOW_ROUTE_MAX_ENTRIES = 20;
const TRANSITION_LOCK_GUARD_MS = 1200;
const PREFETCH_QUEUE_MAX = 6;
const PREFETCH_IDLE_FALLBACK_MS = 200;

type DocumentWithViewTransition = Document & {
  startViewTransition?(callback: () => void | Promise<void>): { finished: Promise<void> };
};

const EXCLUDE_SELECTOR = '[role="dialog"], [data-radix-portal]';

/** next-intl router.push expects pathname without locale prefix; strip it from full path. */
function pathnameWithoutLocale(fullPath: string): string {
  const [pathPart, searchPart] = fullPath.split("?");
  const segments = pathPart.replace(/^\/+|\/+$/g, "").split("/");
  const first = segments[0];
  if (first && routing.locales.includes(first as (typeof routing.locales)[number])) {
    segments.shift();
    const path = segments.length ? "/" + segments.join("/") : "/";
    return searchPart != null ? `${path}?${searchPart}` : path;
  }
  return fullPath;
}

function isSlowRoute(pathname: string): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(SLOW_ROUTE_PREFIX + pathname);
    if (raw == null) return false;
    const data = JSON.parse(raw) as { t?: number };
    const t = data?.t;
    if (typeof t !== "number" || !Number.isFinite(t)) return false;
    if (Date.now() - t > SLOW_ROUTE_EXPIRE_MS) {
      sessionStorage.removeItem(SLOW_ROUTE_PREFIX + pathname);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function setSlowRoute(pathname: string): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    const key = SLOW_ROUTE_PREFIX + pathname;
    const value = JSON.stringify({ t: Date.now() });
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k?.startsWith(SLOW_ROUTE_PREFIX)) keys.push(k);
    }
    if (keys.length >= SLOW_ROUTE_MAX_ENTRIES) {
      const entries = keys
        .map((k) => {
          try {
            const raw = sessionStorage.getItem(k);
            const t = raw ? (JSON.parse(raw) as { t?: number })?.t : 0;
            return { k, t: typeof t === "number" ? t : 0 };
          } catch {
            return { k, t: 0 };
          }
        })
        .sort((a, b) => a.t - b.t);
      const toRemove = entries.slice(0, entries.length - SLOW_ROUTE_MAX_ENTRIES + 1);
      toRemove.forEach(({ k }) => sessionStorage.removeItem(k));
    }
    sessionStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

function getMotionEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const forceMotion =
    process.env.NODE_ENV !== "production" && localStorage.getItem(FORCE_MOTION_KEY) === "1";
  return forceMotion || !reduceMotion;
}

function getScrollKey(pathname: string, search: string): string {
  return pathname + (search || "");
}

function getStoredScroll(key: string): number | null {
  if (typeof sessionStorage === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SCROLL_PREFIX + key);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

function setStoredScroll(key: string, scrollY: number): void {
  try {
    sessionStorage.setItem(SCROLL_PREFIX + key, String(scrollY));
  } catch {
    // ignore
  }
}

export function PageTransitionController() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const routeKeyRef = useRef<string>("");
  const pendingRestoreRef = useRef<number | null>(null);
  const commitResolveRef = useRef<(() => void) | null>(null);
  const isTransitioningRef = useRef(false);
  const internalNavRef = useRef(false);
  const lastIntentAtRef = useRef(0);
  const intentAllowedRef = useRef(true);
  const navigationStartRef = useRef(0);
  const lockGuardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchedHrefsRef = useRef<Set<string>>(new Set());
  const prefetchQueueRef = useRef<string[]>([]);
  const prefetchIdleRef = useRef<ReturnType<typeof setTimeout> | number | null>(null);

  const searchString = searchParams?.toString() ?? "";
  const routeKey = getScrollKey(pathname, searchString ? `?${searchString}` : "");

  // Route commit: scroll restore + resolve view transition
  useEffect(() => {
    if (routeKeyRef.current === routeKey) return;
    routeKeyRef.current = routeKey;

    const pending = pendingRestoreRef.current;
    if (pending != null) {
      pendingRestoreRef.current = null;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const top = Math.max(0, Math.min(pending, maxScroll));
      window.scrollTo({ top, left: 0, behavior: "auto" });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            const maxScrollAgain = document.documentElement.scrollHeight - window.innerHeight;
            window.scrollTo({ top: Math.max(0, Math.min(top, maxScrollAgain)), left: 0, behavior: "auto" });
          }, 0);
        });
      });
    }

    const resolve = commitResolveRef.current;
    if (resolve) {
      commitResolveRef.current = null;
      resolve();
    }

    // Slow route: if this navigation took too long, mark route as slow for next time
    const navStart = navigationStartRef.current;
    if (navStart > 0) {
      const elapsed = performance.now() - navStart;
      if (elapsed > SLOW_ROUTE_THRESHOLD_MS) setSlowRoute(pathname);
      navigationStartRef.current = 0;
    }
  }, [routeKey, pathname]);

  // Clear transition lock guard on unmount
  useEffect(() => {
    return () => {
      if (lockGuardTimeoutRef.current) {
        clearTimeout(lockGuardTimeoutRef.current);
        lockGuardTimeoutRef.current = null;
      }
    };
  }, []);

  // User intent capture: only navigations triggered by recent pointer/key count as "intent"
  useEffect(() => {
    const setIntent = (e: Event) => {
      const el = e.target as Element;
      intentAllowedRef.current = !(el?.closest?.(EXCLUDE_SELECTOR));
      lastIntentAtRef.current = performance.now();
    };
    const onPointerDown = (e: Event) => setIntent(e);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") setIntent(e);
    };
    document.addEventListener("pointerdown", onPointerDown, { capture: true });
    document.addEventListener("keydown", onKeyDown, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, { capture: true });
      document.removeEventListener("keydown", onKeyDown, { capture: true });
    };
  }, []);

  // Prefetch on pointerenter/focusin: idle queue + dedupe + connection-aware (max 6, no 2g/saveData)
  useEffect(() => {
    const conn = typeof navigator !== "undefined" ? (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection : undefined;
    const shouldSkipPrefetch = (): boolean => {
      if (conn?.saveData === true) return true;
      const et = conn?.effectiveType;
      if (et === "2g" || et === "slow-2g") return true;
      return false;
    };

    const runPrefetchFromQueue = () => {
      prefetchIdleRef.current = null;
      const pathSearch = prefetchQueueRef.current.shift();
      if (pathSearch == null) return;
      if (prefetchedHrefsRef.current.has(pathSearch)) return;
      prefetchedHrefsRef.current.add(pathSearch);
      try {
        router.prefetch(pathnameWithoutLocale(pathSearch));
      } catch {
        prefetchedHrefsRef.current.delete(pathSearch);
      }
      if (prefetchQueueRef.current.length > 0) {
        const schedule =
          typeof requestIdleCallback !== "undefined"
            ? requestIdleCallback
            : (cb: () => void) => setTimeout(cb, PREFETCH_IDLE_FALLBACK_MS);
        prefetchIdleRef.current = schedule(runPrefetchFromQueue);
      }
    };

    const tryPrefetch = (e: Event) => {
      const target = (e.target as Element)?.closest?.("a");
      if (!target || target.tagName !== "A") return;
      const href = target.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if ((target as HTMLAnchorElement).target === "_blank" || target.hasAttribute("download")) return;
      if ((target as Element).closest(EXCLUDE_SELECTOR)) return;
      if (shouldSkipPrefetch()) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        const pathSearch = url.pathname + url.search;
        if (pathSearch === window.location.pathname + window.location.search) return;
        if (prefetchedHrefsRef.current.has(pathSearch)) return;
        const q = prefetchQueueRef.current;
        if (q.length >= PREFETCH_QUEUE_MAX) q.shift();
        q.push(pathSearch);
        if (prefetchIdleRef.current != null) return;
        const schedule =
          typeof requestIdleCallback !== "undefined"
            ? requestIdleCallback
            : (cb: () => void) => setTimeout(cb, PREFETCH_IDLE_FALLBACK_MS);
        prefetchIdleRef.current = schedule(runPrefetchFromQueue);
      } catch {
        // ignore
      }
    };
    document.addEventListener("pointerenter", tryPrefetch, { capture: true });
    document.addEventListener("focusin", tryPrefetch, { capture: true });
    return () => {
      document.removeEventListener("pointerenter", tryPrefetch, { capture: true });
      document.removeEventListener("focusin", tryPrefetch, { capture: true });
      if (prefetchIdleRef.current != null) {
        if (typeof cancelIdleCallback !== "undefined") {
          cancelIdleCallback(prefetchIdleRef.current as number);
        } else {
          clearTimeout(prefetchIdleRef.current as ReturnType<typeof setTimeout>);
        }
        prefetchIdleRef.current = null;
      }
    };
  }, [router]);

  // Popstate: back navigation — set direction, pending scroll restore, and view transition
  useEffect(() => {
    const hasViewTransition =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as DocumentWithViewTransition).startViewTransition === "function";

    const handler = () => {
      if (!getMotionEnabled()) return;
      const key = getScrollKey(window.location.pathname, window.location.search);
      const scrollY = getStoredScroll(key);
      if (scrollY != null) pendingRestoreRef.current = scrollY;
      (document.documentElement.dataset as Record<string, string>).pageTransition = "back";

      if (!hasViewTransition) return;
      if (isTransitioningRef.current) return;
      if (isSlowRoute(window.location.pathname)) return;

      isTransitioningRef.current = true;
      navigationStartRef.current = performance.now();
      if (lockGuardTimeoutRef.current) clearTimeout(lockGuardTimeoutRef.current);
      lockGuardTimeoutRef.current = setTimeout(() => {
        lockGuardTimeoutRef.current = null;
        if (isTransitioningRef.current) {
          isTransitioningRef.current = false;
          delete (document.documentElement.dataset as Record<string, string>).pageTransition;
        }
      }, TRANSITION_LOCK_GUARD_MS);

      const commitPromise = new Promise<void>((resolve) => {
        commitResolveRef.current = resolve;
      });
      (document as DocumentWithViewTransition).startViewTransition!(async () => {
        await commitPromise;
      })
        ?.finished.then(() => {
          delete (document.documentElement.dataset as Record<string, string>).pageTransition;
        })
        .catch(() => {
          delete (document.documentElement.dataset as Record<string, string>).pageTransition;
        })
        .finally(() => {
          isTransitioningRef.current = false;
        });
    };
    window.addEventListener("popstate", handler, { capture: true });
    return () => window.removeEventListener("popstate", handler, { capture: true });
  }, []);

  // History API patch: forward navigation via pushState (e.g. router.push) also gets VT
  useEffect(() => {
    const win = typeof window !== "undefined" ? window : null;
    if (win && (win as unknown as Record<string, boolean>)[HISTORY_PATCHED_KEY]) return;

    const doc = document as DocumentWithViewTransition;
    const hasViewTransition =
      typeof doc.startViewTransition === "function";

    const originalPushState = history.pushState.bind(history);
    const originalReplaceState = history.replaceState.bind(history);

    if (win) (win as unknown as Record<string, boolean>)[HISTORY_PATCHED_KEY] = true;

    history.pushState = function (
      state: unknown,
      title: string,
      url?: string | URL | null
    ) {
      if (url == null) {
        originalPushState(state, title, url);
        return;
      }
      let nextUrl: URL;
      try {
        nextUrl = new URL(String(url), window.location.href);
      } catch {
        originalPushState(state, title, url);
        return;
      }
      const nextPathSearch = nextUrl.pathname + nextUrl.search;
      const currentPathSearch = window.location.pathname + window.location.search;
      if (nextPathSearch === currentPathSearch) {
        originalPushState(state, title, url);
        return;
      }
      if (isTransitioningRef.current) {
        originalPushState(state, title, url);
        return;
      }
      if (internalNavRef.current) {
        internalNavRef.current = false;
        originalPushState(state, title, url);
        return;
      }
      if (!getMotionEnabled() || !hasViewTransition) {
        originalPushState(state, title, url);
        return;
      }

      const now = performance.now();
      const hasRecentIntent = now - lastIntentAtRef.current < INTENT_WINDOW_MS && intentAllowedRef.current;
      if (!hasRecentIntent) {
        originalPushState(state, title, url);
        return;
      }
      if (isSlowRoute(nextUrl.pathname)) {
        originalPushState(state, title, url);
        return;
      }

      const currentKey = getScrollKey(window.location.pathname, window.location.search);
      setStoredScroll(currentKey, window.scrollY);
      (document.documentElement.dataset as Record<string, string>).pageTransition = "forward";
      navigationStartRef.current = performance.now();

      const commitPromise = new Promise<void>((resolve) => {
        commitResolveRef.current = resolve;
      });
      isTransitioningRef.current = true;

      if (lockGuardTimeoutRef.current) clearTimeout(lockGuardTimeoutRef.current);
      lockGuardTimeoutRef.current = setTimeout(() => {
        lockGuardTimeoutRef.current = null;
        if (isTransitioningRef.current) {
          isTransitioningRef.current = false;
          delete (document.documentElement.dataset as Record<string, string>).pageTransition;
        }
      }, TRANSITION_LOCK_GUARD_MS);

      const vt = doc.startViewTransition!(async () => {
        originalPushState(state, title, url);
        await commitPromise;
      });
      if (vt?.finished) {
        vt.finished
          .then(() => { delete (document.documentElement.dataset as Record<string, string>).pageTransition; })
          .catch(() => { delete (document.documentElement.dataset as Record<string, string>).pageTransition; })
          .finally(() => {
            isTransitioningRef.current = false;
          });
      } else {
        isTransitioningRef.current = false;
        delete (document.documentElement.dataset as Record<string, string>).pageTransition;
      }
    };

    history.replaceState = function (
      state: unknown,
      title: string,
      url?: string | URL | null
    ) {
      originalReplaceState(state, title, url);
    };

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      if (win) (win as unknown as Record<string, boolean>)[HISTORY_PATCHED_KEY] = false;
    };
  }, []);

  // Click capture: forward navigation with view transition (or fallback)
  useEffect(() => {
    const hasViewTransition =
      typeof document !== "undefined" &&
      "startViewTransition" in document &&
      typeof (document as DocumentWithViewTransition).startViewTransition === "function";

    if (!hasViewTransition) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const anchor = (target as Element).closest?.("a");
      if (!anchor || anchor.tagName !== "A") return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      let pathnameSearch: string;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        pathnameSearch = url.pathname + url.search;
        if (pathnameSearch === window.location.pathname + window.location.search) return;
      } catch {
        return;
      }

      if ((anchor as Element).closest(EXCLUDE_SELECTOR)) return;

      if (!getMotionEnabled()) return;

      if (isTransitioningRef.current) {
        router.push(pathnameWithoutLocale(pathnameSearch));
        return;
      }

      const now = performance.now();
      const hasRecentIntent = now - lastIntentAtRef.current < INTENT_WINDOW_MS && intentAllowedRef.current;
      const targetPath = pathnameSearch.replace(/\?.*/, "") || "/";
      if (!hasRecentIntent || isSlowRoute(targetPath)) {
        e.preventDefault();
        internalNavRef.current = true;
        router.push(pathnameWithoutLocale(pathnameSearch));
        return;
      }

      const currentKey = getScrollKey(pathname, searchString ? `?${searchString}` : "");
      setStoredScroll(currentKey, window.scrollY);

      e.preventDefault();
      (document.documentElement.dataset as Record<string, string>).pageTransition = "forward";
      navigationStartRef.current = performance.now();

      const commitPromise = new Promise<void>((resolve) => {
        commitResolveRef.current = resolve;
      });

      isTransitioningRef.current = true;
      if (lockGuardTimeoutRef.current) clearTimeout(lockGuardTimeoutRef.current);
      lockGuardTimeoutRef.current = setTimeout(() => {
        lockGuardTimeoutRef.current = null;
        if (isTransitioningRef.current) {
          isTransitioningRef.current = false;
          delete (document.documentElement.dataset as Record<string, string>).pageTransition;
        }
      }, TRANSITION_LOCK_GUARD_MS);

      (document as DocumentWithViewTransition).startViewTransition!(async () => {
        internalNavRef.current = true;
        try {
          router.push(pathnameWithoutLocale(pathnameSearch));
          await commitPromise;
        } finally {
          internalNavRef.current = false;
        }
      })
        ?.finished.then(() => {
          delete (document.documentElement.dataset as Record<string, string>).pageTransition;
        })
        .catch(() => {
          delete (document.documentElement.dataset as Record<string, string>).pageTransition;
        })
        .finally(() => {
          isTransitioningRef.current = false;
        });
    };

    document.addEventListener("click", handler, { capture: true });
    return () => document.removeEventListener("click", handler, { capture: true });
  }, [pathname, searchString, router]);

  return null;
}
