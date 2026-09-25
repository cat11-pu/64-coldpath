// tier.js：分层决策
// 访问次数不低于 hotThreshold 的达标数据按次数降序（同次数按编号升序）排序，
// 取前 capacity 个留热层，其余（连同未达标数据）进冷层。
// 单次内置排序完成，时间复杂度 O(n log n)，不做两两比较的 O(n^2) 扫描。
function compareId(a, b) {
  // 编号升序：数字段按数值比较，其余按字符比较（d2 < d10）。
  const pa = String(a).split(/(\d+)/);
  const pb = String(b).split(/(\d+)/);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    if (pa[i] === pb[i]) { continue; }
    if (pa[i] === undefined) { return -1; }
    if (pb[i] === undefined) { return 1; }
    const na = Number(pa[i]);
    const nb = Number(pb[i]);
    const numeric = pa[i] !== "" && pb[i] !== "" && Number.isFinite(na) && Number.isFinite(nb);
    if (numeric && na !== nb) { return na - nb; }
    if (pa[i] < pb[i]) { return -1; }
    return 1;
  }
  return 0;
}

export function decide(entries, hotThreshold, capacity) {
  const ordered = entries.slice().sort((a, b) => {
    if (b.hits !== a.hits) { return b.hits - a.hits; }
    return compareId(a.id, b.id);
  });

  const layerOf = new Map();
  let hotSlots = 0;
  for (const entry of ordered) {
    if (entry.hits >= hotThreshold && hotSlots < capacity) {
      layerOf.set(entry.id, "hot");
      hotSlots += 1;
    } else {
      layerOf.set(entry.id, "cold");
    }
  }

  return {
    capacity,
    plan: ordered.map((entry) => [entry.id, layerOf.get(entry.id)]),
    moves: ordered.map((entry) => entry.id + ":" + layerOf.get(entry.id)),
  };
}
