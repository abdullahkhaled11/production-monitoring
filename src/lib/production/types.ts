export type ID = string;

export interface Supervisor {
  id: ID;
  name: string;
}

export interface BagType {
  id: ID;
  name: string;
}

export interface ProductionEntry {
  id: ID;
  jobId: ID;
  quantity: number;
  timestamp: number;
}

export interface ProductionJob {
  id: ID;
  dayId: string;
  lineId: number;
  supervisorId: ID | null;
  supervisorNameSnapshot: string;
  bagTypeId: ID | null;
  bagTypeNameSnapshot: string;
  requiredQuantity: number;
  createdAt: number;
  completedAt: number | null;
  entries: ProductionEntry[];
}

export interface AppState {
  supervisors: Supervisor[];
  bagTypes: BagType[];
  quickAdds: number[];
  jobs: ProductionJob[];
}

export const LINES = [1, 2, 3, 4] as const;

export type JobStatus = "not_started" | "in_progress" | "completed";

export const STATUS_LABEL: Record<JobStatus, string> = {
  not_started: "لم تبدأ",
  in_progress: "جاري العمل",
  completed: "مكتملة",
};

export function jobCurrent(job: ProductionJob) {
  return job.entries.reduce((s, e) => s + e.quantity, 0);
}

export function jobStatus(job: ProductionJob): JobStatus {
  const current = jobCurrent(job);
  if (current >= job.requiredQuantity && job.requiredQuantity > 0) return "completed";
  if (current > 0) return "in_progress";
  return "not_started";
}

export function jobRemaining(job: ProductionJob) {
  return Math.max(0, job.requiredQuantity - jobCurrent(job));
}

export function jobProgress(job: ProductionJob) {
  if (!job.requiredQuantity) return 0;
  return Math.min(100, Math.round((jobCurrent(job) / job.requiredQuantity) * 100));
}

export function sortedEntries(job: ProductionJob) {
  return [...job.entries].sort((a, b) => b.timestamp - a.timestamp);
}

/** الإجمالي الجاري بعد كل عملية (للسجل) */
export function entryRunningTotal(job: ProductionJob, entryId: ID) {
  const asc = [...job.entries].sort((a, b) => a.timestamp - b.timestamp);
  let total = 0;
  for (const e of asc) {
    total += e.quantity;
    if (e.id === entryId) break;
  }
  return total;
}
