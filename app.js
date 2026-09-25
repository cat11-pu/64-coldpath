// app.js：渲染结果（返回结构保持 plan/moves/applied/skipped/results/consistent 六键）
import { decide } from "./tier.js";
import { run } from "./move.js";

export function render(spec) {
  const planned = decide(spec.entries, spec.hot_threshold, spec.capacity);
  const done = run(planned, spec.done_moves || [], spec.reads || []);
  const consistent = done.results.every((result) => result != null);
  return { plan: planned.plan, moves: planned.moves, applied: done.applied,
           skipped: done.skipped, results: done.results, consistent };
}
