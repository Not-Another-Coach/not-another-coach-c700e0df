import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { rules as ownerRules } from "./rules";

export type DiagLevel = "error" | "warn" | "info";

export type DiagEvent = {
  ts: number;
  level: DiagLevel;
  route: string;
  source: string;
  message: string;
  details?: string;
  traceId?: string;
  flags?: Record<string, any>;
  owner?: string;
  count?: number;
};

// Redaction helpers (emails, bearer tokens) and URL query filtering
const ALLOW_PARAMS = new Set(["bookingId", "ptId"]);
export function redactUrl(u: string) {
  try {
    const url = new URL(u, window.location.origin);
    const params = new URLSearchParams(url.search);
    for (const k of Array.from(params.keys())) {
      if (!ALLOW_PARAMS.has(k)) params.set(k, "[redacted]");
    }
    const q = params.toString();
    return q ? `${url.pathname}?${q}` : url.pathname;
  } catch {
    return "[invalid-url]";
  }
}
export function redactStr(s?: string) {
  if (!s) return s;
  return String(s)
    // emails
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, "[email]")
    // bearer tokens
    .replace(/Bearer\s+[A-Za-z0-9\-_.]+/g, "Bearer [redacted]")
    // JWT tokens (three-part base64url)
    .replace(/\b[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]{10,}\.[A-Za-z0-9\-_]{10,}\b/g, "[jwt]")
    // phone numbers (common patterns)
    .replace(/\b(?:\+?\d{1,3}[-.\s()]*)?(?:\d{3}[-.\s()]*){2}\d{4}\b/g, "[phone]");
}

// Owner resolution uses centralized rules
function resolveOwner(route: string, source: string) {
  const hay = `${route} ${source}`;
  const rule = ownerRules.find((r) => r.pattern.test(hay));
  return rule?.owner ?? "Core";
}

// Context
interface DiagnosticsCtx {
  add: (e: Omit<DiagEvent, "ts" | "route" | "traceId" | "owner"> & { route?: string }) => void;
  events: DiagEvent[];
  grouped: DiagEvent[]; // grouped by message+source+route with counts
  clear: () => void;
  traceId: string;
}

const DiagnosticsContext = createContext<DiagnosticsCtx | undefined>(undefined);

// Internal key for grouping / dedupe window (60s)
const DEDUPE_WINDOW_MS = 60 * 1000;
const SAMPLE_RATE = import.meta.env.DEV ? 1 : 0.2; // 20% in prod by default
const FEATURE_FLAG_KEY = "diagnosticsEnabled"; // localStorage: "1" to enable in prod
const BURST_ERR_THRESHOLD = 10;
const BURST_WINDOW_MS = 60 * 1000;
const BURST_DURATION_MS = 10 * 60 * 1000;

export const DiagnosticsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [events, setEvents] = useState<DiagEvent[]>([]);
  const groupedRef = useRef<Map<string, DiagEvent>>(new Map());
  const [groupedSnap, setGroupedSnap] = useState<DiagEvent[]>([]);
  const traceIdRef = useRef<string>(crypto?.randomUUID?.() || Math.random().toString(36).slice(2));
  const burstUntilRef = useRef<number>(0);
  const errorTimestampsRef = useRef<number[]>([]);

  const samplingEnabled = useMemo(() => {
    if (import.meta.env.DEV) return true;
    const enabled = window.localStorage.getItem(FEATURE_FLAG_KEY) === "1";
    return enabled;
  }, [location.pathname]);

  const getFlagsSnapshot = useCallback(() => {
    const flags: Record<string, any> = {};
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i) || "";
        if (k === FEATURE_FLAG_KEY || k.startsWith("ff_")) {
          const v = window.localStorage.getItem(k);
          flags[k] = v === "1" || v?.toLowerCase() === "true" ? true : v;
        }
      }
    } catch {}
    return flags;
  }, []);

  const shouldSample = useCallback(() => {
    if (import.meta.env.DEV) return true;
    const now = Date.now();
    if (burstUntilRef.current > now) return true; // burst override
    if (!samplingEnabled) return false;
    return Math.random() < SAMPLE_RATE;
  }, [samplingEnabled]);

  const add = useCallback<DiagnosticsCtx["add"]>((e) => {
    const route = e.route ?? location.pathname;
    const now = Date.now();

    // Track errors for burst override window (even if unsampled)
    if (e.level === "error") {
      const arr = errorTimestampsRef.current;
      arr.push(now);
      while (arr.length && now - arr[0] > BURST_WINDOW_MS) arr.shift();
      if (arr.length >= BURST_ERR_THRESHOLD) {
        burstUntilRef.current = Math.max(burstUntilRef.current, now + BURST_DURATION_MS);
      }
    }

    if (!shouldSample()) return;
    const owner = resolveOwner(route, e.source);

    const event: DiagEvent = {
      ts: now,
      level: e.level,
      route,
      source: e.source,
      message: redactStr(e.message) || "(no-message)",
      details: redactStr(e.details),
      flags: {
        ...(e.flags || {}),
        diagnosticsEnabled: samplingEnabled,
        burstActive: now < burstUntilRef.current,
        dev: !!import.meta.env.DEV,
        featureFlags: getFlagsSnapshot(),
      },
      owner,
      traceId: traceIdRef.current,
    };

    // Dedupe key
    const key = `${event.level}|${event.route}|${event.source}|${event.message}`;
    const prev = groupedRef.current.get(key);
    if (prev && now - prev.ts <= DEDUPE_WINDOW_MS) {
      const updated = { ...prev, ts: now, count: (prev.count || 1) + 1 };
      groupedRef.current.set(key, updated);
      setGroupedSnap(Array.from(groupedRef.current.values()).sort((a, b) => (b.count || 1) - (a.count || 1)));
    } else {
      const first = { ...event, count: 1 };
      groupedRef.current.set(key, first);
      setGroupedSnap(Array.from(groupedRef.current.values()).sort((a, b) => (b.count || 1) - (a.count || 1)));
    }

    setEvents((prevList) => [event, ...prevList].slice(0, 1000)); // cap in-memory
  }, [location.pathname, shouldSample, samplingEnabled]);

  const clear = useCallback(() => {
    groupedRef.current.clear();
    setGroupedSnap([]);
    setEvents([]);
  }, []);

  // Dev-only console patch
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const origError = console.error.bind(console);
    const origWarn = console.warn.bind(console);

    console.error = (...args: any[]) => {
      origError(...args);
      add({ level: "error", source: "console", message: String(args[0]) });
    };
    console.warn = (...args: any[]) => {
      origWarn(...args);
      add({ level: "warn", source: "console", message: String(args[0]) });
    };

    return () => {
      console.error = origError;
      console.warn = origWarn;
    };
  }, [add]);

  // Window error hooks
  useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      add({ level: "error", source: "window.onerror", message: ev.message, details: ev.error?.stack });
    };
    const onRej = (ev: PromiseRejectionEvent) => {
      add({ level: "error", source: "unhandledrejection", message: String(ev.reason), details: String(ev.reason?.stack || ev.reason) });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, [add]);

  const value = useMemo<DiagnosticsCtx>(() => ({
    add,
    events,
    grouped: groupedSnap,
    clear,
    traceId: traceIdRef.current,
  }), [add, events, groupedSnap, clear]);

  return (
    <DiagnosticsContext.Provider value={value}>
      {children}
    </DiagnosticsContext.Provider>
  );
};

export function useDiagnostics() {
  const ctx = useContext(DiagnosticsContext);
  if (!ctx) throw new Error("useDiagnostics must be used within DiagnosticsProvider");
  return ctx;
}

// Minimal fetch wrapper (optional; not wired globally yet)
export async function safeFetch(input: RequestInfo, init?: RequestInit) {
  try {
    const res = await fetch(input, init);
    if (!res.ok) {
      // Lazy import to avoid circulars
      // Cannot use hook here; instead log via console in dev which is patched
      console.error(`HTTP ${res.status} ${res.statusText} ${redactUrl(String(input))}`);
    }
    return res;
  } catch (e: any) {
    console.error(`network-failure ${redactUrl(String(input))}: ${redactStr(e?.message)}`);
    throw e;
  }
}
