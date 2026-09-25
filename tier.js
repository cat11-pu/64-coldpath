// tier.js：分层决策（基线：全部留在热层）
export function decide(entries, hotThreshold, capacity) {
  return { plan: entries.map((entry) => [entry.id, "hot"]), moves: [] };
}
