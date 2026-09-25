// move.js：迁移执行（基线：立即搬、不判幂等）
export function run(plan, done, reads) {
  return { applied: plan.moves.slice(), skipped: 0, results: reads.map((read) => null) };
}
