// move.js：迁移执行
// - done 里的迁移跳过（幂等），其余逐条执行；
// - 热层满了仍有数据要进热层时报 E_TIER_FULL，不静默硬塞；
// - 迁移清单里的数据在迁移期间也必须读得到（results 不出现空）。
export function run(plan, done, reads) {
  const moves = plan.moves || [];
  const doneSet = new Set(done || []);
  const capacity = plan.capacity;

  // 当前占位：迁移清单里每条都给出目标层，已完成的迁移先计入当前状态。
  const targetLayer = new Map();
  for (const move of moves) {
    const at = move.lastIndexOf(":");
    targetLayer.set(move.slice(0, at), move.slice(at + 1));
  }
  let hotUsed = 0;
  for (const move of doneSet) {
    const at = move.lastIndexOf(":");
    if (move.slice(at + 1) === "hot" && targetLayer.has(move.slice(0, at))) {
      hotUsed += 1;
    }
  }

  const applied = [];
  let skipped = 0;
  for (const move of moves) {
    if (doneSet.has(move)) {
      skipped += 1;
      continue;
    }
    const at = move.lastIndexOf(":");
    const layer = move.slice(at + 1);
    if (layer === "hot") {
      if (capacity !== undefined && hotUsed >= capacity) {
        const error = new Error("hot tier is full: " + move);
        error.code = "E_TIER_FULL";
        throw error;
      }
      hotUsed += 1;
    }
    applied.push(move);
  }

  // 迁移期间读一致：数据始终能在迁移清单的目标布局里定位到，读出编号本身。
  const results = (reads || []).map((read) => {
    const id = typeof read === "string" ? read : read && read.id;
    return targetLayer.has(id) ? id : null;
  });

  return { applied, skipped, results };
}
