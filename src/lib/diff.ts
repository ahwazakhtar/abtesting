import { diffWords, Change } from "diff";
import { Stage, StageId, STAGE_ORDER } from "./types";

export interface StageDiff {
  id: StageId;
  changed: boolean;
  changes: Change[];
}

export function diffStages(a: Stage[], b: Stage[]): StageDiff[] {
  return STAGE_ORDER.map((id) => {
    const aContent = a.find((s) => s.id === id)?.content ?? "";
    const bContent = b.find((s) => s.id === id)?.content ?? "";
    const changes = diffWords(aContent, bContent);
    const changed = changes.some((c) => c.added || c.removed);
    return { id, changed, changes };
  });
}
