#!/usr/bin/env node
/**
 * Cross-platform test runner for Dr-SKILLs security test suite.
 * Resolves test files dynamically and passes explicit file paths to `node --test`
 * to bypass Windows cmd.exe wildcard limitations on Node 18 and Node 20.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const testsDir = path.join(repoRoot, 'tests', 'security');

if (!fs.existsSync(testsDir)) {
  console.error(`Tests directory not found: ${testsDir}`);
  process.exit(1);
}

const testFiles = fs.readdirSync(testsDir)
  .filter(f => f.endsWith('.test.js'))
  .sort()
  .map(f => path.join('tests', 'security', f));

if (testFiles.length === 0) {
  console.error('No test files found in tests/security');
  process.exit(1);
}

const result = spawnSync(process.execPath, ['--test', ...testFiles], {
  cwd: repoRoot,
  stdio: 'inherit',
  env: process.env
});

process.exit(result.status !== null ? result.status : (result.error ? 1 : 0));
