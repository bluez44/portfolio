"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

const READY_TIMEOUT_MS = 8000;

/** Resources the graduation invitation waits for before revealing the page. */
export const GRADUATION_GATE_RESOURCES = {
  music: "music",
  map: "map",
  character: "character",
} as const;

type ResourceGateValue = {
  /** true while the overlay is still covering the page */
  pending: boolean;
  /** mark one awaited resource as loaded (or failed — either way it's done) */
  resolve: (id: string) => void;
};

const ResourceGateContext = createContext<ResourceGateValue | null>(null);

/** null outside a provider, so gated components also work on ungated pages. */
export const useResourceGate = () => useContext(ResourceGateContext);

/**
 * Holds a full-screen LoadingOverlay over `children` until every id in
 * `resources` has been resolved, with a hard timeout so a stuck resource
 * can never block the page forever.
 */
export function ResourceGateProvider({
  resources,
  children,
}: {
  resources: readonly string[];
  children: ReactNode;
}) {
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(() => new Set(resources));
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setTimedOut(true), READY_TIMEOUT_MS);
    return () => window.clearTimeout(t);
  }, []);

  const resolve = useCallback((id: string) => {
    setPendingIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const ready = timedOut || pendingIds.size === 0;
  const value = useMemo(() => ({ pending: !ready, resolve }), [ready, resolve]);

  return (
    <ResourceGateContext.Provider value={value}>
      {children}
      <LoadingOverlay ready={ready} />
    </ResourceGateContext.Provider>
  );
}
