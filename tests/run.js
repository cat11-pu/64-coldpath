import assert from "node:assert";
import { decide } from "../tier.js";
import { run } from "../move.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

const entries = [{ id: "d0", hits: 9 }];

check("decide returns plan", () => {
  assert.ok(Array.isArray(decide(entries, 5, 1).plan));
});

check("decide returns moves", () => {
  assert.ok(Array.isArray(decide(entries, 5, 1).moves));
});

check("run reports skipped", () => {
  assert.strictEqual(typeof run({ moves: [] }, [], []).skipped, "number");
});

check("run reports results", () => {
  assert.ok(Array.isArray(run({ moves: [] }, [], []).results));
});

check("render exposes consistent flag", () => {
  assert.strictEqual(typeof render({ entries: entries, hot_threshold: 5, capacity: 1, reads: [] }).consistent, "boolean");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
