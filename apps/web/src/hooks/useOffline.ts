import { useState, useEffect, useCallback, useRef } from "react";

export interface PendingMutation {
  id: string;
  type: "create_task" | "update_task" | "delete_task" | "create_comment" | "move_task";
  data: unknown;
  timestamp: number;
  retries: number;
}

const STORAGE_KEY = "teamboards_pending_mutations";
const MAX_RETRIES = 5;

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingMutations, setPendingMutations] = useState<PendingMutation[]>([]);
  const processingRef = useRef(false);

  // Load pending mutations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const mutations = JSON.parse(stored) as PendingMutation[];
        setPendingMutations(mutations);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save pending mutations to localStorage whenever they change
  useEffect(() => {
    if (pendingMutations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pendingMutations));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [pendingMutations]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Add a mutation to the queue
  const queueMutation = useCallback((mutation: Omit<PendingMutation, "id" | "timestamp" | "retries">) => {
    const newMutation: PendingMutation = {
      ...mutation,
      id: `mutation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retries: 0,
    };
    setPendingMutations((prev) => [...prev, newMutation]);
    return newMutation.id;
  }, []);

  // Remove a mutation from the queue
  const removeMutation = useCallback((id: string) => {
    setPendingMutations((prev) => prev.filter((m) => m.id !== id));
  }, []);

  // Increment retry count for a mutation
  const incrementRetry = useCallback((id: string) => {
    setPendingMutations((prev) =>
      prev.map((m) => (m.id === id ? { ...m, retries: m.retries + 1 } : m))
    );
  }, []);

  // Process pending mutations when online
  const processMutations = useCallback(
    async (executor: (mutation: PendingMutation) => Promise<void>) => {
      if (!isOnline || processingRef.current || pendingMutations.length === 0) {
        return;
      }

      processingRef.current = true;

      for (const mutation of pendingMutations) {
        if (mutation.retries >= MAX_RETRIES) {
          // Give up after max retries
          removeMutation(mutation.id);
          console.error(`Giving up on mutation ${mutation.id} after ${MAX_RETRIES} retries`);
          continue;
        }

        try {
          await executor(mutation);
          removeMutation(mutation.id);
        } catch (error) {
          console.error(`Failed to process mutation ${mutation.id}:`, error);
          incrementRetry(mutation.id);
          // If still offline, stop processing
          if (!navigator.onLine) {
            break;
          }
        }
      }

      processingRef.current = false;
    },
    [isOnline, pendingMutations, removeMutation, incrementRetry]
  );

  // Clear all pending mutations
  const clearMutations = useCallback(() => {
    setPendingMutations([]);
  }, []);

  return {
    isOnline,
    pendingMutations,
    hasPendingMutations: pendingMutations.length > 0,
    queueMutation,
    removeMutation,
    processMutations,
    clearMutations,
  };
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}
