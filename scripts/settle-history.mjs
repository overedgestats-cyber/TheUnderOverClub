// Run from the project root. Secrets stay in your local environment.
import nextEnv from '@next/env';
import { writeFileSync } from 'node:fs';
nextEnv.loadEnvConfig(process.cwd());
const args = process.argv.slice(2);
const value = (name, fallback) => { const i = args.indexOf(name); return i < 0 ? fallback : args[i + 1]; };
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Sofia', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const from = value('--from', '2026-08-01');
const to = value('--to', today);
const commit = args.includes('--commit');
const valid = d => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)) && new Date(d).toISOString().slice(0, 10) === d;
if (!valid(from) || !valid(to) || from > to || to > today) throw new Error('Use valid --from and --to dates in YYYY-MM-DD format, ending no later than today.');
const secret = process.env.INTERNAL_API_SECRET?.trim();
if (!secret) throw new Error('INTERNAL_API_SECRET is missing from your local .env.local. Do not paste it into chat.');
const report = [];
async function run(tier, date, save) {
  const response = await fetch(`https://www.theunderoverclub.com/api/admin/settle-${tier === 'paid' ? 'paid-analysis' : 'free-picks'}`, {
    method: 'POST', redirect: 'error', signal: AbortSignal.timeout(310000),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` },
    body: JSON.stringify({ date, commit: save }),
  });
  if (!response.ok) throw new Error(`${tier} ${date}: HTTP ${response.status}. Check the Vercel settlement logs.`);
  const result = await response.json();
  if (!result.ok) throw new Error(`${tier} ${date}: settlement reported failure. Check Vercel logs.`);
  return result;
}
try {
  for (let date = from; date <= to; date = new Date(Date.parse(date) + 86400000).toISOString().slice(0, 10)) {
    for (const tier of ['paid', 'free']) {
      let result = await run(tier, date, false);
      const count = tier === 'paid' ? result.officialSettlements + result.trackingSettlements : result.settlementCount;
      if (commit && count > 0) result = await run(tier, date, true);
      const summary = { date, tier, mode: commit ? 'commit' : 'dry-run', settled: tier === 'paid' ? result.officialSettlements : result.settlementCount, pendingFixtures: result.fixturesNotFinal ?? null };
      report.push(summary); console.log(JSON.stringify(summary));
    }
  }
} finally {
  writeFileSync(`settlement-${commit ? 'commit' : 'preview'}-report.json`, JSON.stringify(report, null, 2));
}
