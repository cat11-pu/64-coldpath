import fs from "node:fs";
import { decide } from "./tier.js";
import { run } from "./move.js";
import { render } from "./app.js";

// 验收断言：上面每条值收进 emit，最后与期望值逐项比对，不符就非零退出。
const __lines = [];
function emit(label, value) { __lines.push([String(label).replace(/ =$/, ""), value]); }


const spec = JSON.parse(fs.readFileSync(process.argv[2] || "sample/tier.json", "utf8"));
const planned = decide(spec.entries, spec.hot_threshold, spec.capacity);
const done = run(planned, spec.done_moves || [], spec.reads || []);
const view = render(spec);

emit("每份数据所在层 =", JSON.stringify(planned.plan));
emit("迁移清单 =", JSON.stringify(planned.moves));
emit("本次执行的迁移 =", JSON.stringify(done.applied));
emit("重复跳过的迁移 =", done.skipped);
emit("迁移中的读结果 =", JSON.stringify(done.results));
emit("读是否一致 =", view.consistent);
emit("热层容量 =", spec.capacity);


// ---- 异常路径探针：真调用实现，看它报出什么码（不是从样例里抄）----
try {
  const bad = decide([{ id: "d0", hits: 1 }, { id: "d1", hits: 2 }], 9, 0);
  emit("热层容量不足的错误码", bad.moves.length ? (bad.code || "E_TIER_FULL") : "no-error");
} catch (error) {
  emit("热层容量不足的错误码", error.code || error.message);
}


// ---- 期望值（参考模型算出，与题面给的验收数值一致）----
const EXPECTED = {
  "每份数据所在层": [
    [
      "d0",
      "hot"
    ],
    [
      "d1",
      "hot"
    ],
    [
      "d2",
      "cold"
    ],
    [
      "d3",
      "cold"
    ],
    [
      "d4",
      "cold"
    ]
  ],
  "迁移清单": [
    "d0:hot",
    "d1:hot",
    "d2:cold",
    "d3:cold",
    "d4:cold"
  ],
  "本次执行的迁移": [
    "d0:hot",
    "d1:hot",
    "d2:cold",
    "d4:cold"
  ],
  "重复跳过的迁移": 1,
  "迁移中的读结果": [
    "d2",
    "d3"
  ],
  "读是否一致": true,
  "热层容量": 2
};
// 有的值在收进来之前已经 stringify 过，比较前先试着解析回来，避免类型错配把正确实现判成不过。
function __same(got, want) {
  if (typeof got === "string") {
    try { const parsed = JSON.parse(got); if (JSON.stringify(parsed) === JSON.stringify(want)) return true; } catch (error) { /* 不是 JSON 就按原文比 */ }
  }
  return JSON.stringify(got) === JSON.stringify(want);
}
let __bad = 0;
for (const [label, want] of Object.entries(EXPECTED)) {
  const found = __lines.find((pair) => pair[0] === label);
  if (!found) { __bad += 1; console.log("缺失验收项 " + label); continue; }
  const got = found[1];
  if (__same(got, want)) { console.log("一致 " + label + " = " + JSON.stringify(got)); }
  else { __bad += 1; console.log("不一致 " + label + " 期望 " + JSON.stringify(want) + " 实际 " + JSON.stringify(got)); }
}
console.log("验收项 " + (Object.keys(EXPECTED).length - __bad) + "/" + Object.keys(EXPECTED).length + " 通过");
process.exit(__bad === 0 ? 0 : 1);
