#!/usr/bin/env node
/**
 * Portfolio Integrity, Brand System & Asset Validator
 * Runs locally and in GitHub Actions CI (.github/workflows/ci.yml)
 */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const ROOT = process.cwd();
const errors = [];
const checks = [];

function pass(label) {
  checks.push({ status: "PASS", label });
  console.log(`✓ ${label}`);
}

function fail(label, detail) {
  checks.push({ status: "FAIL", label, detail });
  errors.push(`${label}: ${detail}`);
  console.error(`✗ ${label} — ${detail}`);
}

function checkBinaryImage(relPath) {
  const full = path.join(ROOT, relPath);
  if (!fs.existsSync(full)) {
    fail(`Asset exists (${relPath})`, "File not found");
    return;
  }
  const buf = fs.readFileSync(full);
  if (buf.length < 200) {
    fail(`Asset size (${relPath})`, `Suspiciously small (${buf.length} bytes)`);
    return;
  }
  const ext = path.extname(relPath).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") {
    if (buf[0] !== 0xff || buf[1] !== 0xd8 || buf[2] !== 0xff) {
      fail(`JPEG header (${relPath})`, "Invalid JPEG magic bytes");
      return;
    }
  } else if (ext === ".png") {
    if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) {
      fail(`PNG header (${relPath})`, "Invalid PNG magic bytes");
      return;
    }
  }
  pass(`Verified binary asset: ${relPath} (${(buf.length / 1024).toFixed(1)} KB)`);
}

// 1. Validate index.html structure & SEO
const indexPath = path.join(ROOT, "index.html");
if (!fs.existsSync(indexPath)) {
  fail("index.html", "Missing root index.html");
} else {
  const html = fs.readFileSync(indexPath, "utf8");
  const h1Matches = html.match(/<h1[\s>]/gi) || [];
  if (h1Matches.length === 1) pass("SEO: Single <h1> heading in index.html");
  else fail("SEO <h1> count", `Expected 1 <h1>, found ${h1Matches.length}`);

  if (/<meta\s+name="description"\s+content="[^"]{40,}"/i.test(html)) {
    pass("SEO: Meta description present and descriptive");
  } else {
    fail("SEO: Meta description", "Missing or too short");
  }

  const requiredIds = [
    "kingfisher-atmosphere",
    "theme-toggle-btn",
    "cmd-palette",
    "home",
    "about",
    "orix-stage",
    "projects",
    "github-live-widget",
    "dokumentasi",
    "cv-database-panel",
    "skill",
    "connect"
  ];
  const missingIds = requiredIds.filter((id) => !html.includes(`id="${id}"`));
  if (missingIds.length === 0) {
    pass(`DOM Structure: All ${requiredIds.length} core sections & interactive widgets present`);
  } else {
    fail("DOM Structure", `Missing IDs: ${missingIds.join(", ")}`);
  }
}

// 2. Validate CSS Design System & Light/Dark Themes
const cssPath = path.join(ROOT, "assets/css/styles.css");
if (!fs.existsSync(cssPath)) {
  fail("styles.css", "Missing assets/css/styles.css");
} else {
  const css = fs.readFileSync(cssPath, "utf8").toLowerCase();
  if (css.includes('[data-theme="dark"]') && css.includes('[data-theme="light"]')) {
    pass("Theme System: Both [data-theme=\"dark\"] and [data-theme=\"light\"] token sets defined");
  } else {
    fail("Theme System", "Missing dark or light theme selector in styles.css");
  }

  const brandHexes = ["#041524", "#0a253d", "#0284c7", "#06b6d4", "#f97316", "#f8fafc", "#cbd5e1"];
  const missingHex = brandHexes.filter((h) => !css.includes(h));
  if (missingHex.length === 0) {
    pass("Brand Identity: All 7 official Kingfisher hex tokens present in CSS");
  } else {
    fail("Brand Identity Hex Tokens", `Missing: ${missingHex.join(", ")}`);
  }
}

// 3. Validate Portfolio JSON & JS Seed Synchronization
const jsonPath = path.join(ROOT, "data/portfolio.json");
const seedJsPath = path.join(ROOT, "assets/js/portfolio-data.js");

if (!fs.existsSync(jsonPath) || !fs.existsSync(seedJsPath)) {
  fail("Portfolio Data Files", "Missing data/portfolio.json or assets/js/portfolio-data.js");
} else {
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const seedCode = fs.readFileSync(seedJsPath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(seedCode, sandbox);

  if (JSON.stringify(jsonData) === JSON.stringify(sandbox.window.PORTFOLIO_DATA)) {
    pass("Data Sync: data/portfolio.json matches assets/js/portfolio-data.js 100%");
  } else {
    fail("Data Sync", "Mismatch between data/portfolio.json and assets/js/portfolio-data.js");
  }

  if (Array.isArray(jsonData.cvRecords) && jsonData.cvRecords.length >= 80) {
    pass(`Master CV Records: ${jsonData.cvRecords.length} verified entries loaded`);
  } else {
    fail("Master CV Records", "Expected at least 80 synced CV entries");
  }

  if (Array.isArray(jsonData.highlights) && jsonData.highlights.length >= 22) {
    pass(`Visual Highlights: ${jsonData.highlights.length} recap highlights loaded`);
  } else {
    fail("Visual Highlights", "Expected at least 22 synced recap highlights");
  }

  // Verify every local photo referenced in highlights
  for (const h of jsonData.highlights || []) {
    if (h.img && !/^https?:\/\//i.test(h.img)) {
      checkBinaryImage(h.img);
    }
  }
}

// 4. Verify Core Visual Brand Assets
checkBinaryImage("FotoProfile.png");
checkBinaryImage("Maskot_Orix.jpeg");
checkBinaryImage("assets/logo-kingfisher.png");
if (fs.existsSync(path.join(ROOT, "favicon.svg"))) {
  pass("Verified vector emblem: favicon.svg");
} else {
  fail("favicon.svg", "Missing favicon.svg");
}

// 5. Write GitHub Actions Step Summary if available
if (process.env.GITHUB_STEP_SUMMARY) {
  const lines = [
    "## 🐦 Tactical Catalyst — Portfolio CI Audit",
    "",
    `| Status | Check |`,
    `| :--- | :--- |`,
    ...checks.map((c) => `| ${c.status === "PASS" ? "✅ PASS" : "❌ FAIL"} | ${c.label}${c.detail ? ` — *${c.detail}*` : ""} |`),
    ""
  ];
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n"));
}

if (errors.length > 0) {
  console.error(`\nPortfolio validation failed with ${errors.length} error(s).`);
  process.exit(1);
} else {
  console.log(`\nAll ${checks.length} portfolio quality & brand checks passed!`);
}
