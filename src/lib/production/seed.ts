import type { AppState, ProductionEntry, ProductionJob } from "./types";
import { todayId } from "./format";

const uid = () => Math.random().toString(36).slice(2, 10);

interface SeedSpec {
  line: number;
  bag: string;
  supervisor: string;
  required: number;
  current: number;
}

const SPECS: SeedSpec[] = [
  { line: 1, bag: "شنطة مدارس", supervisor: "أحمد", required: 800, current: 800 },
  { line: 1, bag: "شنطة سفر", supervisor: "أحمد", required: 1000, current: 650 },
  { line: 1, bag: "شنطة جيش", supervisor: "محمد", required: 800, current: 400 },
  { line: 1, bag: "شنطة تمرين", supervisor: "علي", required: 500, current: 300 },
  { line: 2, bag: "شنطة مدارس", supervisor: "محمد", required: 1000, current: 1000 },
  { line: 2, bag: "شنطة تمرين", supervisor: "محمود", required: 500, current: 350 },
  { line: 3, bag: "شنطة سفر", supervisor: "علي", required: 800, current: 578 },
  { line: 3, bag: "شنطة مدارس", supervisor: "علي", required: 800, current: 450 },
  { line: 3, bag: "شنطة جيش", supervisor: "محمود", required: 1000, current: 700 },
  { line: 4, bag: "شنطة مدارس", supervisor: "محمود", required: 800, current: 800 },
  { line: 4, bag: "شنطة سفر", supervisor: "أحمد", required: 800, current: 600 },
  { line: 4, bag: "شنطة تمرين", supervisor: "محمد", required: 500, current: 250 },
  { line: 4, bag: "شنطة جيش", supervisor: "علي", required: 800, current: 400 },
];

function splitQuantity(total: number): number[] {
  const chunks: number[] = [];
  let left = total;
  const options = [100, 75, 50, 25];
  while (left > 0) {
    const pick = options.find((o) => o <= left) ?? left;
    chunks.push(pick);
    left -= pick;
  }
  return chunks;
}

export function createSeedState(): AppState {
  const supervisors = ["أحمد", "محمد", "علي", "محمود"].map((name) => ({ id: uid(), name }));
  const bagTypes = ["شنطة مدارس", "شنطة سفر", "شنطة تمرين", "شنطة جيش"].map((name) => ({
    id: uid(),
    name,
  }));

  const dayId = todayId();
  const base = new Date();
  base.setHours(8, 0, 0, 0);
  const start = base.getTime();

  const jobs: ProductionJob[] = SPECS.map((spec, index) => {
    const jobId = uid();
    const chunks = splitQuantity(spec.current);
    const createdAt = start + index * 4 * 60 * 1000;
    const entries: ProductionEntry[] = chunks.map((quantity, i) => ({
      id: uid(),
      jobId,
      quantity,
      timestamp: createdAt + (i + 1) * 22 * 60 * 1000,
    }));
    const completed = spec.current >= spec.required;
    return {
      id: jobId,
      dayId,
      lineId: spec.line,
      supervisorId: supervisors.find((s) => s.name === spec.supervisor)?.id ?? null,
      supervisorNameSnapshot: spec.supervisor,
      bagTypeId: bagTypes.find((b) => b.name === spec.bag)?.id ?? null,
      bagTypeNameSnapshot: spec.bag,
      requiredQuantity: spec.required,
      createdAt,
      completedAt: completed ? (entries[entries.length - 1]?.timestamp ?? createdAt) : null,
      entries,
    };
  });

  return { supervisors, bagTypes, quickAdds: [10, 25, 50, 100], jobs };
}
