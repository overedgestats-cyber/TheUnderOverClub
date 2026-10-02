const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(path, extra = '') {
  const source = fs.readFileSync(path, 'utf8') + extra;
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: () => ({}), console, Set, Map, Date, Intl });
  return exports;
}
const { settleSelection, unitProfitForResult } = load('src/lib/settlement/settle-pick.ts');
for (const [market, selection, h, a, expected] of [
  ['ou25','over_2_5',2,1,'won'], ['ou25','under_2_5',1,1,'won'],
  ['ou25','over_2_5',1,1,'lost'], ['btts','yes',0,3,'lost'],
  ['btts','no',0,0,'won'], ['one_x_two','draw',2,2,'won'],
  ['one_x_two','home',1,2,'lost'], ['double_chance','1x',1,1,'won'],
  ['double_chance','12',1,1,'lost'], ['double_chance','x2',0,1,'won'],
]) assert.equal(settleSelection({market, selection, homeScore:h, awayScore:a}), expected);
assert.equal(unitProfitForResult({result:'won',odds:1.8}),0.8);
assert.equal(unitProfitForResult({result:'lost',odds:1.8}),-1);
assert.equal(unitProfitForResult({result:'won',odds:null}),null);
const { finalNinetyMinuteScore } = load('src/lib/free-picks/free-picks-settlement.ts', '\nexport { finalNinetyMinuteScore };');
const { finalScoreFromApi } = load('src/lib/settlement/settle-paid-analysis.ts', '\nexport { finalScoreFromApi };');
for (const score of [finalNinetyMinuteScore, finalScoreFromApi]) {
  for (const status of ['AET','PEN']) {
    assert.equal(score({fixture:{status:{short:status}},goals:{home:3,away:2}}), null);
    assert.equal(score({fixture:{status:{short:status}},goals:{home:3,away:2},score:{fulltime:{home:1,away:1}}}).home, 1);
  }
  assert.equal(score({fixture:{status:{short:'2H'}},goals:{home:3,away:2}}),null);
  assert.equal(score({fixture:{status:{short:'FT'}},goals:{home:2,away:0}}).home,2);
}
const { summarizePerformance } = load('src/lib/statistics/helpers.ts');
const summary = summarizePerformance([
 {odds:2, result_status:'won',unit_profit:1,published_at:'2026-09-01'},
 {odds:2, result_status:'lost',unit_profit:-1,published_at:'2026-09-02'},
 {odds:3, result_status:'pending',unit_profit:null,published_at:'2026-09-03'},
]);
assert.equal(summary.winRatePct,50); assert.equal(summary.roiPct,0); assert.equal(summary.pendingPicks,1);
console.log('Passed: four markets, unit profit, 90-minute scores, extra-time exclusions and pending-statistics exclusions.');
