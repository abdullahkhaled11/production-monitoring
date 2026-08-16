import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AppState, ID, ProductionJob } from "./types";
import { jobCurrent } from "./types";
import { createSeedState } from "./seed";
import { todayId } from "./format";

const STORAGE_KEY = "bag-factory-production-v1";

const uid = () => Math.random().toString(36).slice(2, 10);

const EMPTY: AppState = { supervisors: [], bagTypes: [], quickAdds: [10, 25, 50, 100], jobs: [] };

interface StoreValue {
  state: AppState;
  ready: boolean;
  addSupervisor: (name: string) => ID | null;
  updateSupervisor: (id: ID, name: string) => void;
  removeSupervisor: (id: ID) => void;
  addBagType: (name: string) => ID | null;
  updateBagType: (id: ID, name: string) => void;
  removeBagType: (id: ID) => void;
  setQuickAdds: (values: number[]) => void;
  addJob: (input: {
    lineId: number;
    supervisorId: ID;
    bagTypeId: ID;
    requiredQuantity: number;
  }) => void;
  addEntry: (jobId: ID, quantity: number) => ID | null;
  updateEntry: (jobId: ID, entryId: ID, quantity: number) => void;
  removeEntry: (jobId: ID, entryId: ID) => void;
  clearAll: () => void;
}

const StoreContext = createContext<StoreValue | null>(null);

function withRecalc(job: ProductionJob): ProductionJob {
  const current = jobCurrent(job);
  const completed = job.requiredQuantity > 0 && current >= job.requiredQuantity;
  const last = [...job.entries].sort((a, b) => a.timestamp - b.timestamp).at(-1);
  return {
    ...job,
    completedAt: completed ? (job.completedAt ?? last?.timestamp ?? Date.now()) : null,
  };
}

export function ProductionStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let next: AppState;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      next = raw ? (JSON.parse(raw) as AppState) : createSeedState();
    } catch {
      next = createSeedState();
    }
    setState({ ...EMPTY, ...next });
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const mutateJob = useCallback((jobId: ID, fn: (job: ProductionJob) => ProductionJob) => {
    setState((prev) => ({
      ...prev,
      jobs: prev.jobs.map((j) => (j.id === jobId ? withRecalc(fn(j)) : j)),
    }));
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      state,
      ready,
      addSupervisor: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return null;
        const id = uid();
        setState((prev) => ({ ...prev, supervisors: [...prev.supervisors, { id, name: trimmed }] }));
        return id;
      },
      updateSupervisor: (id, name) =>
        setState((prev) => ({
          ...prev,
          supervisors: prev.supervisors.map((s) => (s.id === id ? { ...s, name: name.trim() } : s)),
        })),
      removeSupervisor: (id) =>
        setState((prev) => ({ ...prev, supervisors: prev.supervisors.filter((s) => s.id !== id) })),
      addBagType: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return null;
        const id = uid();
        setState((prev) => ({ ...prev, bagTypes: [...prev.bagTypes, { id, name: trimmed }] }));
        return id;
      },
      updateBagType: (id, name) =>
        setState((prev) => ({
          ...prev,
          bagTypes: prev.bagTypes.map((b) => (b.id === id ? { ...b, name: name.trim() } : b)),
        })),
      removeBagType: (id) =>
        setState((prev) => ({ ...prev, bagTypes: prev.bagTypes.filter((b) => b.id !== id) })),
      setQuickAdds: (values) => setState((prev) => ({ ...prev, quickAdds: values })),
      addJob: ({ lineId, supervisorId, bagTypeId, requiredQuantity }) =>
        setState((prev) => {
          const supervisor = prev.supervisors.find((s) => s.id === supervisorId);
          const bag = prev.bagTypes.find((b) => b.id === bagTypeId);
          const job: ProductionJob = {
            id: uid(),
            dayId: todayId(),
            lineId,
            supervisorId,
            supervisorNameSnapshot: supervisor?.name ?? "غير محدد",
            bagTypeId,
            bagTypeNameSnapshot: bag?.name ?? "غير محدد",
            requiredQuantity,
            createdAt: Date.now(),
            completedAt: null,
            entries: [],
          };
          return { ...prev, jobs: [...prev.jobs, job] };
        }),
      addEntry: (jobId, quantity) => {
        if (quantity <= 0) return null;
        const entryId = uid();
        mutateJob(jobId, (job) => ({
          ...job,
          entries: [...job.entries, { id: entryId, jobId, quantity, timestamp: Date.now() }],
        }));
        return entryId;
      },
      updateEntry: (jobId, entryId, quantity) =>
        mutateJob(jobId, (job) => ({
          ...job,
          completedAt: null,
          entries: job.entries.map((e) => (e.id === entryId ? { ...e, quantity } : e)),
        })),
      removeEntry: (jobId, entryId) =>
        mutateJob(jobId, (job) => ({
          ...job,
          completedAt: null,
          entries: job.entries.filter((e) => e.id !== entryId),
        })),
      clearAll: () => setState({ ...EMPTY, quickAdds: [10, 25, 50, 100] }),
    }),
    [state, ready, mutateJob],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore يجب استخدامه داخل ProductionStoreProvider");
  return ctx;
}

export function useDayJobs(dayId: string) {
  const { state } = useStore();
  return useMemo(() => state.jobs.filter((j) => j.dayId === dayId), [state.jobs, dayId]);
}

export function lineTotal(jobs: ProductionJob[], lineId: number) {
  return jobs.filter((j) => j.lineId === lineId).reduce((sum, j) => sum + jobCurrent(j), 0);
}
