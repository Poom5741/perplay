// e2e-report.mjs — headless runner/reporter for the e2e suite.
// Runs `node scripts/e2e.mjs`, captures its output, and parses the FINAL JSON
// blob (the authoritative result — the e2e script's process exit code is
// unreliable in some environments). Prints a per-check table + duration vs
// the ≤30s-per-play target (issue #23). Zero dependencies.
// Usage: node scripts/e2e-report.mjs   (env: E2E_PORT to override port, default 3001)
import { spawn } from 'node:child_process';

const child = spawn('node', ['scripts/e2e.mjs'], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
let out = '';
child.stdout.on('data', d => { out += d; process.stdout.write(d); });
child.stderr.on('data', d => { out += d; process.stderr.write(d); });
child.on('exit', () => {
  // The final JSON blob is the last {...} block containing "checks"
  const m = out.match(/\{\s*"pass"[\s\S]*\}$/m) || out.match(/\{\s*"pass"[\s\S]*"checks"[\s\S]*\}/);
  if (!m) {
    console.error('\n[e2e-report] FAILED to parse final JSON from e2e output — treating run as failed.');
    process.exit(2);
  }
  let j;
  try { j = JSON.parse(m[0]); } catch (e) {
    console.error(`\n[e2e-report] JSON parse error: ${e.message}`);
    process.exit(2);
  }

  console.log('\n==== PER-CHECK TABLE (parsed from JSON, not exit code) ====');
  console.log('RESULT      CHECK                                DETAIL');
  console.log('----------  -----------------------------------  --------------------------------------------------');
  for (const c of j.checks) {
    console.log(`${(c.pass ? 'PASS' : 'FAIL').padEnd(10)}  ${c.name.padEnd(35)}  ${String(c.detail ?? '').slice(0, 50)}`);
  }
  const passed = j.checks.filter(c => c.pass).length;
  console.log(`\n${passed}/${j.checks.length} checks passed · suite duration ${j.suiteDurationSec}s · per-play target ≤${j.targetSecPerPlay}s`);
  console.log(`chain enabled: ${j.chainEnabled} · mode e2e: setlist=${j.e2e.setlist ?? 'n/a'}s, acr=${j.e2e.acr ?? 'n/a'}s`);
  if (!j.chainEnabled) {
    console.log('\nNOTE: chain DISABLED — the 6 chain-related checks (chain configured, wallet funded,');
    console.log('A3/B2 anchored, A4/B3/D5 timing) are EXPECTED to fail in this mode. See e2e-runbook.md');
    console.log('for the poc/.env setup needed to clear them.');
  }
  const playTimesOk = (j.e2e.setlist ?? Infinity) <= j.targetSecPerPlay && (j.e2e.acr ?? Infinity) <= j.targetSecPerPlay;
  console.log(`\nHYPOTHESIS #1 (≤${j.targetSecPerPlay}s/play): ${playTimesOk ? 'MEASURED PASS' : 'NOT PROVEN (chain required / timing over target)'}`);
  process.exit(j.pass ? 0 : 1);
});
