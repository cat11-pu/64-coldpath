// tier.js：分层决策
// 访问次数不低于阈值的按次数降序（同次数按编号升序）取前 capacity 个留热层，
// 其余进冷层；当前层与目标层不同的进 moves（形如 编号:目标层）。
// 达标数据超过热层容量时在结果上报 code: E_TIER_FULL，超出部分进冷层，不静默硬塞。
// 预算：一次排序，O(n log n)，不做两两比较。
export function decide(entries, hotThreshold, capacity) {
  const qualified = entries
    .filter((entry) => entry.hits >= hotThreshold)
    .sort((a, b) => (b.hits - a.hits) || String(a.id).localeCompare(String(b.id)));
  const hot = new Set(qualified.slice(0, capacity).map((entry) => entry.id));
  const plan = entries.map((entry) => [entry.id, hot.has(entry.id) ? "hot" : "cold"]);
  const moves = [];
  const byId = new Map(entries.map((entry) => [entry.id, entry]));
  for (const [id, target] of plan) {
    const entry = byId.get(id);
    if (entry.tier !== target) moves.push(id + ":" + target);
  }
  const result = { plan, moves };
  if (qualified.length > capacity) result.code = "E_TIER_FULL";
  return result;
}
