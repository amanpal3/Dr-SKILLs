/**
 * validators.test.js
 * Automated tests for manifest, MCP configuration, and file integrity validators.
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { validateManifest } = require('../../security/validators/manifest-validator');
const { validateMcpConfig } = require('../../security/validators/mcp-validator');
const { computeIntegrity, verifyIntegrity } = require('../../security/scanners/file-integrity');

test('validateManifest rejects missing file and malformed JSON', () => {
  const missingRes = validateManifest('/nonexistent/manifest.json');
  assert.equal(missingRes.valid, false);

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-val-'));
  const badJsonFile = path.join(tmpDir, 'manifest.json');
  fs.writeFileSync(badJsonFile, '{ invalid json', 'utf8');

  const malformedRes = validateManifest(badJsonFile, tmpDir);
  assert.equal(malformedRes.valid, false);
  assert.match(malformedRes.errors[0], /Failed to parse manifest/i);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('validateManifest passes on current repository manifest', () => {
  const repoRoot = path.resolve(__dirname, '../..');
  const res = validateManifest(path.join(repoRoot, 'manifest.json'), repoRoot);
  assert.equal(res.valid, true, `Validation errors: ${res.errors.join('; ')}`);
  assert.equal(res.stats.declaredSkills, 54);
  assert.equal(res.stats.declaredPlugins, 6);
});

test('validateManifest fails on count mismatch, duplicate skills, undeclared filesystem skills, and invalid frontmatter', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'manifest-strict-'));
  const skillsDir = path.join(tmpDir, '.agent', 'skills');
  fs.mkdirSync(path.join(skillsDir, 'test-skill-a'), { recursive: true });
  fs.mkdirSync(path.join(skillsDir, 'test-skill-b'), { recursive: true });
  fs.mkdirSync(path.join(skillsDir, 'test-skill-c'), { recursive: true }); // Will be unregistered

  // Skill A: valid SKILL.md
  fs.writeFileSync(path.join(skillsDir, 'test-skill-a', 'SKILL.md'), '---\nname: test-skill-a\ndescription: Test description\n---\n# Doc', 'utf8');

  // Skill B: invalid frontmatter (missing description)
  fs.writeFileSync(path.join(skillsDir, 'test-skill-b', 'SKILL.md'), '---\nname: test-skill-b\n---\n# Doc', 'utf8');

  // Manifest with count mismatch and duplicate
  const testManifest = {
    name: 'test-ecosystem',
    version: '1.0.0',
    skills_count: 5, // Mismatch (should be 2)
    skills: ['test-skill-a', 'test-skill-b', 'test-skill-a'] // Duplicate test-skill-a, test-skill-c unregistered
  };

  const manifestFile = path.join(tmpDir, 'manifest.json');
  fs.writeFileSync(manifestFile, JSON.stringify(testManifest, null, 2), 'utf8');

  const res = validateManifest(manifestFile, tmpDir);
  assert.equal(res.valid, false);
  assert.ok(res.errors.some(e => e.includes('does not match skills array length')));
  assert.ok(res.errors.some(e => e.includes('Duplicate skill entry in manifest: "test-skill-a"')));
  assert.ok(res.errors.some(e => e.includes('lacks a non-empty "description" field')));
  assert.ok(res.errors.some(e => e.includes('Undeclared skill: Filesystem directory ".agent/skills/test-skill-c"')));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('validateMcpConfig flags dangerous commands and missing transport', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mcp-val-'));
  const testMcp = path.join(tmpDir, 'mcp.json');

  // Config with missing command and dangerous syntax
  const badConfig = {
    mcpServers: {
      "unknown-server": {
        description: "An unknown server"
      },
      "injected-server": {
        command: "rm -rf /",
        args: []
      },
      "ssrf-server": {
        serverUrl: "http://169.254.169.254/latest/meta-data"
      },
      "internal-server": {
        serverUrl: "https://127.0.0.1:8080/mcp"
      }
    }
  };

  fs.writeFileSync(testMcp, JSON.stringify(badConfig, null, 2), 'utf8');
  const res = validateMcpConfig(testMcp);

  assert.equal(res.valid, false);
  assert.ok(res.errors.some(e => e.includes('missing both executable')));
  assert.ok(res.errors.some(e => e.includes('potentially dangerous command syntax')));
  assert.ok(res.errors.some(e => e.includes('insecure protocol')));
  assert.ok(res.errors.some(e => e.includes('targets internal/private/loopback address')));
  assert.ok(res.warnings.some(w => w.includes('Unrecognized or untrusted')));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('validateMcpConfig passes on repository mcp.json', () => {
  const repoRoot = path.resolve(__dirname, '../..');
  const mcpFile = path.join(repoRoot, 'mcp.json');
  const res = validateMcpConfig(mcpFile);
  assert.equal(res.valid, true, `MCP validation errors: ${res.errors.join('; ')}`);
  assert.equal(res.serverCount, 7);
});

test('computeIntegrity and verifyIntegrity detect tampered files', () => {
  const repoRoot = path.resolve(__dirname, '../..');
  const ledger = computeIntegrity(repoRoot);
  assert.ok(Object.keys(ledger).length >= 54);

  const check = verifyIntegrity(repoRoot, ledger);
  assert.equal(check.passed, true);
  assert.equal(check.mismatches.length, 0);

  // Tampering test with fake ledger
  const tamperedLedger = { ...ledger, 'manifest.json': '00000000000000000000000000000000' };
  const tamperedCheck = verifyIntegrity(repoRoot, tamperedLedger);
  assert.equal(tamperedCheck.passed, false);
  assert.ok(tamperedCheck.mismatches.includes('manifest.json'));

  // Test package integrity verification with valid rootHash
  const { verifyPackageIntegrity } = require('../../security/scanners/file-integrity');
  const pkgCheck = verifyPackageIntegrity(repoRoot);
  assert.equal(pkgCheck.passed, true);
  assert.ok(pkgCheck.verifiedCount >= 54);
});

test('Package integrity: integrity.json matches current tracked files and root hash is correct', () => {
  const repoRoot = path.resolve(__dirname, '../..');
  const manifestPath = path.join(repoRoot, 'integrity.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // 1. Verify integrity.json matches current tracked files
  const { verifyPackageIntegrity, computeRootHash, computeIntegrity } = require('../../security/scanners/file-integrity');
  const pkgCheck = verifyPackageIntegrity(repoRoot);

  assert.equal(pkgCheck.passed, true, `Integrity mismatches: ${pkgCheck.mismatches.join(', ')} | Missing: ${pkgCheck.missing.join(', ')}`);
  assert.equal(pkgCheck.mismatches.length, 0);
  assert.equal(pkgCheck.missing.length, 0);
  assert.equal(pkgCheck.verifiedCount, 76);

  // 2. Verify root hash is correct against both expected manifest files and computed live ledger
  const computedRootFromManifest = computeRootHash(manifest.files);
  assert.equal(manifest.rootHash, computedRootFromManifest, 'manifest.rootHash must match computeRootHash(manifest.files)');

  const liveLedger = computeIntegrity(repoRoot);
  const liveRoot = computeRootHash(liveLedger);
  assert.equal(manifest.rootHash, liveRoot, 'manifest.rootHash must match live computed ledger root hash');
});

test('Package integrity: doctor exits successfully in a clean checkout', () => {
  const { execFileSync } = require('child_process');
  const cliPath = path.resolve(__dirname, '../../bin/ai-ecosystem.js');
  const output = execFileSync(process.execPath, [cliPath, 'doctor'], { encoding: 'utf8' });

  assert.match(output, /\[PASS\] Package Integrity: 76 critical governance files verified/);
  assert.match(output, /Overall Status: HEALTHY/);
});

test('Package integrity: a deliberately modified protected file causes doctor and integrity verification to fail', () => {
  const { execFileSync } = require('child_process');
  const { verifyPackageIntegrity } = require('../../security/scanners/file-integrity');
  const repoRoot = path.resolve(__dirname, '../..');
  const cliPath = path.resolve(__dirname, '../../bin/ai-ecosystem.js');

  // Create an isolated workspace replica to prevent parallel test worker contamination
  const tmpRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'isolated-integrity-tamper-'));

  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'integrity.json'), 'utf8'));

    // Populate isolated workspace with all manifest-protected files
    for (const relPath of Object.keys(manifest.files)) {
      const src = path.join(repoRoot, relPath);
      const dest = path.join(tmpRepo, relPath);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(src, dest);
    }
    fs.copyFileSync(path.join(repoRoot, 'integrity.json'), path.join(tmpRepo, 'integrity.json'));

    // Verify baseline passes in isolated repo
    const baselineCheck = verifyPackageIntegrity(tmpRepo);
    assert.equal(baselineCheck.passed, true);

    // Deliberately modify a protected file in the isolated repo
    const targetFile = path.join(tmpRepo, 'backend.md');
    fs.appendFileSync(targetFile, '\n<!-- tamper probe: backdoor inserted -->\n');

    // 1. Verify verifyPackageIntegrity detects tampering
    const res = verifyPackageIntegrity(tmpRepo);
    assert.equal(res.passed, false, 'verifyPackageIntegrity must fail on tampered file');
    assert.ok(res.mismatches.includes('backend.md'), 'mismatches must identify backend.md');

    // 2. Verify doctor exits with failure (exit code 1) when pointed to tampered workspace
    let doctorThrew = false;
    try {
      execFileSync(process.execPath, [cliPath, 'doctor'], {
        env: { ...process.env, AI_ECOSYSTEM_REPO_ROOT: tmpRepo },
        encoding: 'utf8',
        stdio: 'pipe'
      });
    } catch (err) {
      doctorThrew = true;
      assert.equal(err.status, 1, 'Doctor must exit with status code 1 on integrity failure');
      assert.match(err.stdout, /\[FAIL\] Package Integrity: Verification failed against integrity manifest!/);
      assert.match(err.stdout, /backend\.md/);
    }
    assert.equal(doctorThrew, true, 'Doctor command must throw/fail when a protected file is modified');
  } finally {
    fs.rmSync(tmpRepo, { recursive: true, force: true });
  }
});

test('Self-validating catalog gate verifies 100% sync across filesystem, manifest, and docs', () => {
  const { execFileSync } = require('child_process');
  const syncScript = path.resolve(__dirname, '../../scripts/sync-catalog.js');
  const output = execFileSync(process.execPath, [syncScript, '--check'], { encoding: 'utf8' });

  assert.match(output, /All 54 skills are 100% synchronized/);
  assert.match(output, /Frontmatter metadata, unique names, and directory mappings strictly verified/);
});
