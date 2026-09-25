// app.js：渲染结果
import { decide } from "./tier.js";
import { run } from "./move.js";

export function render(spec) {
  const planned = decide(spec.entries, spec.hot_threshold, spec.capacity);
  const done = run(planned, spec.done_moves || [], spec.reads || []);
  return { plan: planned.plan, moves: planned.moves, applied: done.applied,
           skipped: done.skipped, results: done.results,
           consistent: done.results.every((result) => result !== null && result !== undefined) };
}
