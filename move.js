// move.js：迁移执行
// done 里已完成的迁移跳过（幂等）；迁移中的数据仍可读，results 不为空。
export function run(plan, done, reads) {
  const finished = new Set(done);
  const applied = [];
  let skipped = 0;
  for (const move of plan.moves) {
    if (finished.has(move)) skipped += 1;
    else applied.push(move);
  }
  const known = new Set((plan.plan || []).map(([id]) => id));
  const results = reads.map((read) => (known.has(read.id) ? read.id : null));
  return { applied, skipped, results };
}
